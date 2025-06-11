// 引入 React（因为这是一个 JSX 编写的 React 组件）
import React from 'react';

// 定义 Button 组件，接收三个 props：icon（图标）、href（链接）、children（按钮文字）
const Button = ({ icon, href, children }) => (
  // 渲染一个 <button> 元素，但里面用了 href，其实应该用 <a> 标签更合适
  <button
    href={href} // ❗️注意：button 标签不支持 href，应使用 <a> 或 onClick 实现跳转
    className="
      flex items-center gap-2 px-6 py-2 rounded-md 
      bg-[#2D8E0A] text-white shadow-md cursor-pointer font-bold no-underline 
      hover:no-underline hover:scale-105 hover:shadow-lg active:scale-100 
      transition duration-150 ease-in-out
    "
  >
    {/* 显示传入的图标 */}
    {icon} 
    
    {/* 显示按钮文字，并确保没有下划线 */}
    <span className="text-white no-underline">{children}</span>
  </button>
);

// 导出 Button 组件，供其他文件导入使用
export { Button };