// content/content.js
const translator = new PageTranslator();

function getSelectedTextWithFormat() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';

  const range = selection.getRangeAt(0);
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());
  
  function processNode(node, isFirst = true) {
      // 如果是文本节点，直接返回内容
      if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
      }
      
      let text = '';
      
      // 只对元素节点获取样式
      if (node.nodeType === Node.ELEMENT_NODE) {
          const style = window.getComputedStyle(node);
          const isBlock = style.display === 'block' || 
                        style.display === 'flex' ||
                        node.tagName === 'P' || 
                        node.tagName === 'DIV';
          
          // 如果是块级元素且不是第一个，添加换行
          if (isBlock && !isFirst) {
              text += '\n\n';
          }
      }
      
      // 处理所有子节点
      if (node.childNodes && node.childNodes.length > 0) {
          Array.from(node.childNodes).forEach((child, index) => {
              text += processNode(child, index === 0);
          });
      }
      
      return text;
  }
  
  // 处理并返回文本
  return processNode(container)
      .replace(/\s*\n\s*/g, '\n')  // 清理换行符周围的空白
      .replace(/\n{3,}/g, '\n\n')  // 最多保留两个连续换行符
      .trim();
}
// 监听来自popup和background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  console.log('Received message:', request);
  
  if (request.action === 'translate') {
    translator.translatePage()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  else if (request.action === 'translateSelection') {

    console.log('Selected text to translate:', request.text);

    const textWithFormat = getSelectedTextWithFormat();
    console.log('Selected text with format:', textWithFormat);

    (async () => {
      try {
        const translatedText = await translationAPI.translate(textWithFormat);

        console.log('Translated text:', translatedText);

        const popup = translator.ui.createTranslationPopup(
          textWithFormat,   
          translatedText, 
          translator.lastClickEvent || {
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2,
            pageX: window.pageXOffset + window.innerWidth / 2,
            pageY: window.pageYOffset + window.innerHeight / 2
          }
        );
          
        // 处理复制功能
        popup.querySelector('.copy-btn').onclick = () => {
          navigator.clipboard.writeText(translatedText);
          const btn = popup.querySelector('.copy-btn');
          const originalText = btn.textContent;
          btn.textContent = '已复制';
          btn.style.backgroundColor = '#e8f0fe';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
          }, 1500);
        };
          
        // 处理关闭功能
        popup.querySelector('.close-btn').onclick = () => {
          popup.style.opacity = '0';
          popup.style.transform = 'translateY(10px)';
          setTimeout(() => popup.remove(), 200);
        };
          
        // 自动关闭定时器
        setTimeout(() => {
          if (popup.parentElement) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(10px)';
            setTimeout(() => popup.remove(), 200);
          }
        }, 10000);

        // 发送响应
        sendResponse({ success: true });
      } catch (error) {
        console.error('Translation error:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
});

// 记录鼠标事件（同时监听右键和左键点击）
document.addEventListener('mousedown', (event) => {
  console.log('Mouse up event recorded:', event);
  translator.lastClickEvent = event;
});

document.addEventListener('mouseup', (event) => {
  console.log('Mouse up event recorded:', event);
  translator.lastClickEvent = event;
});

// 检查自动翻译设置
async function checkAutoTranslate() {
  try {
    const settings = await storageManager.getSettings();
    if (settings.autoTranslate) {
      const hostname = window.location.hostname;
      if (hostname.includes('medium.com')) {
        await translator.translatePage();
      }
    }
  } catch (error) {
    console.error('Auto translation check failed:', error);
  }
}

checkAutoTranslate();