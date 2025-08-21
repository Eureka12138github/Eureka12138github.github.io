import React from 'react'
import { useThemeConfig, useColorMode } from '@docusaurus/theme-common'
import Giscus, { GiscusProps } from '@giscus/react'
import { useLocation } from '@docusaurus/router';

// 默认 Giscus 配置项
const defaultConfig: Partial<GiscusProps> = {
  id: 'comments',
  mapping: 'specific',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  loading: 'lazy',
  strict: '1', // 使用根据路径标题自动生成的 sha1 值，精确匹配 github discussion，避免路径重叠时评论加载错误
  lang: 'zh-CN',
}

export default function Comment(): JSX.Element {
  const themeConfig = useThemeConfig()
  const { colorMode } = useColorMode()
  const location = useLocation()

  // 合并默认配置和用户配置
  const giscus = { ...defaultConfig, ...themeConfig.giscus }

  // 验证必要配置项是否存在
  if (!giscus.repo || !giscus.repoId || !giscus.categoryId) {
    throw new Error(
      '评论系统配置缺失：请在 `themeConfig.giscus` 中提供 `repo`、`repoId` 和 `categoryId` 参数。',
    )
  }

  // 处理路径，生成评论标识符(term)
  // 移除首尾斜杠，并提取子路径作为评论标识符
  const path = location.pathname.replace(/^\/|\/$/g, '');
  const firstSlashIndex = path.indexOf('/');
  
  // 根据路径结构确定评论标识符
  const subPath = firstSlashIndex !== -1 
    ? path.substring(firstSlashIndex + 1) 
    : "index";

  // 设置评论标识符和主题
  giscus.term = subPath;
  giscus.theme = colorMode === 'dark' ? 'transparent_dark' : 'light';

  return (
    <Giscus {...giscus} />
  )
}