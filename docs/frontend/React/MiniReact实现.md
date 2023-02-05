## 构建一个自己的 Mini React 框架

- 第一步：createElement 函数
- 第二步：render 函数
- 第三步：Concurrent Mode
- 第四步：Fibers
- 第五步：Render 与 Commit 两大阶段（Phases）
- 第六步：调和算法 Reconciliation
- 第七步：函数组件 Function Components
- 第八步：Hooks

## 预备：创建环境

创建一个空目录，就叫 MiniReact

```js
npm init -y
```

然后修改 package.json ， pnpm install 一下，我们需要 react-scripts 里面的 babel 能力来让我们自己的 createElement 函数运行起来

```json
{
  "name": "MiniReact",
  "version": "0.0.1",
  "description": "Mini React",
  "keywords": [],
  "main": "src/index.js",
  "dependencies": {
    "react": "16.8.6",
    "react-dom": "16.8.6",
    "react-scripts": "3.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
  "browserslist": [">0.2%", "not dead", "not ie <= 11", "not op_mini all"]
}
```

public/index.html 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="theme-color" content="#000000" />
    <title>React App</title>
    <script src="../index.js"></script>
  </head>

  <body>
    <noscript> You need to enable JavaScript to run this app. </noscript>
    <div id="root"></div>
  </body>
</html>
```

最后的目录树是这样的

```js
MiniReact
├── README.md
├── package.json
├── pnpm-lock.yaml
├── public
│   └── index.html
└── src
    └── index.js
```

## 第一步：createElement

实现我们的 createElement 函数，调用 React.render 时，实际会把 jsx 转换成 js 代码，然后构建成一个含有 type 和 props 的对象

```js
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById('root');
ReactDOM.render(element, container);
```

从 jsx 转换到 js

```js
// 第一层，type 为 div，props 为 { id: "foo" }
const element = React.createElement(
  'div',
  { id: 'foo' },
  React.createElement('a', null, 'bar'),
  React.createElement('b')
);
```

接下来是处理 children，children 是嵌套结构，要保证其为数组

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
```

举例：

`createElement("div");`

返回

```json
{
  "type": "div",
  "props": { "children": [] }
}
```

`createElement("div", null, a, b)`

返回

```json
{
  "type": "div",
  "props": { "children": [a, b] }
}
```

children 数组也可以包含字符串和数字这样的原始类型。所以我们为所有不是对象的内容创建一个独立的元素，其创建一个特殊的 `TEXT_ELEMENT` 类型 。

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

目前我们在使用 React 的 createElement 函数。我们现在就给自己的库起个名字，就起名为 MiniReact

```js
const MiniReact = {
  createElement,
};

const element = MiniReact.createElement(
  'div',
  { id: 'foo' },
  MiniReact.createElement('a', null, 'bar'),
  MiniReact.createElement('b')
);
```

我们想要把 jsx 转换成 js，就需要用到 babel 的能力，为了告诉 babel 我们要转换成自己定义的功能，就需要加这个注释

```js
/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>Hello World</a>
    <b />
  </div>
```

## 第二步：render

编写自己的 `MiniReact.render` 函数

首先使用 element type 创建 DOM 节点，然后将新节点附加到 container 中，然后递归为每个 children type 做一样的事情，如果处理文本元素 `TEXT_ELEMENT` ，将创建一个文本节点，最后是将 `element props` 分配给 DOM node:

```js
function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  element.props.children.forEach((child) => render(child, dom));

  // 判断 props 的值是属性，而不是一个 children
  const isProperty = (key) => key !== children;

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  container.appendChild(dom);
}

const MiniReact = {
  createElement,
  render,
};
```

最后，我们就能在浏览器上看到 我们打印的 Hello World 了
完整代码：

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  element.props.children.forEach((child) => render(child, dom));

  // 判断 props 的值是属性，而不是一个 children
  const isProperty = (key) => key !== 'children';

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  container.appendChild(dom);
}

const MiniReact = {
  createElement,
  render,
};

/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>Hello world</a>
    <b />
  </div>
);

const container = document.getElementById('root');
MiniReact.render(element, container);
```

## 第三步：重构递归为 Concurrent Mode

上面的代码里有一个递归渲染的过程

```js
element.props.children.forEach((child) => render(child, dom));
```

一旦开始渲染，在整棵 element 树渲染完成之前程序是不会停止的。如果这棵 element 树过于庞大，它有可能会阻塞主进程太长时间。如果浏览器需要做类似于用户输入或者保持动画流畅这样的高优先级任务，则必须等到渲染完成为止。

我们将渲染工作分成几个小部分，在完成每个部分后，如果需要执行其他操作，我们将让浏览器中断渲染，这时候就需要 `requestIdleCallback` 这个 API，虽然 React 用的是自己实现的 Scheduler，但是它们的概念是相似的。这个 API 可以在主线程空闲的时候触发回调，`requestIdleCallback` 还为我们提供了 deadline 参数。我们可以用它来检查在浏览器需要再次控制之前我们有多少时间

```js
function render(element, container) {
  ...

  // 递归的方式无法进行中断
  // element.props.children.forEach((child) => render(child, dom));
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 用来处理除根节点以外的子节点的 fiber
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

`performUnitOfWork` 函数会执行工作单元，还会返回下一个工作单元

## 第四步：Fiber 结构

我们将为每一个 element 分配一个 fiber，每个 fiber 将成为一个工作单元。

在 `render` 函数中我们将会创建 root fiber，将其设置为 `nextUnitOfWork`。剩下的工作将在 `performUnitOfWork` 中进行，在那里我们将为每个 fiber 做三件事：

- 将 element 添加至 DOM
- 为 element 的 children 创建 fiber
- 选出下一个工作单元

![fiber](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/fiber.png)

设计这个数据结构的目标之一是使查找下一个工作单元变得更加容易。（在下文，用**`child`、`sibling`和`parent` 分别指代子节点、兄弟姐妹节点和父节点**

当我们完成对 Fiber 的工作时，如果它有 `child` ，那么这个 Fiber 会被当作是下一个工作单元

如果该 fiber 没有 `child` ，我们会把这个 fiber 的兄弟姐妹节点当作是下一个工作单元。

如果该 fiber 既没有 `child` 也没有 `sibling` ，那我们会寻找它的「叔叔节点」：其`parent`的 `sibling`

如果`parent`没有`sibling` ，我们将不断检查父节点的父节点，直到找到有`sibling` 的`parent`节点，或者直接找到根节点 `root` 位置。如果达到根节点，则意味着我们以及完成了此次渲染的所有工作。

接下来把上面的理论转化为代码：

1.删除 `render` 函数中的原有代码。将创建 DOM 的部分代码抽离处理

```js
function createDOM(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  // 判断 props 的值是属性，而不是一个 children
  const isProperty = (key) => key !== 'children';

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

let nextUnitOfWork = null;

function render(element, container) {
  // TODO 设置下一个工作单元
}
```

2.在 `render` 函数中，将 `nextUnitOfWork` 设置为 Fiber Tree 的根节点：

```js
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}
```

3.当浏览器准备好的时候，将会调用我们的 `workLoop` 函数，从根节点开始执行 `performUnitOfWork`

```js
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // TODO 添加一个 DOM 节点
  // TODO 创建新的 Fiber 节点
  // TODO 返回下一个工作单元
}
```

4.创建一个 node 节点然后将其添加至 DOM，将这个 DOM node 保存在 `fiber.dom` 属性中以持续跟踪。

```js
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // TODO 创建新的 Fiber 节点
  // TODO 返回下一个工作单元
}
```

5.接着为每一个子节点都创建 fiber

```js
// 用来处理除根节点以外的子节点的 fiber
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibing = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 将其添加到 Fiber 树中，它是 child 还是 sibling 取决于它是否是第一个 child
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibing.sibing = newFiber;
    }

    prevSibing = newFiber;
    index++;
  }

  // 最后，选出下一个工作单元，首先寻找 child ,其次 sibling ,然后是 parent 的 sibling
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent;
  }
}
```

到此， Fiber 部分就结束了

## 第五步：Render 和 Commit 阶段

将 “添加节点至 DOM" 这个动作延迟到所有节点 render 完成，这个动作也被称为 commit。

### 为什么要分阶段？

每当在处理一个 React element 时都会添加一个新的节点到 DOM 中，而浏览器在渲染完成整个树之前可能会中断我们的工作。在这种情况下，用户将会看不到完整的 UI。

如何分阶段？

### 如何分阶段

先删除对 DOM 进行修改的代码

```js
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

 // if (fiber.parent) {
 //   fiber.parent.dom.appendChild(fiber.dom)
 // }

 ...
}
```

相反地，我们会跟踪 Fiber 树的根节点。称它为 "进行中的 root" — wipRoot。一旦完成所有工作（直到没有 `nextUnitOfWork` ），便将整个 Fiber 树交给 DOM，将这个步骤在 `commitRoot` 函数中完成。在这里将所有节点递归附加到 DOM 中。

```js
// 下一个工作单元
let nextUnitOfWork = null;
// 进行中的根节点
let wipRoot = null;

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  commitWork(wipRoot);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitRoot(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

requestIdleCallback(workLoop);
```

## 第六步：Reconciliation 调和

更新和删除节点的过程称为：调和 Reconciliation

调和主要负责更新和删除节点的过程，需要将在 `render` 函数上接收到的 `elements` 与我们提交给 DOM 的最后一棵 Fiber 树进行比较

### 保存当前渲染的 fiber 树

在完成 commit 之后，需要对 ”最后一次 commit 到 DOM 的一棵 Fiber 树“ 的引用进行保存。我们称它为 `currentRoot` 。同时我们也对每个 Fiber 添加了一个 `alternate` 属性。这个属性是对旧 Fiber 的链接，这个旧 Fiber 是我们在在上一个 commit 阶段向 DOM commit 的 Fiber

### Reconcile

Reconcile 的过程会在执行工作单元时完成。

现在我们把 `performUnitOfWork` 中用来创建新 Fiber 的部分代码抽离成一个新的 `reconcileChildren` 函数。

调和阶段，主要是做 DOM 结构的对比

我们使用 `type` 属性对它们进行比较：

- 如果老的 Fiber 和新的 element 拥有相同的 type，我们可以保留 DOM 节点并仅使用新的 Props 进行更新。这里我们会创建一个新的 Fiber 来使 DOM 节点与旧的 Fiber 保持一致，而 props 与新的 element 保持一致。
  - 我们还向 Fiber 中添加了一个新的属性 `effectTag` ，这里的值为 `UPDATE` 。为稍后我们将在 commit 阶段使用这个属性。
- 如果两者的 `type` 不一样并且有一个新的 element，这意味着我们需要创建一个新的 DOM 节点。
  - 在这种情况下，我们会用 `PLACEMENT` effect tag 来标记新的 Fiber。
- 如果两者的 `type` 不一样，并且有一个旧的 Fiber，我们需要删除旧节点
  - 在这种情况下，我们没有新的 Fiber，所以我们会把 `DELETION`effect tag 添加到旧 Fiber 中。

我们实现的是简易版，React 中也使用了 `key` 来做对比 ，这样可以更好地实现 `reconciliation` 。它会检测 children 何时更改 element 数组中的位置。

```js
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  // +++
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 用来追踪我们想要删除的 node
let deletions = null;

// 在这里我们将会旧 Fibers 与新 elements 进行调和（reconcile）：
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 对于新旧 element 的处理
    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      // 这里使用了一个数组来追踪我们想要删除的 node
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 将其添加到 Fiber 树中，它是 child 还是 sibling 取决于它是否是第一个 child
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

### 变更 commitWork 以处理不同类型的变化

```js
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
```

为了处理前面定义的各种 effectTags，我们也需要对 `commitWork` 函数进行变更。其中 updateDOM 函数中的逻辑如下

- `PLACEMENT` ：这个 DOM 节点添加到父 Fiber 的节点上

- `DELETION`：删除这个 `child`

- `UPDATE` ：使用最新的 props 来更新现有的 DOM 节点

- - 这部分动作将有 `updateDOM` 函数来完成：我们将旧 Fiber 的 props 与 新 Fiber 的 props 可进行比较，删除旧的 props，并设置新的或者变更之后的 props。
  - 针对 eventListener 这种特殊的 prop，我们将以不同的方式处理：如果 eventListener 发生了变更我们会把它从 node 中移除，然后设置一个新的 eventListener。

```js
function createDOM(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDOM(dom, {}, fiber.props);

  return dom;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitRoot(fiber.sibling);
}

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDOM(dom, prevProps, nextProps) {
  // 删除旧的或已更改的事件侦听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !key in nextProps || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 删除旧的 props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // 设置新的或已更改的 props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // 新增事件监听器
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
```

## 第七步：支持 Function Component

我们把渲染用的测试代码修改为如下:

```js
/**
 * 测试代码部分
 */
/** @jsx MiniReact.createElement */
function App(props) {
  return <h1>Hello {props.name}</h1>;
}
const element = <App name="World" />;
const container = document.getElementById('root');
MiniReact.render(element, container);
```

Function Component 在两种方面存在差异：

1. 来自 Function Component 的 Fiber 并没有 DOM node

2. **`children`** **从运行函数中而来，而非直接从 props 中获取**

我们检查 `fiber.type` 是否是 `function` ，根据不同的结果来使用不同的更新函数。

在 `updateFunctionComponent` 中，我们执行函数以获取`children` 。一旦我们拿到了 `children` ，reconciliation 的过程其实是一样的。

```js
// 用来处理除根节点以外的子节点的 fiber
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 最后，选出下一个工作单元，首先寻找 child ,其次 sibling ,然后是 parent 的 sibling
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
```

## Commit 时需要寻找 DOM node

由于来自 Function Component 的 Fiber 并没有 DOM node，我们需要修改的是 `commitWork` 这个函数：

1. 修改寻找 DOM 父节点的逻辑：顺着 Fiber Tree 向上找直到找到有 DOM node 的 Fiber。

2. 当删除节点是，我们也需要向下寻找知道找到有 `child` 的 DOM node。

```js
function commitWork(fiber) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitRoot(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}
```

## 第八步：支持 Hooks

首先把我们的 App 改写成一个传统的 Counter Component，使用自定义的 useState 来变更状态：

```js
/** @jsx MiniReact.createElement */
function Counter() {
  const [state, setState] = MiniReact.useState(1);
  return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>;
}
const element = <Counter />;
const container = document.getElementById('root');
MiniReact.render(element, container);
```

### 准备工作

定义 hook 需要用到的全局变量；引入 Fiber 进行调度工作

Function Component 是在 `updateFunctionComponent` 函数中被调用的，那么同样我们也会在这个函数中调用 useState。

```js
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  // TODO
}
```

我们需要在调用 `Function Component` 之前初始化一些全局变量，以便可以再 useState 函数中使用它们。

首先我们把要执行的工作添加至正在执行的 Fiber (`wipFiber`)；再给 Fiber 添加一个 hooks 数组，以支持在统一组件中多次调用 useState，同时我们还能跟踪当前 Hook 的索引。

```js
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

### useState 实现

每当 Function Component 调用 useState 时，会检查是否有旧的 hook。我们使用 hook 的索引在 fiber 的 alternate 属性中进行查询。

如果存在旧的 hook，那么我们将 state 从旧 hook 中复制到新的 hook；否则我们将初始化 state。

然后我们将向 Fiber 添加新的 hook，同时索引也递增加 1，并返回状态。

```js
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    // 对于存储在 hook.queue 中的 actions，我们将在下一次渲染该组件时进行执行
    queue: [],
  };

  // 首先从旧 hook 中拿到所有 actions，并将它们逐个应用到新 hook 中的 state 中。
  // 所以当我们返回 state 时，该 state 已经被更新了。

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };

    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

const MiniReact = {
  createElement,
  render,
  useState,
};
```

## 总结

我们并没有把所有 React 的功能和优化点包含进来。例如：

- 在 Didact 中，我们在 render 阶段遍历整棵树，而 React 会根据一些标记来跳过一些没有发生变化的子树。

- 我们还在 commit 阶段遍历整棵树。React 仅保留有影响的 Fiber 链接列表，并且也仅只访问这些 Fiber。

- 每当我们构建一个新的 WIP Tree 时，我们会为每个 Fiber 创建新的对象。而 React 会从旧的 Fiber Tree 中回收 Fiber。

- 当 Didact 在 render 阶段收到新的更新时，它会丢弃 WIP Tree 中的工作，并重新从根节点开始。而 React 使用有效期时间戳来标记每次更新，并用它来决定哪个更新具有更高的优先级。
