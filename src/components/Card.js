// 引入 React，因为这是一个使用 JSX 的 React 组件文件
import React from 'react';

// 定义 Card 组件，接收 children 属性（即嵌套在组件中的内容）
const Card = ({ children }) => (
  // 使用 div 模拟一个卡片容器，并通过 style 添加样式
  <div style={{
    border: '0px solid #ddd',      // 边框宽度为 0（无边框），可以按需开启
    borderRadius: '8px',            // 圆角边框
    padding: '1rem',                // 内边距，防止内容贴边
    boxShadow: '0 3px 6px 2px rgba(0, 0, 0, 0.1)', // 添加轻微阴影，提升立体感
    background: 'white'             // 白色背景
  }}>
    {/* 显示传入的内容 */}
    {children}
  </div>
);

// 定义 CardContent 组件，仅用于包裹内容（目前没有添加额外样式）
const CardContent = ({ children }) => (
  // 只是简单地包裹一层 div，可为后续扩展预留空间
  <div>{children}</div>
);

// 导出这两个组件，供其他文件导入使用
export { Card, CardContent };