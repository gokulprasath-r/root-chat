import mongoose, { Schema, Document, Types } from "mongoose";

// A 1-to-1 conversation between two users.
// - `clearedAt`  : per-user cutoff — messages older than this are hidden for them.
// - `deletedFor` : users who removed the chat from their list (it comes back on
//                  the next message).
// - `lastReadAt` : per-user "last read" time, used to compute unread counts.
export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage: string;
  lastMessageAt: Date;
  clearedAt: Map<string, Date>;
  deletedFor: Types.ObjectId[];
  lastReadAt: Map<string, Date>;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    clearedAt: { type: Map, of: Date, default: {} },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastReadAt: { type: Map, of: Date, default: {} },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
