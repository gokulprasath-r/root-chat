import { Request, Response } from "express";
import { User } from "../models/User";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { publicUser } from "./authController";
import { clearAuthCookie } from "../utils/cookie";
import { cloudinary, cloudinaryConfigured } from "../config/cloudinary";

// GET /api/users/search?username=exact_name
// Finds a user by their exact (case-insensitive) username, so people can start a
// new chat by searching. Never returns the person searching.
export async function searchUser(req: Request, res: Response) {
  try {
    const username = String(req.query.username || "")
      .trim()
      .toLowerCase();

    if (!username) {
      return res.status(400).json({ message: "Please enter a username to search." });
    }

    const user = await User.findOne({ username });
    if (!user || user.id === req.userId) {
      return res.status(404).json({ message: "No user found with that username." });
    }

    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// PUT /api/users/me — update the logged-in user's profile (name, about, username).
export async function updateProfile(req: Request, res: Response) {
  try {
    const { name, about, username } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (typeof name === "string") user.name = name.trim();
    if (typeof about === "string") user.about = about.trim();

    // Username changes must stay unique and valid.
    if (typeof username === "string" && username.toLowerCase() !== user.username) {
      const clean = username.trim().toLowerCase();
      if (!/^[a-z0-9_]+$/.test(clean) || clean.length < 3 || clean.length > 20) {
        return res.status(400).json({
          message: "Username must be 3-20 characters: letters, numbers and underscores only.",
        });
      }
      const taken = await User.findOne({ username: clean });
      if (taken) return res.status(409).json({ message: "That username is already taken." });
      user.username = clean;
    }

    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/users/me/avatar  { image: dataUrl }
// Uploads a base64 image to Cloudinary and stores the resulting URL.
export async function updateAvatar(req: Request, res: Response) {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(503).json({ message: "Image uploads aren't configured on the server." });
    }

    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "No image provided." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Store all avatars in one folder, keyed by user id (overwrites the old one).
    const result = await cloudinary.uploader.upload(image, {
      folder: "root/avatars",
      public_id: String(user._id),
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    user.avatar = result.secure_url;
    await user.save();

    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// DELETE /api/users/me — permanently delete the account and everything tied to it.
export async function deleteAccount(req: Request, res: Response) {
  try {
    const me = req.userId!;

    // Find the user's conversation ids first, then run all deletions in parallel
    // (one round-trip instead of several) so the response comes back quickly.
    const convos = await Conversation.find({ participants: me }).select("_id").lean();
    const convIds = convos.map((c) => c._id);

    const [, , user] = await Promise.all([
      Message.deleteMany({ conversation: { $in: convIds } }),
      Conversation.deleteMany({ _id: { $in: convIds } }),
      User.findByIdAndDelete(me),
    ]);

    clearAuthCookie(res);
    res.json({ message: "Account deleted." });

    // Fire-and-forget the profile-picture cleanup so it never delays the response
    // (only if the user actually had an uploaded avatar).
    if (user?.avatar && cloudinaryConfigured()) {
      cloudinary.uploader.destroy(`root/avatars/${me}`).catch(() => undefined);
    }
  } catch {
    if (!res.headersSent) res.status(500).json({ message: "Something went wrong." });
  }
}
