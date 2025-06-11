import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '易于使用',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
		Docusaurus 的设计从一开始就注重易于安装和使用，让您能快速搭建并运行网站。
      </>
    ),
  },
  {
    title: '专注核心事务',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
		Docusaurus 让您专注于文档内容，琐事交给我们处理。您只需将文档放入 <code>docs</code> 目录即可
      </>
    ),
  },
  {
    title: '基于 React 构建',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
		您可以通过复用 React 组件来扩展或自定义网站布局。Docusaurus 在保持相同页眉页脚的同时，仍支持灵活扩展功能。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
