class StorageManager {
    async getSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get({
          // 默认设置
          autoTranslate: false,
          showOriginal: 'hover',
          serviceUrl: 'http://127.0.0.1:8000'
        }, (items) => {
          resolve(items);
        });
      });
    }
  
    async saveSettings(settings) {
      return new Promise((resolve) => {
        chrome.storage.sync.set(settings, () => {
          resolve();
        });
      });
    }
  }
  
  const storageManager = new StorageManager();