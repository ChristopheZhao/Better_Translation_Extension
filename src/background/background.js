// background/background.js

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化设置
  chrome.storage.sync.set({
      autoTranslate: false,
      showOriginal: 'hover'
  });
  
  // 添加页面翻译菜单
  chrome.contextMenus.create({
      id: "translatePage",
      title: "翻译此页面",
      contexts: ["page"]
  });

  // 添加选中文本翻译菜单
  chrome.contextMenus.create({
      id: "translateSelection",
      title: "翻译选中文本",
      contexts: ["selection"]  // 只在选中文本时显示
  });
});

// 发送消息并处理响应的通用函数
function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
          console.error('Message sending failed:', {
              error: chrome.runtime.lastError.message,  // 获取错误消息
              tabId,
              message
          });
          return;
      }
      
      if (response) {
          if (response.success) {
              console.log('Translation successful');
          } else {
              console.error('Translation failed:', response.error);
          }
      }
  });
}


// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {

  console.log('Menu clicked:', info.menuItemId);

  if (!tab || !tab.id) {
      console.error('No valid tab');
      return;
  }

  if (info.menuItemId === "translatePage") {
      sendMessageToTab(tab.id, { 
          action: "translate" 
      });
  }
  else if (info.menuItemId === "translateSelection") {
      if (!info.selectionText) {
          console.error('No text selected');
          return;
      }
      
      console.log('Selected text:', info.selectionText);

      sendMessageToTab(tab.id, { 
          action: "translateSelection",
          text: info.selectionText
      });
  }
});

// 监听标签页更新事件，处理自动翻译
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
      // 使用 chrome.storage.sync.get 检查设置
      chrome.storage.sync.get({
          autoTranslate: false
      }, (settings) => {
          if (chrome.runtime.lastError) {
              console.error('Failed to get settings:', chrome.runtime.lastError);
              return;
          }

          if (settings.autoTranslate) {
              const isMedium = tab.url.includes('medium.com');
              if (isMedium) {
                  sendMessageToTab(tabId, { 
                      action: "translate" 
                  });
              }
          }
      });
  }
});

// 错误处理函数
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  // 这里可以添加错误报告逻辑
}

// 监听来自内容脚本的错误
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'error') {
      handleError(message.error, message.context);
      sendResponse({ received: true });
  }
});