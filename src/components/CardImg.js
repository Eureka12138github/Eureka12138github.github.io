// 引入 React 基础库
import React from 'react';

// 图片点击放大查看功能（支持手势缩放、滚轮放大等）
import { PhotoProvider, PhotoView } from 'react-photo-view';

// 图片懒加载组件，提升页面性能（只在图片进入视口时才加载）
import Lazyimg from 'react-lazyimg-component';

// Docusaurus 提供的 BrowserOnly 组件，确保某些代码仅在浏览器中执行，避免 SSR 报错
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * 📸 卡片式图片展示组件 CardImg
 *
 * 功能说明：
 * - 支持图片点击放大查看（PhotoView）
 * - 支持图片懒加载（Lazyimg）
 * - 可选居中显示（isCenter）
 * - 可选卡片包裹样式（isBoxed）
 * - 鼠标悬停动画（缩放 + 阴影增强）
 * - 适配亮/暗模式主题（通过 CSS 变量控制颜色）
 *
 * @param {string} src - 图片地址
 * @param {string} alt - 替代文本（用于无障碍访问）
 * @param {boolean} [isCenter=false] - 是否居中显示，默认不居中
 * @param {boolean} [isBoxed=false] - 是否使用卡片包裹，默认不包裹
 */
export default function CardImg({ src, alt, isCenter = false, isBoxed = false }) {
  return (
    // 使用 <BrowserOnly> 包裹依赖浏览器环境的组件
    // 确保该部分代码只在客户端运行，避免服务端渲染时报错：document is not defined
    <BrowserOnly>
      {() => {
        // 定义图片基础样式对象
        const imgStyle = {
          width: '100%',                      // 自适应容器宽度
          maxWidth: '700px',                 // 最大宽度限制为 700px（适合文档阅读体验）
          height: 'auto',                    // 高度自动按比例调整
          cursor: 'zoom-in',                 // 鼠标悬停时显示放大镜图标
          objectFit: 'cover',                // 图片裁剪适配容器，防止变形
          borderRadius: '8px',               // 四角圆角效果
          boxShadow: '0 0 15px rgba(0,0,0,0.1)', // 添加轻微阴影，增强层次感
          transition: 'transform 300ms ease, box-shadow 300ms ease', // 悬停动效过渡
        };

        // 构建图片内容（是否居中）
        const imageContent = isCenter ? (
          // 如果需要居中，则用 <center> 标签包裹
          <center>
            <Lazyimg src={src} alt={alt} style={imgStyle} />
          </center>
        ) : (
          // 否则直接插入图片
          <Lazyimg src={src} alt={alt} style={imgStyle} />
        );

        // 定义卡片外层容器样式（带边框、背景色、阴影等）
        const cardStyle = {
          display: 'inline-block',           // 行内块布局，便于水平排列多个卡片
          padding: '10px',                  // 内边距，给图片留出边距空间
          margin: '10px 0',                 // 上下外边距，避免紧贴其他内容
          borderRadius: '10px',             // 更大的圆角，突出卡片感
          border: '3px solid var(--card-img-border-color)', // 边框颜色由主题变量控制
          backgroundColor: '#f9fbfc',       // 背景色（浅灰蓝），柔和舒适
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // 轻微阴影，增加立体感
          transition: 'all 300ms ease',     // 所有属性都加入动画过渡
          cursor: 'pointer',                // 鼠标悬停时可点击提示
        };

        // 卡片内容（含鼠标悬停动画）
        const cardContent = (
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              // 鼠标进入时：轻微放大 + 阴影变深 + 边框颜色变化
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = 'var(--card-img-hover-border-color)';
            }}
            onMouseLeave={(e) => {
              // 鼠标离开时恢复原状
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'var(--card-img-border-color)';
            }}>
            {/* 图片点击放大功能 */}
            <PhotoProvider maskOpacity={0.6} speed={() => 500}>
              <PhotoView src={src} alt={alt}>
                {imageContent}
              </PhotoView>
            </PhotoProvider>
          </div>
        );

        // 主容器样式（用于控制整体布局）
        const containerStyle = {
          textAlign: 'center', // 默认居中对齐
          margin: '20px 0',   // 上下外边距，让图片与文字之间有空隙
        };

        // 返回最终 JSX 结构
        return (
          <div style={containerStyle}>
            {/* 判断是否使用卡片包裹 */}
            {isBoxed ? (
              // 如果是卡片模式，返回带卡片样式的图片
              cardContent
            ) : (
              // 否则返回无卡片的普通图片
              <PhotoProvider maskOpacity={0.6} speed={() => 500}>
                <PhotoView src={src} alt={alt}>
                  {imageContent}
                </PhotoView>
              </PhotoProvider>
            )}
          </div>
        );
      }}
    </BrowserOnly>
  );
}