import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { signToken } from "../utils/token";
import { setAuthCookie, clearAuthCookie } from "../utils/cookie";
import { validatePassword } from "../utils/password";

// Small helper so every success response returns the user in the same shape
// (never leak the password hash back to the client).
export function publicUser(user: IUser) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name || user.username,
    about: user.about,
    avatar: user.avatar,
  };
}

// POST /api/auth/signup
export async function signup(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Basic username sanity check before hitting the DB (the model enforces the
    // same rule, but this gives a friendlier message).
    if (!/^[a-z0-9_]+$/i.test(username) || username.length < 3 || username.length > 20) {
      return res.status(400).json({
        message: "Username must be 3-20 characters: letters, numbers and underscores only.",
      });
    }

    // Enforce password strength.
    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    // Reject duplicates up front with clear, human messages.
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (await User.findOne({ username: username.toLowerCase() })) {
      return res.status(409).json({ message: "That username is already taken." });
    }

    // Password gets hashed by the model's pre-save hook. Display name starts as
    // the username; the user can change it later in their profile.
    const user = await User.create({ username, email, password, name: username });
    // Store the JWT in an httpOnly cookie rather than the response body.
    setAuthCookie(res, signToken({ id: user.id }));

    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    // Fallback for a duplicate slipping through a race between the checks above
    // and the insert — turn Mongo's raw E11000 into a friendly message.
    const e = err as { code?: number; keyPattern?: Record<string, unknown> };
    if (e.code === 11000) {
      const field = e.keyPattern && "username" in e.keyPattern ? "username" : "email";
      const message =
        field === "username"
          ? "That username is already taken."
          : "An account with this email already exists.";
      return res.status(409).json({ message });
    }
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Use the same message whether the email or the password is wrong, so we
    // don't reveal which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    setAuthCookie(res, signToken({ id: user.id }));
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/auth/logout — clears the auth cookie.
export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out." });
}

// POST /api/auth/forgot-password
// No email verification in this app, so this just confirms the account exists.
// The frontend then sends the user to the reset screen.
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    return res.json({ message: "Account found. You can reset your password." });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/auth/reset-password
// Sets a new password for the account with the given email.
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // Assigning + save() triggers the pre-save hook, so the new value is hashed.
    user.password = password;
    await user.save();

    return res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// GET /api/auth/me  (requires auth middleware)
// Returns the currently logged-in user based on their token.
export async function getMe(req: Request, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}
