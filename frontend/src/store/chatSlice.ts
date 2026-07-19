import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api";

export type ChatUser = {
  id: string;
  username: string;
  name: string;
  about: string;
  avatar: string;
};
export type Conversation = {
  id: string;
  user: ChatUser;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};
export type Message = { id: string; text: string; senderId: string; createdAt: string };

type SearchStatus = "idle" | "loading" | "found" | "notfound";

type ChatState = {
  meId: string | null;
  conversations: Conversation[];
  activeId: string | null;
  messages: Record<string, Message[]>;
  search: { status: SearchStatus; result: ChatUser | null };
  onlineUserIds: string[];
};

const initialState: ChatState = {
  meId: null,
  conversations: [],
  activeId: null,
  messages: {},
  search: { status: "idle", result: null },
  onlineUserIds: [],
};

// --- Thunks ---

export const fetchConversations = createAsyncThunk("chat/fetchConversations", () =>
  apiRequest<{ conversations: Conversation[] }>("/conversations"),
);

export const searchUser = createAsyncThunk(
  "chat/searchUser",
  async (username: string, { rejectWithValue }) => {
    try {
      return await apiRequest<{ user: ChatUser }>(
        `/users/search?username=${encodeURIComponent(username)}`,
      );
    } catch {
      return rejectWithValue(null);
    }
  },
);

export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async (userId: string, { dispatch }) => {
    const { conversation } = await apiRequest<{ conversation: Conversation }>("/conversations", {
      method: "POST",
      body: { userId },
    });
    dispatch(fetchMessages(conversation.id));
    return conversation;
  },
);

export const fetchMessages = createAsyncThunk("chat/fetchMessages", async (convId: string) => {
  const data = await apiRequest<{ messages: Message[] }>(`/conversations/${convId}/messages`);
  return { convId, messages: data.messages };
});

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ convId, text }: { convId: string; text: string }) =>
    apiRequest<{ conversationId: string; message: Message }>(`/conversations/${convId}/messages`, {
      method: "POST",
      body: { text },
    }),
);

// Tell the server we've read this chat (resets unread server-side too).
export const markRead = createAsyncThunk("chat/markRead", async (convId: string) => {
  await apiRequest(`/conversations/${convId}/read`, { method: "POST" });
  return convId;
});

// Clear + remove the chat from our list.
export const clearChat = createAsyncThunk("chat/clearChat", async (convId: string) => {
  await apiRequest(`/conversations/${convId}/messages`, { method: "DELETE" });
  return convId;
});

function bumpConversation(state: ChatState, convId: string, text: string, at: string) {
  const idx = state.conversations.findIndex((c) => c.id === convId);
  if (idx === -1) return;
  const conv = state.conversations[idx];
  conv.lastMessage = text;
  conv.lastMessageAt = at;
  state.conversations.splice(idx, 1);
  state.conversations.unshift(conv);
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMe(state, action: PayloadAction<string>) {
      state.meId = action.payload;
    },
    setActive(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload;
      // Opening a chat clears its unread badge.
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) conv.unread = 0;
    },
    clearSearch(state) {
      state.search = { status: "idle", result: null };
    },
    // Called from the socket when a message arrives (either direction).
    messageReceived(state, action: PayloadAction<{ conversationId: string; message: Message }>) {
      const { conversationId, message } = action.payload;
      const list = state.messages[conversationId] ?? [];
      if (!list.some((m) => m.id === message.id)) {
        state.messages[conversationId] = [...list, message];
      }
      bumpConversation(state, conversationId, message.text, message.createdAt);
      // Bump unread when it's an incoming message for a chat we're not looking at.
      if (message.senderId !== state.meId && conversationId !== state.activeId) {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) conv.unread += 1;
      }
    },
    presenceState(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = action.payload;
    },
    presenceUpdate(state, action: PayloadAction<{ userId: string; online: boolean }>) {
      const { userId, online } = action.payload;
      const has = state.onlineUserIds.includes(userId);
      if (online && !has) state.onlineUserIds.push(userId);
      if (!online && has) state.onlineUserIds = state.onlineUserIds.filter((id) => id !== userId);
    },
    resetChat() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload.conversations;
    });

    builder.addCase(searchUser.pending, (state) => {
      state.search = { status: "loading", result: null };
    });
    builder.addCase(searchUser.fulfilled, (state, action) => {
      state.search = { status: "found", result: action.payload.user };
    });
    builder.addCase(searchUser.rejected, (state) => {
      state.search = { status: "notfound", result: null };
    });

    builder.addCase(startConversation.fulfilled, (state, action) => {
      const conv = action.payload;
      if (!state.conversations.some((c) => c.id === conv.id)) {
        state.conversations.unshift(conv);
      }
      state.activeId = conv.id;
      state.search = { status: "idle", result: null };
    });

    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages[action.payload.convId] = action.payload.messages;
    });

    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { conversationId, message } = action.payload;
      const list = state.messages[conversationId] ?? [];
      if (!list.some((m) => m.id === message.id)) {
        state.messages[conversationId] = [...list, message];
      }
      bumpConversation(state, conversationId, message.text, message.createdAt);
    });

    builder.addCase(markRead.fulfilled, (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) conv.unread = 0;
    });

    // Clearing removes the chat from the list entirely.
    builder.addCase(clearChat.fulfilled, (state, action) => {
      const convId = action.payload;
      state.conversations = state.conversations.filter((c) => c.id !== convId);
      delete state.messages[convId];
      if (state.activeId === convId) state.activeId = null;
    });
  },
});

export const {
  setMe,
  setActive,
  clearSearch,
  messageReceived,
  presenceState,
  presenceUpdate,
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
