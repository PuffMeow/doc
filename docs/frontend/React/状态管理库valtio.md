# 剖析 Valito - 一个很好用的前端状态管理库

## 1.Valtio 是啥玩意

> Valtio makes proxy-state simple for React and Vanilla

就是让数据管理在 React 和原生 JS (Vanilla) 中变得更加简单的一个库，它类似于 Vue 的数据驱动视图的理念，使用外部状态代理去驱动 React 视图来更新。总的来说，Valtio（用粤语来念就是“我丢”） 是一个很轻量级的响应式状态管理库。

## 2.主要作者是谁？

主要作者叫做 [Daishi Kato](https://github.com/dai-shi)（带师？是你吗？）他是日本东京人，是个全职开源作者。戳多马蝶，这货居然还写了好几个状态管理库，分别是 [Jotai 12.1k⭐](https://github.com/pmndrs/jotai)、 [Zustand 28k⭐](https://github.com/pmndrs/zustand)、[Valtio 6.3k⭐](https://github.com/pmndrs/valtio) ，这三个状态管理库都是这货主要开发的，而且用的人还挺多的。其中 Jotai 和 Recoil 类似， Zustand 和 Redux 类似，Valtio 和 Mobx 类似，它们的名字分别是日语、 德语、芬兰语 中的 “状态”，这几个库和之前一些老牌的库比上手要更简单，而且使用起来更简洁，并且主打轻量级。

上面提到的几个库本质上代表了3个流派：

dispatch 流派(单向数据流-中心化管理)：redux、zustand、dva等

响应式流派(中心化管理)：mobx、valtio等

原子状态流派(原子组件化管理)：recoil、jotai等

下面我们来举几个关于上面提到的 zustand、jotai 、valtio 的基本使用例子，对这几个库有个整体的感知，以计时器为例：

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

每个状态都是原子化，用法和原生的 useState 有点像

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

和 Vue 的响应式类似，当数据发生变化的时候就驱动视图更新

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

用三个简单的计时器例子看完了它们三者之间的代码风格差异。

关于如何选择完全是要看个人风格喜好了，我个人的话更喜欢响应式风格的，因为我以前写过一年的Vue，而且 Mobx 我也在之前项目中用过很长的一段时间了，所以 Valtio 就觉得很亲切。但是响应式风格和 React 的单向数据流理念有点违背，所以用户没有 dispatch 流派用的人那么多(从⭐ 的数量就能看出来)。

我们今天这里的主角是 Valtio，下面我们会从一些基本 API 到原理具体去说一下 Valtio 

## 3.基础：如何使用

从上面的例子中我们可以看到 Valtio 最主要的两个 API 是 proxy 和 useSnapshot，proxy 会为原始对象创建一个 Proxy 代理。使用 useSnapshot 会创建一个组件中的本地快照 snap，并且这个快照是只读的(readonly)，当改变 state.count 时，该组件就会被重新渲染，但是改变 state.text 的值时，组件不会重渲染，这里的渲染过程经过优化的。

由于底层和 Vue3 一样使用了 Proxy 来做为数据代理，所以我们先看看它的兼容性，可以看到除了 IE 不支持以外别的浏览器都支持得很好了。 

![image-20230218175736380](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230218175736380.png)

### 监听数据变化

用于监听数据变化时，valtio 提供了 subscribe 这个 API，下面我们看看效果和代码实现

#### 效果演示

![GIF](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/GIF.gif)

#### 示例代码

```tsx
import { useEffect } from "react";
import { proxy, subscribe, useSnapshot } from "valtio";

const state = proxy({
  count: 0,
  test: {
    arr: [] as string[],
  },
});

// 也可以在组件外部或任意地方去监听数据的变化，并且可以只监听其中的某一个对象类型的值
subscribe(state.test.arr, () => {
  console.log("在外部监听到 state.test.arr 发生变化了", state.test.arr);
});

export default function Counter() {
  const snap = useSnapshot(state);

  useEffect(() => {
    const unSubscribe = subscribe(state, () => {
      // 此处可以拿到最新的数据
      console.log("在组件内监听到 state 发生变化了", state.count);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  console.log("re-render");

  return (
    <>
      <button
        onClick={() => {
          // 同时修改多个状态，组件也只会 re-render 一次
          state.count += 1;
          state.test.arr.push(String(state.count));
        }}
      >
        do it
      </button>
      <div>{snap.count}</div>
      {snap.test.arr.map((i, k) => (
        <div key={k}>{i}</div>
      ))}
    </>
  );
}
```

如果需要监听多个属性的变化，可以使用从 valtio/utils 里导出的 watch API，和 Vue 的 API 有点类似

### 异步数据

![test](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/test.gif)

```tsx
const sleep = (ms = 3000) => new Promise((resolve) => setTimeout(resolve, ms));

const state = proxy({
  asyncState: sleep().then(() => "异步加载完成"),
});

function AsyncComponent() {
  const snap = useSnapshot(state);
  return <div>{snap.asyncState}</div>;
}

export default function App() {
  return (
    <Suspense fallback="加载中...">
      <AsyncComponent />
    </Suspense>
  );
}
```

### snapshot 取消代理

可以将一个用 proxy 包裹代理过的可变对象还原成一个不可变的对象。

简单地说，在顺序的快照调用中，当代理对象的值没有改变时，将返回一个指向相同的前一个快照对象的指针。这可以在函数组件中进行浅比较来避免重渲染。这个函数对于我们后面理解原理比较重要，下面是个使用例子：

```jsx
import { proxy, snapshot } from 'valtio'

const store = proxy({ name: 'Puff' })
// 返回一个当前代理 store 的有效复制，并且取消了 proxy 代理
const snap1 = snapshot(store) 
const snap2 = snapshot(store)
// true，因为 store 中的值没发生改变，所以不需要重渲染
console.log(snap1 === snap2)

// 改变 store 中的值
store.name = 'PuffMeow'
const snap3 = snapshot(store)
// 返回 false，应该进行重渲染
console.log(snap1 === snap3)
```

### 几个使用时的注意事项

#### 1.啥时候用 snap 啥时候用 state

在 React 函数组件中， snap 应该和 hooks 一样，只在渲染体(render-body)里去用，state 应该在非渲染体里去用。这钟写法看起来有一点点割裂，不过在下面的最佳实践部分，我们会用另一种方式去解决这种割裂的写法。

```js
import { proxy, useSnapshot } from "valtio"

const state = proxy({
  count: 0
})

const Component = () => {
  const snap = useSnapshot(state)
  // 这里是 render-body

  const handleClick = () => {
    // 这里是非 render-body
      
    state.count++
    // 在这里读取 snap 会获取到老的状态
    console.log(snap) // count: 0
    // 在这里获取 state 可以获取到最新状态
    console.log(state) // count: 1
  }
  
  return <button onClick={handleClick}>+1</button>
}
```

#### 2.访问整个对象时任意属性触发都会导致重渲染

假如我们有这么一个对象

```tsx
const state = proxy({
  obj: {
    count: 0,
    text: "hello world"
  }
})
```

当我们用 snap 去获取 count 时，组件只会在 count 发生变化时才会重新渲染

```js
const snap = useSnapshot(state)
snap.obj.count
```

但是假如我们在组件内获取 obj ，那么当 obj 发生变化时，不管是 count 变化还是 text 变化，都会让组件触发重渲染

```js
const snap = useSnapshot(state)
snap.obj

// 或者
const snapObj = useSnapshot(state.obj)
snapObj
```

所以我们应该在渲染体内尽量的精确读取某一个对象里的属性，防止不必要的 re-render

#### 3. 传递对象属性给 React.memo 包裹的组件可能会引发问题

useSnapshot 返回的 snap 变量是用来做重渲染优化数据追踪的，如果你把整个 snap 或者 snap 嵌套的对象属性传递给一个 React.memo 包裹着的组件，可能会有问题，因为 memo 只会做浅层比较来决定是否重渲染一个组件，如果是遇到嵌套对象的话，那么 memo 就会失效了

下面是一些开发时的约定：

- 不要传递一个对象属性给 React.memo 包裹的组件

- 要传递对象的时候就避免使用 React.memo
- 如果非要传递对象给 React.memo 包裹的组件的话，可以传递 proxy 代理过的对象，子组件里使用 useSnapshot 去读取

```jsx
const state = proxy({
  obj: [
    { id: 1, label: 'foo' },
    { id: 2, label: 'bar' },
  ],
})

const Parent = React.memo(() => {
  const stateSnap = useSnapshot(state)

  return stateSnap.obj.map((item, index) => (
    <Child key={item.id} objectProxy={state.obj[index]} />
  ))
})

const Child = React.memo(({ objectProxy }) => {
  const objectSnap = useSnapshot(objectProxy)

  return objectSnap.label
})
```

### 最佳代码实践

在代码中一般我会这样去管理一个全局数据，这也是官方推荐的写法，使用 useProxy 来封装一个获取全局 store 数据的自定义 hook useStore 即可，这样获取数据和设置数据的时候都可以使用 store 这个变量名来设置，避免了上面提到的 snap 和 store 割裂的写法。

```jsx
// src/store/index.ts
import { useProxy, proxy } from "valtio/utils";

const store = proxy({
    userInfo: {},
    // [{ name: "" }]
    list: []
})

export default useStore = () => useProxy(store);

// src/components/List 组件
import useStore from "../../store";

export function List() {
    const store = useStore();
    
    useEffect(() => {
        fetchData.then(res => {
            store.list = res.data.list;
            // 这里读取 store.list 可以取到最新的值
        })
    }, [])
    
    return (
        <div>
            {store.list.map(item => <div>{item.name}</div>)}
        </div>
    )
}
```

useProxy 其实就是对取 useSnapshot() 或 store 数据的封装，这个 hook 也很简单，就是判断是渲染期间(渲染体内)就返回 useSnapshot() 的快照数据，非渲染期间(非渲染体内)就返回原始的 store 数据，和我们自己手写的是差不多的，只不过这个 hook 帮我们把这个过程封装了起来。

## 4.原理：深入剖析

Valtio 的两个核心 API 就是 proxy 和 useSnapshot，不过在深入它们之前，我们会先去了解几个东西

- [useSyncExternalStore](https://beta.reactjs.org/reference/react/useSyncExternalStore#)：React18 提供的一个可以订阅组件外部数据的 hook，React 官方建议这个 hook 应该给库的开发者用，不建议在应用中去使用
- [proxy-compare](https://github.com/dai-shi/proxy-compare)：可以判断代理对象访问过的属性是否有发生变更，这是用于优化重渲染的核心

### useSyncExternalStore

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`

subscribe 函数应该用于订阅外部的数据，并且返回一个取消订阅的函数，getSnapshot 函数返回数据的快照，第三个参数是用于返回服务端数据快照，我们这里就不讲服务端渲染了。

#### 效果演示：

![111](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/111.gif)

#### 示例代码:

```js
import { Suspense, useEffect, useSyncExternalStore } from "react";

let listeners: Array<() => void> = [];
let states = {
  count: 0,
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

const store = {
  inc(num = 1) {
    states = {
      ...states,
      count: states.count + num,
    };
    // 当数据发生变更时，就发起通知
    emitChange();
  },
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

export default function Component() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return (
    <>
      <button
        onClick={() => {
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

其实这个 Hook 的原理也很简单，我们去看一眼 React 的源码，源码在仓库的  [packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js](https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js)，这个包是由 React 官方提供的垫片，可以在 React 18以下的版本去使用，但是它是一个同步版本的，不支持 React 18的 Concurrent Mode，在React 18 中，使用 React 导出的内建版本即可。在 Valtio 内部就是用了下面这个包：**use-sync-external-store/shim** 来作为垫片使用的。

#### 源码：

简单的说，这个 hook 的作用就是当订阅的外部数据发生变更时，就会去强制视图更新，并且使用订阅事件在数据快照发生变化的时候刷新视图，然后在组件渲染的时候就调用 getSnapshot 方法重新去获取最新的数据快照。

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

看完了上面这个 API 之后，我们可以了解到，在 React 组件中是怎样做到与组件外部的数据进行交互的，但是如果光是使用上面这个 API 的话会有触发没必要的重渲染的问题，来看下面的代码：

```jsx
// 我们把上面的 states 修改为
let states = {
  count: 0,
  count2: 0,
};

// store 中添加这个方法
const store = {
  inc2(num = 1) {
    states = {
      ...states,
      count2: states.count2 + num,
    };
    emitChange();
  }
  ...
};

export default function Component() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
 
  // +++查看组件是否重渲染
  console.log("re-render");
   
  return (
    <>
      <button
        onClick={() => {
          // 修改 count2 的值
          store.inc2()
        }}
      >
        +1
      </button>
      <div>count:{state.count}</div>
    </>
  );
}
```

在上面这个组件中我们只读取了 count 的值，没读取 count2 的值，然后把点击事件改为修改 count2 的值。

按正常来说，我们这个组件不应该重渲染，因为我们组件里没有去读取 count2 的值，但是事实上这样还是会去触发重渲染

![rerender](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/rerender.gif)

那么该如何去避免这种不必要的重渲染呢？那接下来就是该 `proxy-compare` 这个库出场了

### proxy-compare

这个库的作用就是用来对比两个对象之间是否有发生变更，核心 API 是 createProxy 和 isChanged

- createProxy 会创建一个代理过的对象

- isChanged 将会去比较被依赖收集的属性是否有发生变更，如果没被收集的属性，不会去做比较

```js
import { createProxy, isChanged } from 'proxy-compare';

// 声明原始对象
const obj = { a: "1", b: "2" };
// 创建一个用于记录被访问属性的 WeakMap，提供给库的内部用于依赖收集
const affected = new WeakMap();

// 创建一个 obj 的代理，提供 affected 给内部收集依赖
const proxy = createProxy(obj, affected);

// 触发 Proxy.get 事件，内部的 affected 会收集 a 属性
proxy.a

// 判断 a 属性是否有发生变更，返回 false
isChanged(obj, { a: "1" }, affected) // false

// 修改 a 属性
proxy.a = "2"

// a 属性发生了变更，返回 true
isChanged(obj, { a: "1" }, affected) // true

// 修改 b 到 20，但是 b 没被访问过，所以 affected 没收集到 b 属性
proxy.b = "20"
// 第二个参数里的 b 不管修改到多少，最后执行结果都为 false
isChanged(obj, { a: "2", b: "20" }, affected) // false
```

因为这个库的源码有几百行，比较多就不一一细讲了，感兴趣的可以去看源码实现，我们这里就以画图的方式，以上面的代码为例子，分步来拆解这个库的核心部分实现。

#### createProxy 的过程

![image-20230221232524208](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230221232524208.png)

`proxy.a` 访问调用完成后最后在内部会生成类似这样的数据结构：

```js
{
  “AFFECTED_PROPERTY”: WeakMap { "a:1,b:2": { "KEY_PROPERTY": Set["a"] } }
}
```

为什么要用 WeakMap ，是因为 WeakMap 的键值对所引用的对象都是弱引用，会在没有其它引用的时候释放掉内存(对应的key会变为无效)， 以此来节省内存。 KEYS_PROPERTY 引用的 Set 集合是用来收集依赖的，它可以去重，防止重复收集依赖。

另外，如果是对象嵌套着对象的情况，createProxy 内部不会一开始就去代理所有的嵌套对象，而是在调用的时候才去进行代理，从而可以节省性能开销。大概的代码类似于这样：

```js
// Proxy 的 handler.get 方法， proxy.a 的时候会调用
const handler = {
  get(target, key) {
    // 记录当前访问的属性值的使用情况
    recordUsage(KEYS_PROPERTY, key);
    // createProxy 内部判断到是原始值时就直接返回，是对象就再次代理创建代理
    return createProxy(
      Reflect.get(target, key),
      state[AFFECTED_PROPERTY] as Affected,
      state[PROXY_CACHE_PROPERTY],
    );
  }
}
```

#### isChanged 比较过程

我们上面说到，访问了 proxy.a 的时候，内部就会收集到这个 a 依赖，当我们调用 `isChanged(obj, { a: "1" }, affected)` 的时候，就会去进行判断 obj 原始对象和提供的对比对象里的 a 属性是否有发生变化，精简过后的主要代码是这样子的：

```js
export const isChanged = (
  prevObj,
  nextObj,
  affected,
): boolean => {
  // 比较是否是同一个值，是同一个值说明没发生变化，返回 false
  if (Object.is(prevObj, nextObj)) {
    return false;
  }

  // 如果传入的两个值任意一个不是对象，那就直接返回 true 说明发生了变化
  if (!isObject(prevObj) || !isObject(nextObj)) return true;

  // 从我们收集的依赖里去看看是否有被访问过的属性
  const used = affected.get(prevObj);
  // 没有收集过依赖，说明这两个对象已经不是同一个对象了，不进行比较了，直接返回true
  // 比如 {a:"1"} 和 {a:"1"} 这俩不是同一个对象(地址不一样)
  if (!used) return true;

  // 最后再来判断有收集依赖的情况，当我们访问了 proxy.a，就会走到这里
  let changed = null;
    
  // 遍历收集到依赖的 Set 集合，对比两个对象中以该依赖性为key的值
  for (const key of used[KEYS_PROPERTY] || []) {
    // 如果是原始值比如 isChanged("1", "1") ，最后就会返回 true
    // 如果是嵌套对象或数组，那么就会去递归调用
    changed = isChanged(prevObj[key], nextObj[key], affected);
    // 当遍历到任意一个前后对象不同的值，就直接返回true，说明该依赖项的值发生了变化
    if (changed) return changed;
  }

  // 当遍历完了所有的依赖，并且没提前返回就会走到这里
  // 如果一个依赖都没收集，上面就没遍历，此时的 changed 还是 null，说明对比的两个对象之间的地址肯定是不一样的，说明发生了变化
  if (changed === null) changed = true;
  // 如果 changed 遍历完了为 false，最后说明访问的依赖都没发生变化
  return changed;
};
```

这里就是一整串的完整的对比 Proxy 是否发生变更的一个流程了，当然库的内部不止这么简单，另外还有很多的缓存处理以及 Proxy Handler 的 has、getOwnPropertyDescriptor、ownKeys 的依赖收集。但是我们最核心的还是 Handler 的 get 方法，这是访问数据时就会进行的依赖收集手段。

### 小结

那么我们了解完上面这两个库的作用和原理之后，我们其实就已经大概的能够知道 useSnapshot 的工作原理了