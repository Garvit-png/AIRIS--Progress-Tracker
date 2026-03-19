const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

const getFilePath = (filename) => path.join(DATA_DIR, filename);

const fileStorageService = {
  readJson: async (filename) => {
    try {
      const filePath = getFilePath(filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  },

  writeJson: async (filename, data) => {
    const filePath = getFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  },

  findItems: async (filename, predicate) => {
    const items = await fileStorageService.readJson(filename);
    return items.filter(predicate);
  },

  findItem: async (filename, predicate) => {
    const items = await fileStorageService.readJson(filename);
    return items.find(predicate);
  },

  addItem: async (filename, item) => {
    const items = await fileStorageService.readJson(filename);
    const newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item
    };
    items.push(newItem);
    await fileStorageService.writeJson(filename, items);
    return newItem;
  },

  updateItem: async (filename, id, updates) => {
    const items = await fileStorageService.readJson(filename);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await fileStorageService.writeJson(filename, items);
      return items[index];
    }
    return null;
  },

  removeItem: async (filename, id) => {
    const items = await fileStorageService.readJson(filename);
    const filtered = items.filter(item => item.id !== id);
    await fileStorageService.writeJson(filename, filtered);
    return true;
  }
};

module.exports = fileStorageService;
