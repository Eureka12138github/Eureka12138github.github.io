// site/src/components/Comment/Comment.tsx
import React, { useEffect, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'

export default function Comment(): JSX.Element {
  return (
    <div style={{ marginTop: '2rem' }}>
      <BrowserOnly fallback={<div style={{ minHeight: '200px' }}>加载评论中...</div>}>
        {() => {
          const { useThemeConfig } = require('@docusaurus/theme-common')
          const { useLocation } = require('@docusaurus/router')
          const Giscus = require('@giscus/react').default
          
          const themeConfig = useThemeConfig()
          const location = useLocation()

          // 修改页面类型检查，适配你的博客路径格式
          // 检查是否为博客文章页面：/blog/文章标题
          const isBlogPostPage = /^\/blog\/[^/]+$/.test(location.pathname) || 
                                (/^\/blog\//.test(location.pathname) && !/^\/blog\/?$/.test(location.pathname) && location.pathname.split('/').length === 3);
          
          const isDocPage = location.pathname.startsWith('/docs/');
          
          // 调试信息，可以帮助你确认路径匹配
          console.log('Current path:', location.pathname);
          console.log('Is blog post page:', isBlogPostPage);
          console.log('Is doc page:', isDocPage);
          
          // 如果不是博客文章页面或文档页面，不显示评论
          if (!isBlogPostPage && !isDocPage) {
            return <div></div>; // 返回空内容，不显示评论
          }

          const giscus: any = { ...themeConfig.giscus }

          if (!giscus.repo || !giscus.repoId || !giscus.categoryId) {
            return (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'red' }}>
                评论系统配置缺失
              </div>
            )
          }

          // 处理路径
          const path = location.pathname.replace(/^\/|\/$/g, '');
          const subPath = path || "index";
          giscus.term = subPath;

          // 主题监听组件
          const GiscusWithThemeListener = () => {
            const [theme, setTheme] = useState('light');

            useEffect(() => {
              const updateTheme = () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                setTheme(currentTheme === 'dark' ? 'transparent_dark' : 'light');
              };

              // 初始化
              updateTheme();

              // 监听主题变化
              const observer = new MutationObserver(() => {
                updateTheme();
              });

              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
              });

              return () => observer.disconnect();
            }, []);

            return <Giscus {...giscus} theme={theme} />;
          };

          return <GiscusWithThemeListener />;
        }}
      </BrowserOnly>
    </div>
  )
}