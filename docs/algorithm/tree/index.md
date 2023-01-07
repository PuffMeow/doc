---
title: 二叉树基础
---

## 遍历方式

`前` `中` `后` 这三个词是针对根节点的访问顺序而言的，即前序就是根节点在最前`根->左->右`，中序是根节点在中间`左->根->右`，后序是根节点在最后`左->右->根`。

#### 递归模板

```js
function TreeNode(val) {
  this.val = val;
  this.left = null;
  this.right = null;
}

function dfs(root) {
  //前序遍历
  dfs(root.left);
  //中序遍历
  dfs(root.right);
  //后序遍历
}
```

#### N 叉树的遍历

```js
function TreeNode(val) {
  this.val = val;
  this.children = [];
}

function dfs(root) {
  for (let child of root.children) {
    dfs(child);
  }
}
```

#### Tip

前序遍历的代码是在进入某个节点之前的时间点执行，后序遍历的代码是在离开某个节点之后的那个时间点执行。
