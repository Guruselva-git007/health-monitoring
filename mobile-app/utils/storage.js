import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "hm_token";
const USER_KEY = "hm_user";
const QUEUE_KEY = "hm_offline_queue";
const LANGUAGE_KEY = "hm_language";

export const saveAuth = async ({ token, user }) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

export const loadAuth = async () => {
  const [token, userRaw] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  return {
    token: token[1],
    user: userRaw[1] ? JSON.parse(userRaw[1]) : null,
  };
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const loadQueue = async () => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveQueue = async (queue) => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const appendQueue = async (item) => {
  const queue = await loadQueue();
  queue.push(item);
  await saveQueue(queue);
  return queue;
};

export const saveLanguage = async (lang) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export const loadLanguage = async () => AsyncStorage.getItem(LANGUAGE_KEY);
