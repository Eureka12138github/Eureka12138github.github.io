import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import type { WrapperProps } from '@docusaurus/types';
import Comment from '@site/src/components/Comment';

type Props = WrapperProps<typeof BlogPostItem>;

export default function BlogPostItemWrapper(props: Props): JSX.Element {
  const { children, ...otherProps } = props;
  
  return (
    <BlogPostItem {...otherProps}>
      {children}
      <div className="blog-post-comments" style={{ 
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--ifm-color-emphasis-300)'
      }}>
        <Comment />
      </div>
    </BlogPostItem>
  );
}