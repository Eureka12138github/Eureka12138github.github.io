---
title: My testpage1
sidebar_position: 1
description: This is my testpage1!
---

### testpage1

#### 这是我的测试页面1

Let's see how to [Create a page](/docs/tutorial-basics/create-a-page).

Let's see  [testpage2](./testpage2.md).

如果在同一目录下，如现在` testpage1`和`testpage2`同属于目录`myfile`目录下，此时如果想要在`testpage1`中跳转到`testpage2`,只需要`[testpage2](./testpage2.md)`,结果：[testpage2](./testpage2.md)，点击此便可跳转到`testpage2`；

如果不在同一目录下，如`testpage1`在`myfile`目录下，而`creat a page`在`/docs/tutorial-basics`目录下，就不能使用上述方法，而应该`[Creat a page](/docs/tutorial-basics/create-a-page)`,结果：[Creat a page](/docs/tutorial-basics/create-a-page)

hhh

![](./img/docusaurus.png "this is a dinosaur")

![](.\img\Eureka.png "This is Sherry")

```c
int main(){
    Timer_Init();
    OLED_Init();
    while(1){
        Task();
    }
}
```

:::tip[My Tip]

绿色小贴士，用于推荐用法、技巧等场景

:::

:::danger[Take care]

红色危险，用于指示高风险操作、错误操作等场景

:::

:::info[My Info]

蓝色信息提示，用于补充说明、背景知识等场景

:::

:::note[My note]

浅灰备注，需要特别注意的内容

:::

:::warning[My warning]

黄色，指示可能有风险的操作

:::

[Makedown Features](/docs/tutorial-basics/markdown-features)



