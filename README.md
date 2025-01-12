# Better Translator Chrome Extension

Better Translator 的 Chrome 扩展前端，提供便捷的网页翻译功能。

## 功能特点

- 整页翻译功能
- 选中文本快速翻译
- 悬停显示原文
- 可拖动的翻译结果窗口
- 自动识别并翻译特定网站
- 简洁美观的用户界面
- 支持快捷键操作

## 安装说明

### 开发模式安装

1. 克隆仓库：
\```bash
git clone https://github.com/yourusername/better-translator.git
cd better-translator/extension
\```

2. 在 Chrome 中加载扩展：
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `extension` 目录

### 使用前准备

1. 确保后端服务已启动（参见后端文档）
2. 第一次使用时，点击扩展图标进行配置：
   - 确认后端服务连接状态
   - 设置自动翻译选项
   - 设置显示原文方式

## 使用说明

### 基本功能

1. 整页翻译：
   - 点击扩展图标
   - 点击"翻译此页面"按钮
   - 或使用右键菜单中的"翻译此页面"选项

2. 选中文本翻译：
   - 选中要翻译的文本
   - 点击右键菜单中的"翻译选中文本"
   - 在弹出窗口中查看翻译结果

3. 查看原文：
   - 鼠标悬停在翻译后的文本上
   - 原文将在悬浮提示中显示

### 快捷功能

- 翻译窗口可以拖动
- 点击复制按钮快速复制译文
- 展开/收起原文显示
- 自动记忆翻译设置

## 开发指南

### 项目结构
\```
extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/
│   ├── content.js
│   ├── translator.js
│   └── styles.css
├── utils/
│   ├── api.js
│   └── storage.js
└── background/
    └── background.js
\```

### 本地开发

1. 修改代码后刷新扩展：
   - 在扩展管理页面点击刷新按钮
   - 或重新加载扩展

2. 调试方法：
   - 使用 Chrome 开发者工具
   - 查看后台页面和内容脚本的控制台输出
   - 使用断点调试

## 注意事项

1. 确保后端服务正常运行
2. 检查网络连接状态
3. 注意跨域请求的限制
4. 关注控制台错误信息

## 许可证

MIT License