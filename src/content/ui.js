class TranslationUI { 
  constructor() {
      this.progressBar = null;
      this.tooltip = null;
  }

  createProgressBar() {
      const div = document.createElement('div');
      div.className = 'translation-progress';
      div.innerHTML = `
          <div class="progress-inner">
              <div class="progress-bar"></div>
          </div>
          <div class="progress-text">翻译中...</div>
      `;
      document.body.appendChild(div);
      this.progressBar = div;
  }

  updateProgress(percent) {
      if (this.progressBar) {
          const bar = this.progressBar.querySelector('.progress-bar');
          bar.style.width = `${percent}%`;
      }
  }

  removeProgress() {
      if (this.progressBar) {
          this.progressBar.remove();
          this.progressBar = null;
      }
  }

  showTooltip(text, element) {
      if (!this.tooltip) {
          this.tooltip = document.createElement('div');
          this.tooltip.className = 'translation-tooltip';
          document.body.appendChild(this.tooltip);
      }

      const rect = element.getBoundingClientRect();
      this.tooltip.textContent = text;
      this.tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      this.tooltip.style.left = `${rect.left + window.scrollX}px`;
      this.tooltip.style.display = 'block';
  }

  hideTooltip() {
      if (this.tooltip) {
          this.tooltip.style.display = 'none';
      }
  }

  createTranslationPopup(text, translatedText, event) {
      const popup = document.createElement('div');
      popup.className = 'translation-popup show'; // 添加 'show' 类以触发动画

      // 转义特殊字符
      const escapeHtml = (str) => str.replace(/[&<>"']/g, char => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
      })[char]);

      const sanitizedText = escapeHtml(text);
      const sanitizedTranslatedText = escapeHtml(translatedText)
          .split('\n')
          .join('<br>');

      popup.innerHTML = `
          <div class="popup-header">
              翻译结果
              <div class="popup-drag-handle">⋮⋮</div>
              <button class="popup-close">×</button>
          </div>
          <div class="content-container">
              <div class="original-text">
                  <div class="text-label">原文</div>
                  <div class="text-content text-ellipsis" title="${sanitizedText}">
                      <span>${sanitizedText}</span>
                      <button class="expand-btn">展开</button>
                  </div>
              </div>
              <div class="translated-text">
                  <div class="text-label">译文</div>
                  <div class="text-content" title="${sanitizedTranslatedText}">
                      <span>${sanitizedTranslatedText}</span>
                      <!-- 译文部分不包含展开按钮 -->
                  </div>
              </div>
          </div>
          <div class="actions">
              <button class="copy-btn">复制译文</button>
          </div>
      `;
      
      document.body.appendChild(popup);

      // 设置位置
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const popupRect = popup.getBoundingClientRect();

      let top = event.clientY + 10;
      let left = event.clientX - (popupRect.width / 2);

      // 边界检查
      if (left + popupRect.width > viewportWidth - 10) {
          left = viewportWidth - popupRect.width - 10;
      }
      if (left < 10) {
          left = 10;
      }
      if (top + popupRect.height > viewportHeight - 10) {
          top = event.clientY - popupRect.height - 10;
      }
      if (top < 10) {
          top = 10;
      }

      // 设置位置
      popup.style.position = 'fixed';
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.opacity = '1';

      // 添加拖动功能
      this.setupDragging(popup);

      // 添加展开/收起功能（仅适用于原文部分）
      this.setupExpandCollapse(popup);

      // 添加复制功能
      this.setupCopyButton(popup, translatedText);

      // 添加关闭功能
      this.setupCloseButton(popup);

      // 添加点击弹窗外区域关闭弹窗功能
      this.setupOutsideClick(popup);

      // 添加键盘快捷键支持
      this.setupKeyboardShortcuts(popup);

      return popup;
  }

  setupDragging(popup) {
      let isDragging = false;
      let initialX, initialY;

      const header = popup.querySelector('.popup-header');

      header.addEventListener('mousedown', (e) => {
          if (e.target.closest('.popup-close')) return; // 防止点击关闭按钮时触发拖动
          isDragging = true;
          initialX = e.clientX - popup.offsetLeft;
          initialY = e.clientY - popup.offsetTop;
          header.style.cursor = 'grabbing';
      });

      const moveHandler = (e) => {
          if (!isDragging) return;

          e.preventDefault();
          let newX = e.clientX - initialX;
          let newY = e.clientY - initialY;

          // 边界检查
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const popupRect = popup.getBoundingClientRect();

          newX = Math.max(10, Math.min(newX, viewportWidth - popupRect.width - 10));
          newY = Math.max(10, Math.min(newY, viewportHeight - popupRect.height - 10));

          popup.style.left = `${newX}px`;
          popup.style.top = `${newY}px`;
      };

      const upHandler = () => {
          isDragging = false;
          header.style.cursor = 'grab';
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
  }

  setupExpandCollapse(popup) {
      const expandButtons = popup.querySelectorAll('.original-text .expand-btn');

      expandButtons.forEach((expandBtn) => {
          const textContent = expandBtn.previousElementSibling; // 获取 <span> 元素
          expandBtn.addEventListener('click', (event) => {
              event.stopPropagation(); // 防止触发其他事件
              const isExpanded = textContent.classList.toggle('text-expanded');
              expandBtn.textContent = isExpanded ? '收起' : '展开';

              // 可选：自动调整弹窗位置以适应展开后的内容
              if (isExpanded) {
                  const popupRect = popup.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  if (popupRect.bottom > viewportHeight - 10) {
                      const newTop = Math.max(10, viewportHeight - popupRect.height - 10);
                      popup.style.top = `${newTop}px`;
                  }
              }
          });
      });
  }

  setupCopyButton(popup, translatedText) {
      const copyBtn = popup.querySelector('.copy-btn');
      if (copyBtn) {
          copyBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(translatedText)
                  .then(() => {
                      copyBtn.textContent = '已复制';
                      copyBtn.style.backgroundColor = '#e8f0fe';
                      setTimeout(() => {
                          copyBtn.textContent = '复制译文';
                          copyBtn.style.backgroundColor = '';
                      }, 1500);
                  })
                  .catch(() => {
                      copyBtn.textContent = '复制失败';
                      copyBtn.style.backgroundColor = '#ffcccc';
                      setTimeout(() => {
                          copyBtn.textContent = '复制译文';
                          copyBtn.style.backgroundColor = '';
                      }, 1500);
                  });
          });
      } else {
          console.error('Copy button not found in the popup.');
      }
  }

  setupCloseButton(popup) {
      const closeBtn = popup.querySelector('.popup-close');
      if (closeBtn) {
          closeBtn.addEventListener('click', () => {
              popup.classList.remove('show');
              // 等待动画结束后移除元素
              setTimeout(() => {
                  popup.remove();
              }, 200); // 与 CSS transition 时间一致
          });
      } else {
          console.error('Close button not found in the popup.');
      }
  }

  setupOutsideClick(popup) {
      const handleClickOutside = (event) => {
          if (!popup.contains(event.target)) {
              popup.classList.remove('show');
              setTimeout(() => {
                  popup.remove();
              }, 200); // 与 CSS transition 时间一致
              document.removeEventListener('click', handleClickOutside);
          }
      };
      document.addEventListener('click', handleClickOutside);
  }

  setupKeyboardShortcuts(popup) {
      const handleKeyDown = (event) => {
          if (event.key === 'Escape') {
              popup.classList.remove('show');
              setTimeout(() => {
                  popup.remove();
              }, 200); // 与 CSS transition 时间一致
              document.removeEventListener('keydown', handleKeyDown);
          }
      };
      document.addEventListener('keydown', handleKeyDown);
  }
}

window.TranslationUI = TranslationUI;
