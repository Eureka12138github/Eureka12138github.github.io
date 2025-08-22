// src/theme/BlogPostPage/index.tsx
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof BlogPostPage>;

export default function BlogPostPageWrapper(props: Props): JSX.Element {
  // 只包装，不添加评论
  return <BlogPostPage {...props} />;
}