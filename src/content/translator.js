// import { translationAPI } from '../utils/api.js';
// import { TranslationUI } from './ui.js';

class PageTranslator {
  constructor() {
    this.ui = new TranslationUI();
    this.translatedNodes = new WeakSet();
    this.lastClickEvent = null;
  }

  getTranslatableNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // 跳过脚本和样式
          if (node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE') {
            return NodeFilter.FILTER_REJECT;
          }
          // 只翻译有实际内容的节点
          return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (!this.translatedNodes.has(node)) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // async translateNode(node) {
  //   const originalText = node.textContent.trim();
  //   if (!originalText) return;

  //   try {
  //     const translatedText = await translationAPI.translate(originalText);
  //     node.textContent = translatedText;
  //     node.setAttribute('data-original-text', originalText);
  //     this.translatedNodes.add(node);

  //     // 添加hover效果
  //     node.parentElement.addEventListener('mouseover', () => {
  //       this.ui.showTooltip(originalText, node.parentElement);
  //     });
  //     node.parentElement.addEventListener('mouseout', () => {
  //       this.ui.hideTooltip();
  //     });
  //   } catch (error) {
  //     console.error('Error translating node:', error);
  //   }
  // }

    async translateNode(node) {
      const originalText = node.textContent.trim();
      if (!originalText) return;

      try {
          const translatedText = await translationAPI.translate(originalText);
          node.textContent = translatedText;
          
          // 将原文存储在父元素上而不是文本节点上
          const parentElement = node.parentElement;
          if (parentElement) {
              parentElement.setAttribute('data-original-text', originalText);
              
              // 添加hover效果
              parentElement.addEventListener('mouseover', () => {
                  this.ui.showTooltip(originalText, parentElement);
              });
              parentElement.addEventListener('mouseout', () => {
                  this.ui.hideTooltip();
              });
          }
          
          this.translatedNodes.add(node);
      } catch (error) {
          console.error('Error translating node:', error);
      }
  }

  async translatePage() {
    const nodes = this.getTranslatableNodes();
    if (!nodes.length) return;

    this.ui.createProgressBar();

    for (let i = 0; i < nodes.length; i++) {
      await this.translateNode(nodes[i]);
      this.ui.updateProgress((i + 1) / nodes.length * 100);
    }

    this.ui.removeProgress();
  }
}

window.PageTranslator = PageTranslator;
