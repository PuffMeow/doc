## Valtio 是什么

> Valtio makes proxy-state simple for React and Vanilla

就是让数据状态代理在 React 和原生 JS (Vanilla) 中变得更加简单的一个状态管理库，有点类似于 Mobx 的理念，使用状态代理去驱动 React 视图来更新。Valtio 是一个很轻量级的状态管理库

## 作者是谁？

作者叫做 [Daishi Kato](https://github.com/dai-shi)（带师？是你吗？）他是日本东京人，这货很强啊，是个全职开源作者，在专门搞各种状态管理库，其中 [Jotai 12.1k⭐](https://github.com/pmndrs/jotai)、 [Zustand 27.4k⭐](https://github.com/pmndrs/zustand)、[Valtio 6.3k⭐](https://github.com/pmndrs/valtio) ，这三个状态管理库都是这货搞的，而且用的人都很多。其中 Jotai 是受到 Recoil 的启发搞得， Zustand 是受到 Redux 启发搞的，Valtio 是受 Mobx 启发搞的，但是它搞的这几个要做得比前人的要更好，所谓青出于蓝而胜于蓝哈。不过我们今天这里的主角是 Valtio。

## 在 React 中的基本用法

下面主要是使用了 proxy 和 useSnapshot 这两个 API，proxy 会为原始对象创建一个 Proxy 代理。使用 useSnapshot 会创建一个组件中的本地快照 snap，并且这个 snap 快照是只读的(readonly)，当改变 state.count 时，该组件会被重新渲染，但是改变 state.text 的值时，组件不会重渲染，并且这里的渲染过程是被经过优化的。

```js
import { proxy, useSnapshot } from 'valtio'

const state = proxy({ count: 0, text: 'hello world' })

function Counter() {
  const snap = useSnapshot(state)
  
  return (
    <div>
      {snap.count}
      <button onClick={() => ++state.count}>+1</button>
    </div>
  )
}
```

## 订阅数据

```tsx
```

