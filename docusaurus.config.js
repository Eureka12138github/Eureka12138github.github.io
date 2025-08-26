// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '我的网站',
  tagline: '这是我的个人网站',
  favicon: 'img/Eureka.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://eureka12138github.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Eureka12138github', // Usually your GitHub org/user name.
  projectName: 'Eureka12138github.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash :false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Eureka12138github/Eureka12138github.github.io/tree/main',
			 showLastUpdateTime: true,
		     showLastUpdateAuthor: true // 显示作者
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Eureka12138github/Eureka12138github.github.io/tree/main',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
		  showLastUpdateTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
	  //添加Algolia搜索
	  algolia: {
		// Application ID
		appId: '7Z8F108UT0',
		//  Search-Only API Key
		apiKey: '51c5befc0dffa0fbf8e0066c16535280',
		indexName: 'test-site',
		searchPagePath: 'search',
		contextualSearch: true
      },		
		
		// 添加 giscus 评论功能
		giscus: {
        repo: 'eureka12138github/eureka12138github.github.io',
        repoId: 'R_kgDOO5xCQQ',
        category: 'General',
        categoryId: 'DIC_kwDOO5xCQc4CucQu',
		lang: 'zh-CN', // 中文评论模块
		inputPosition: 'top',
      },
      // Replace with your project's social card
      image: 'img/My-temp-social-card.jpg',
      navbar: {
        title: '我的网站',
        logo: {
          alt: '我的网站LOGO',
          src: 'img/Eureka.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '记录',
          },
          {to: '/blog', label: '博客', position: 'left'},
          {
            href: 'https://github.com/Eureka12138github/Eureka12138github.github.io/tree/main',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: '模板',
                to: '/docs/mydoc/testpage0',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Gihub',
                href: 'https://github.com/Eureka12138github/',
              },


            ],
          },
          {
            title: 'More',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Eureka12138github/Eureka12138github.github.io/tree/main',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
