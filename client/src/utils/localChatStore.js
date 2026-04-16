const STORAGE_KEY = "ai_doubt_solver_local_meta_v1";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        renamedTitles: {},
        deletedChatIds: [],
        localChats: [],
        localMessages: {},
      };
    }

    const parsed = JSON.parse(raw);

    return {
      renamedTitles: parsed.renamedTitles || {},
      deletedChatIds: parsed.deletedChatIds || [],
      localChats: parsed.localChats || [],
      localMessages: parsed.localMessages || {},
    };
  } catch {
    return {
      renamedTitles: {},
      deletedChatIds: [],
      localChats: [],
      localMessages: {},
    };
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getLocalStore() {
  return readStore();
}

export function applyChatMeta(serverChats = []) {
  const store = readStore();

  const filteredServerChats = serverChats
    .filter((chat) => !store.deletedChatIds.includes(chat._id))
    .map((chat) => ({
      ...chat,
      title: store.renamedTitles[chat._id] || chat.title || "New Chat",
      isLocalOnly: false,
    }));

  const localChats = (store.localChats || [])
    .filter((chat) => !store.deletedChatIds.includes(chat._id))
    .map((chat) => ({
      ...chat,
      title: store.renamedTitles[chat._id] || chat.title || "New Chat",
      isLocalOnly: true,
    }));

  return [...localChats, ...filteredServerChats].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function renameChatLocal(chatId, newTitle) {
  const store = readStore();
  store.renamedTitles[chatId] = newTitle;

  const localChatIndex = store.localChats.findIndex((chat) => chat._id === chatId);
  if (localChatIndex !== -1) {
    store.localChats[localChatIndex].title = newTitle;
    store.localChats[localChatIndex].updatedAt = new Date().toISOString();
  }

  writeStore(store);
}

export function deleteChatLocal(chatId) {
  const store = readStore();

  if (!store.deletedChatIds.includes(chatId)) {
    store.deletedChatIds.push(chatId);
  }

  store.localChats = store.localChats.filter((chat) => chat._id !== chatId);
  delete store.localMessages[chatId];
  delete store.renamedTitles[chatId];

  writeStore(store);
}

export function createLocalChat(title = "New Chat") {
  const store = readStore();

  const newChat = {
    _id: `local_${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLocalOnly: true,
  };

  store.localChats.unshift(newChat);
  store.localMessages[newChat._id] = [];
  writeStore(store);

  return newChat;
}

export function getLocalMessages(chatId) {
  const store = readStore();
  return store.localMessages[chatId] || [];
}

export function saveLocalMessages(chatId, messages) {
  const store = readStore();
  store.localMessages[chatId] = messages;

  const localChatIndex = store.localChats.findIndex((chat) => chat._id === chatId);
  if (localChatIndex !== -1) {
    store.localChats[localChatIndex].updatedAt = new Date().toISOString();

    const firstUserMessage = messages.find((m) => m.sender === "user")?.text;
    if (
      firstUserMessage &&
      (!store.localChats[localChatIndex].title ||
        store.localChats[localChatIndex].title === "New Chat")
    ) {
      store.localChats[localChatIndex].title = firstUserMessage.slice(0, 40);
    }
  }

  writeStore(store);
}

export function mergeServerAndLocalMessages(chatId, serverMessages = []) {
  const localMessages = getLocalMessages(chatId);
  return [...serverMessages, ...localMessages];
}