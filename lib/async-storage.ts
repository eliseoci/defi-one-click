const memory = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  async setItem(key: string, value: string) {
    memory.set(key, value);
  },
  async removeItem(key: string) {
    memory.delete(key);
  },
  async clear() {
    memory.clear();
  },
  async getAllKeys() {
    return Array.from(memory.keys());
  },
};

export default AsyncStorage;
export const { getItem, setItem, removeItem, clear, getAllKeys } = AsyncStorage;
