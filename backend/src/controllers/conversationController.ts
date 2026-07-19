import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { emitToUser } from "../socket";

// Populated participant shape we read after .populate().
type PopulatedUser = {
  _id: unknown;
  username: string;
  name: string;
  about: string;
  avatar: string;
};

type ShapeableConversation = {
  _id: unknown;
  participants: PopulatedUser[];
  lastMessage: string;
  lastMessageAt: Date;
};

// Turn a conversation into the shape the client wants: the *other* participant's
// info, the last message, and the unread count — all relative to `meId`.
function shapeConversation(conv: ShapeableConversation, meId: string, unread = 0) {
  const other = conv.participants.find((p) => String(p._id) !== meId);
  return {
    id: conv._id,
    user: other
      ? {
          id: other._id,
          username: other.username,
          name: other.name || other.username,
          about: other.about,
          avatar: other.avatar,
        }
      : null,
    lastMessage: conv.lastMessage,
    lastMessageAt: conv.lastMessageAt,
    unread,
  };
}

function shapeMessage(msg: { _id: unknown; text: string; sender: unknown; createdAt: Date }) {
  return { id: msg._id, text: msg.text, senderId: String(msg.sender), createdAt: msg.createdAt };
}

const POPULATE = "username name about avatar";

// GET /api/conversations — conversations the user hasn't deleted, with unread counts.
export async function getConversations(req: Request, res: Response) {
  try {
    const me = req.userId!;
    const convos = await Conversation.find({
      participants: me,
      deletedFor: { $ne: me },
    })
      .populate<{ participants: PopulatedUser[] }>("participants", POPULATE)
      .sort({ lastMessageAt: -1 });

    const shaped = await Promise.all(
      convos.map(async (conv) => {
        // Unread = messages from the other person after our last read / clear point.
        const cleared = conv.clearedAt.get(me)?.getTime() ?? 0;
        const read = conv.lastReadAt.get(me)?.getTime() ?? 0;
        const cutoff = new Date(Math.max(cleared, read));
        const unread = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: me },
          createdAt: { $gt: cutoff },
        });
        return shapeConversation(conv as unknown as ShapeableConversation, me, unread);
      }),
    );

    return res.json({ conversations: shaped });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/conversations  { userId } — open (or create) a 1-to-1 chat.
export async function createConversation(req: Request, res: Response) {
  try {
    const me = req.userId!;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required." });
    if (userId === me) {
      return res.status(400).json({ message: "You can't start a chat with yourself." });
    }

    const other = await User.findById(userId);
    if (!other) return res.status(404).json({ message: "User not found." });

    let conv = await Conversation.findOne({
      participants: { $all: [me, userId], $size: 2 },
    });
    if (!conv) {
      conv = await Conversation.create({ participants: [me, userId] });
    } else if (conv.deletedFor.some((id) => String(id) === me)) {
      // Re-opening a chat we previously removed from our list.
      conv.deletedFor = conv.deletedFor.filter((id) => String(id) !== me);
      await conv.save();
    }

    await conv.populate<{ participants: PopulatedUser[] }>("participants", POPULATE);
    return res.json({
      conversation: shapeConversation(conv as unknown as ShapeableConversation, me),
    });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// Guard: load a conversation and make sure the requester is a participant.
async function loadOwnedConversation(convId: string, userId: string) {
  const conv = await Conversation.findById(convId);
  if (!conv) return null;
  if (!conv.participants.some((p) => String(p) === userId)) return null;
  return conv;
}

// GET /api/conversations/:id/messages — messages the user hasn't cleared away.
export async function getMessages(req: Request, res: Response) {
  try {
    const conv = await loadOwnedConversation(req.params.id, req.userId!);
    if (!conv) return res.status(404).json({ message: "Conversation not found." });

    const filter: Record<string, unknown> = { conversation: conv._id };
    const clearedAt = conv.clearedAt.get(req.userId!);
    if (clearedAt) filter.createdAt = { $gt: clearedAt };

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    return res.json({ messages: messages.map(shapeMessage) });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/conversations/:id/messages  { text } — send a message.
export async function sendMessage(req: Request, res: Response) {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Message can't be empty." });

    const conv = await loadOwnedConversation(req.params.id, req.userId!);
    if (!conv) return res.status(404).json({ message: "Conversation not found." });

    const message = await Message.create({ conversation: conv._id, sender: req.userId, text });

    conv.lastMessage = text;
    conv.lastMessageAt = new Date();
    // A new message brings the chat back for anyone who had deleted it.
    conv.deletedFor = [];
    await conv.save();

    const payload = { conversationId: String(conv._id), message: shapeMessage(message) };
    conv.participants.forEach((p) => emitToUser(String(p), "message:new", payload));

    return res.status(201).json(payload);
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// POST /api/conversations/:id/read — mark the conversation read (resets unread).
export async function markRead(req: Request, res: Response) {
  try {
    const conv = await loadOwnedConversation(req.params.id, req.userId!);
    if (!conv) return res.status(404).json({ message: "Conversation not found." });

    conv.lastReadAt.set(req.userId!, new Date());
    await conv.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}

// DELETE /api/conversations/:id/messages — clear + remove the chat from the
// user's list (per-user; the other person keeps their history and the chat).
export async function clearChat(req: Request, res: Response) {
  try {
    const me = req.userId!;
    const conv = await loadOwnedConversation(req.params.id, me);
    if (!conv) return res.status(404).json({ message: "Conversation not found." });

    conv.clearedAt.set(me, new Date());
    if (!conv.deletedFor.some((id) => String(id) === me)) {
      conv.deletedFor.push(conv.participants.find((p) => String(p) === me)!);
    }
    await conv.save();

    return res.json({ message: "Chat cleared." });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
}
