import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import type { WrapperProps } from '@docusaurus/types';
import Comment from '@site/src/components/Comment';

type Props = WrapperProps<typeof BlogPostPage>;

export default function BlogPostPageWrapper(props: Props): JSX.Element {
  return (
    <div className="blog-post-page">
      <BlogPostPage {...props} />
      <div className="container margin-vert--lg">
        <Comment />
      </div>
    </div>
  );
}