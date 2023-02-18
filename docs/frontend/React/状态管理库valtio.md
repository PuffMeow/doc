## Valtio 是什么

> Valtio makes proxy-state simple for React and Vanilla

就是让数据状态代理在 React 和原生 JS (Vanilla) 中变得更加简单的一个状态管理库，有点类似于 Mobx 的理念，使用状态代理去驱动 React 视图来更新。Valtio（用粤语来念就是“我丢”） 是一个很轻量级的状态管理库

## 主要作者是谁？

主要作者叫做 [Daishi Kato](https://github.com/dai-shi)（带师？是你吗？）他是日本东京人，这货很强啊，是个全职开源作者，在专门搞各种状态管理库，其中 [Jotai 12.1k⭐](https://github.com/pmndrs/jotai)、 [Zustand 27.4k⭐](https://github.com/pmndrs/zustand)、[Valtio 6.3k⭐](https://github.com/pmndrs/valtio) ，这三个状态管理库都是这货主要开发的，而且用的人都很多。其中 Jotai 是受到 Recoil 的启发搞得， Zustand 是受到 Redux 启发搞的，Valtio 是受 Mobx 启发搞的，它们的名字分别是日语、 德语、芬兰语 中的 “状态”。

本质上这三个代表了3个流派：

dispatch流派：redux、zustand、dva等

原子状态流派：recoil、jotai等

响应式流派：mobx、valtio等

这就是主要的三大状态管理流派，关于如何选择完全是要看个人风格喜好了，下面我们来举几个关于上面提到的 zustand、jotai 、valtio 的基本使用例子，以计时器为例。

### Zustand

```jsx
import { create } from "zustand";

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export default function Counter() {
  const count = useStore((state) => state.count);
  const inc = useStore((state) => state.inc);

  return (
    <div>
      {count}
      <button onClick={inc}>+1</button>
    </div>
  );
}
```

### Jotai

```jsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      {count}
      <button onClick={() => setCount((v) => v + 1)}>+1</button>
    </div>
  );
}
```

### Valtio

```jsx
import { proxy, useSnapshot } from "valtio";

const state = proxy({ count: 0 });

function Counter() {
  const snap = useSnapshot(state);

  return (
    <div>
      {snap.count}
      <button onClick={() => ++state.count}>+1</button>
    </div>
  );
}
```

用三个简单的计时器例子看完了它们三者之间的大概区别，不过我们今天这里的主角还是 Valtio，下面我们会从一些基本 API 到原理具体去说一下 Valtio ，最后再看看它和类似的竞品 Mobx 之间的主要区别。

## Valtio 详细介绍

Valtio 最主要的两个 API 是 proxy 和 useSnapshot，proxy 会为原始对象创建一个 Proxy 代理。使用 useSnapshot 会创建一个组件中的本地快照 snap，并且这个 snap 快照是只读的(readonly)，当改变 state.count 时，该组件会被重新渲染，但是改变 state.text 的值时，组件不会重渲染，并且这里的渲染过程是被经过优化的。

## 订阅数据

```tsx
```



## 和 Mobx 的对比