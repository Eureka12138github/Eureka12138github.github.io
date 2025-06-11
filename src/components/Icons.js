// 引入 React，因为这些是使用 JSX 编写的 React 组件
import React from 'react';

// 定义一个 WeChat 图标组件，使用一张本地图片作为图标
const IconWechat = () => (
  <img src="/docs/stm32/getting-started/img/plugTypec.png" alt="WeChat" />
);

// 定义一个 Shopping Bag 图标组件，使用另一张本地图片作为图标
const IconShoppingBag = () => (
  <img src="\docs\stm32\getting-started\img\stlink.jpg" alt="Shopping Bag" />
);

// 使用 Emoji 表情符号作为图标的简单替代方案

// 下载图标
const IconDownload = () => <span>📥</span>;

// 书籍图标（常用于教程或文档）
const IconBook = () => <span>📖</span>;

// 帮助图标
const IconHelpCircle = () => <span>❓</span>;

// 代码图标
const IconCode = () => <span>💻</span>;

// 导出所有图标组件，供其他文件导入和使用
export {
  IconWechat,
  IconShoppingBag,
  IconDownload,
  IconBook,
  IconHelpCircle,
  IconCode
};
//这段代码创建了一组图标组件，有的基于本地图片，有的基于 Emoji，用于在 Docusaurus 文档中统一显示功能图标，提升用户体验和视觉一致性。