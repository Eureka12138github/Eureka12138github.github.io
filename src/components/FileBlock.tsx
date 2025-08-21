import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { useLocation } from '@docusaurus/router';
import * as path from 'path-browserify';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// 文件扩展名到语言标识符的映射表
const extToLang = new Map([
  ["sh", "bash"],   // shell 脚本映射为 bash
  ["yml", "yaml"]   // yml 文件映射为 yaml
]);

export default function FileBlock({ 
  file, 
  showFileName, 
  ...otherProps 
}: { 
  file: string; 
  showFileName?: boolean;
  [key: string]: any; // 允许其他属性传递给 CodeBlock
}) {
  // 获取当前页面的路由信息
  const location = useLocation();
  const { i18n } = useDocusaurusContext();

  // 处理 URL 路径，去除首尾的斜杠
  let urlPath = location.pathname.replace(/^\/|\/$/g, '');

  // 如果当前不是默认语言，移除语言前缀
  if (i18n.currentLocale !== i18n.defaultLocale) {
    urlPath = urlPath.replace(/^[^\/]*\/?/g, '');
  }

  // 解析文件路径
  let filepath = "";
  if (file.startsWith("@site/")) {
    // 如果是绝对路径引用，直接使用
    filepath = file.replace(/^@site\//g, '');
  } else {
    // 相对路径引用，添加默认的代码块目录前缀
    filepath = "codeblock/" + file;
  }

  try {
    // 加载文件原始内容
    // 注意：这里使用了 webpack 的 raw-loader 来加载文件内容
    const content = require('!!raw-loader!@site/' + filepath)?.default;
    
    // 将制表符替换为 2 个空格，保持代码格式统一
    const formattedContent = content.replace(/\t/g, "  ");

    // 如果没有指定语言，则根据文件扩展名自动推断
    let language = otherProps.language;
    if (!language) {
      const filename = path.basename(file);
      const fileExtension = path.extname(filename).replace(/^\./, '');
      
      // 检查是否有自定义的语言映射
      const mappedLanguage = extToLang.get(fileExtension);
      language = mappedLanguage || fileExtension;
    }

    // 如果需要显示文件名且未设置标题，则使用文件名作为标题
    let title = otherProps.title;
    if (!title && showFileName) {
      title = path.basename(file);
    }

    // 构造传递给 CodeBlock 的属性
    const codeBlockProps = {
      ...otherProps,
      language,
      title
    };

    return (
      <CodeBlock {...codeBlockProps}>
        {formattedContent}
      </CodeBlock>
    );
  } catch (error) {
    // 错误处理：如果文件加载失败，显示友好的错误信息
    console.error(`Failed to load file: ${file}`, error);
    return (
      <CodeBlock language="text" className="error">
        {`Error: Could not load file "${file}"\n${error.message}`}
      </CodeBlock>
    );
  }
}