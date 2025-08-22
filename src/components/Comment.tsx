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