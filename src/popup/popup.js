
class PopupUI {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.loadSettings();
    this.checkServerStatus();
  }

  initElements() {
    this.autoTranslate = document.getElementById('autoTranslate');
    this.showOriginal = document.getElementById('showOriginal');
    this.translatePage = document.getElementById('translatePage');
    this.resetPage = document.getElementById('resetPage');
    this.serverStatus = document.getElementById('serverStatus');
    this.openOptions = document.getElementById('openOptions');
  }

  async bindEvents() {
    // 自动翻译设置
    this.autoTranslate.addEventListener('change', async (e) => {
      await storageManager.saveSettings({
        autoTranslate: e.target.checked
      });
    });

    // 显示原文设置
    this.showOriginal.addEventListener('change', async (e) => {
      await storageManager.saveSettings({
        showOriginal: e.target.checked
      });
    });

    // 翻译当前页面
    this.translatePage.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'translate' });
    });

    // 恢复原文
    this.resetPage.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'reset' });
    });

    // 打开设置页面
    this.openOptions.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  async loadSettings() {
    const settings = await storageManager.getSettings();
    this.autoTranslate.checked = settings.autoTranslate;
    this.showOriginal.checked = settings.showOriginal === 'hover';
  }

  async checkServerStatus() {
    try {
      // 发送一个简单的请求来检查服务是否在运行
      await fetch('http://127.0.0.1:8000/health');
      this.updateServerStatus(true);
    } catch (error) {
      this.updateServerStatus(false);
    }
  }

  updateServerStatus(isActive) {
    const dot = this.serverStatus.querySelector('.status-dot');
    const text = this.serverStatus.querySelector('.status-text');
    
    if (isActive) {
      dot.classList.add('active');
      text.textContent = '服务正常运行';
    } else {
      dot.classList.add('error');
      text.textContent = '服务未运行';
      this.translatePage.disabled = true;
      this.translatePage.title = '请先启动翻译服务';
    }
  }
}

// 初始化UI
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});