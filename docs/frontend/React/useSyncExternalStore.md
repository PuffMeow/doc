### useSyncExternalStore

> 这是个啥玩意？这是 React18 提供的一个可以订阅组件外部数据的 hooks，React 官方建议这个 hooks 应该给库的开发者使用，不建议应用开发者直接去进行使用

```
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

subscribe 函数应该用于订阅外部的数据，并且返回一个取消订阅的函数，getSnapshot 函数返回数据的快照，第三个参数是用于返回服务端数据快照，我们这里就不讲服务端渲染了，主要来看看客户端渲染的逻辑。这里我们还是以一个计数器为例

#### 效果演示：

![111](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/111.gif)

#### 示例代码:

```js
import { Suspense, useEffect, useSyncExternalStore } from "react";

// 存放事件监听器的地方
let listeners: Array<() => void> = [];
// 全局状态
let states = {
  count: 0,
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

// 构建一个组件外部 store
const store = {
  inc(num = 1) {
    states = {
      ...states,
      count: states.count + num,
    };
    // 当数据发生变更时，就发起通知
    emitChange();
  },
  // 订阅
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    // 返回取消订阅的函数
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    // 返回属性的快照
    return states;
  },
};

// 这里是我们的组件
export default function Component() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return (
    <>
      <button
        onClick={() => {
          // 直接调用 inc 方法，然后视图就进行刷新了
          store.inc();
        }}
      >
        +1
      </button>
      <div>count:{state.count}</div>
    </>
  );
}
```

其实这个 Hooks 的原理也很简单，我们去看一眼 React 的源码，源码在仓库的  [packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js](https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js)，这个包是由 React 官方提供的垫片，可以在 React 18以下的版本去使用，但是它是一个同步版本的，不支持 React 18的 Concurrent Mode，在React 18 中，使用 React 导出的内建版本即可。在 Valtio 内部就是用了下面这个包：**use-sync-external-store/shim** 来作为垫片使用的。

#### 源码：

简单的说，这个 hooks 的作用就是当订阅的外部数据发生变更时，就会去强制视图更新，并且使用订阅事件在数据快照发生变化的时候刷新视图，然后在组件渲染的时候就调用 getSnapshot 方法重新去获取最新的数据快照。

```js
export function useSyncExternalStore(subscribe, getSnapshot) {
  // 每次渲染都会去从 store 获取当前数据的快照
  const value = getSnapshot();
  // 可以调用 forceUpdate 强制让视图重渲染，因为它每次返回的 {inst} 对象都会是一个新的内存地址
  const [{ inst }, forceUpdate] = useState({ inst: { value, getSnapshot } });
 
  // 当 subscribe，value 数据快照，getSnapshot 发生变化的时候就重新赋值并刷新视图
  useLayoutEffect(() => {
    // 将最新的数据快照和 getSnapshot 函数存到 inst 对象中
    inst.value = value;
    inst.getSnapshot = getSnapshot;

    // 检查 snapshot 或者 subscribe 是否发生变更，如果发生变更就强制视图渲染
    if (checkIfSnapshotChanged(inst)) {
      // 刷新视图
      forceUpdate({ inst });
    }
  }, [subscribe, value, getSnapshot]);

  useEffect(() => {
    // 在触发订阅事件前先判断数据快照是否发生了变化
    if (checkIfSnapshotChanged(inst)) {
      forceUpdate({ inst });
    }

    // 处理 store 发生变化时的订阅事件
    const handleStoreChange = () => {
      // 检查从我们上次读取数据快照以来是否有再发生变化
      if (checkIfSnapshotChanged(inst)) {
        forceUpdate({ inst });
      }
    };

    // 订阅数据并在组件卸载的时候取消订阅，当数据发生变化的时候就会去触发上面的回调
    return subscribe(handleStoreChange);
  }, [subscribe]);

  return value;
}

// 用于比较数据快照是否发生变化
function checkIfSnapshotChanged(inst) {
  // 拿到最新的 getSnapshot 函数
  const latestGetSnapshot = inst.getSnapshot;
  // 上一个数据快照
  const prevValue = inst.value;
  try {
    // 获取新的数据快照
    const nextValue = latestGetSnapshot();
    // 比较新老数据快照是否相同
    return !is(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}

// 用于判断两个数据快照是否相同
function is(x, y) {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}
```

### 小结：

看完了上面这个 API 之后，我们就已经可以了解到在 React 组件中是怎样做到与组件外部的数据进行交互的了。

其实原理就是当组件订阅的外部数据发生了变化时，就直接去强制刷新视图，forceUpdate 一下就可以了

我们上一篇文章中介绍到的 Zustand 和 Valtio 底层都使用到了这个 API，果然是 DaShi 你啊

Zustand 为什么不需要像 Redux 一样需要使用 Provider 传递数据也是因为得益于这个 API 的实现~

