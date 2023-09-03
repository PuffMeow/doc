# Rust 在前端都干了些啥？

## 前言

这里有一篇两年前的文章：[Rust 是 JavaScript 基础设施的未来](https://mp.weixin.qq.com/s?__biz=MzkxNDIzNTg4MA==&mid=2247485792&idx=1&sn=682a4dee7ce4d3b47a81baf9ebd7a98a)，应该还是有挺多人看到过的。当时在前端社区上还掀起了一阵 Rust 风，有人说怎么天天造轮子，有人说实在是学不动了，也有人抱着积极的心态去拥抱新东西。

那么现在两年已经过去了，好像 Rust 在前端领域的声音减少了，那么 Rust 在前端最近咋样了，都干了些啥？这篇文章我们来看下

## 目前用 Rust 搞了哪些前端基建工具

虽然有一些工具开头的那篇文章中已经讲了，但我这里还是要简单说一下。

## 框架类

### [Yew](https://github.com/yewstack/yew)

18 年 1 月开源的一个使用 Rust 写的 WebAssembly 前端 Web 框架，语法类似于 React，支持服务端渲染。内部使用的还是 React 那一套虚拟 DOM 和 diff 算法，性能一般般。个人感觉它的迭代速度好像有点慢，这么多年了还没出 1.0 版本。看官网的消息是目前已经在迭代下一个大版本了，后面性能应该会有提升。

一个简单的计数器代码长这个样子，和 React 还是很像的。

```rust
use yew::prelude::*;

#[function_component]
fn App() -> Html {
    let counter = use_state(|| 0);

    let onclick = {
        let counter = counter.clone();
        move |_| {
            let value = *counter + 1;
            counter.set(value);
        }
    };

    html! {
        <div>
            <button {onclick}>{ "+1" }</button>
            <p>{ *counter }</p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
```

### [Dioxus](https://github.com/DioxusLabs/dioxus/blob/master/notes/README/ZH_CN.md)

21 年初开源的跨端 GUI 框架，Dioxus 可以构建网页前端、桌面应用、静态网站、移动端应用、终端命令行程序等多类平台应用。这也是一个类似于 React 语法的框架，在 Web 端使用 WebAssembly，桌面和移动端使用系统 WebView，官方宣称在移动端性能远远超过 React Native。现在暂时还不推荐在生产上用，API 还不稳定。但是未来发展值得关注下。

一个计数器例子：

```rust
fn app(cx: Scope) -> Element {
    let mut count = use_state(cx, || 0);

    cx.render(rsx! {
        h1 { "counter: {count}" }
        button { onclick: move |_| count += 1, "Click me" }
    })
}
```

### [Tauri](https://github.com/tauri-apps/tauri)

19 年底开源的一个桌面应用跨端框架，底层使用系统 WebView 来进行渲染。这个应该是已经火出前端圈了，可以用来代替 Electron，之前很多人拿它来做过文章。我自己拿它也写过小工具，感觉开发体验还可以。目前官方已经在迭代 2.0 版本了，后续会支持移动端。当前正式版的 API 已经稳定了，最新的是 1.4 版本，可以上生产环境，但是有个问题是 WebView 在不同的平台上可能渲染效果有点难完全保持一致，所以可能不太适合需要 UI 还原度很高的场景，另外在低版本的一些操作系统上不能很好的支持，现阶段开发桌面跨端应用还是继续用 Electron 吧，但是可以纳入为未来的一种技术选型中

### [Leptos](https://github.com/leptos-rs/leptos)

22 年 8 月开源出来的一个 Rust 编写的全栈前端框架，支持服务端渲染，性能可以达到原生 Js 的 92%，性能比 Yew 要好。目前 API 已经基本稳定，可以上生产环境（相比 Yew 来说这迭代速度贼快了）。下面这个图是官方给出来的性能对比。它内部没有使用虚拟 DOM，而是使用细粒度更新，组件只会在创建的时候初始化渲染一次，并构建响应式系统来进行后续的细粒度更新。它的性能是要比上面提到的 Yew 要好得多，Dioxus 在 0.3 版本之后进行了专门的优化，性能和 Leptos 差不多。

![image-20230903183737450](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230903183737450.png)

一个计数器例子：

```rust
#[component]
pub fn Button(cx: Scope) -> impl IntoView {
  let (count, set_count) = create_signal(cx, 0);

  view! { cx,
    <button on:click=move |_| {
        set_count.update(|n| *n += 1);
      }
    >
      "Click me: "
      {count}
    </button>
  }
}
```

### 其它

还有 Seed、Percy 、Sycamore 这几个前端框架，最近几个月都没更新了，不用管它们了。

所以照目前趋势来看，WebAssembly 领域的前端框架主要关注上面的 Leptos 就好了，这个框架的迭代频率还是很快的。后续也可以持续关注 Dioxus 和 Tauri 这两个跨端框架，等它们完善之后，未来在技术选型上或许可以多一个选择。

## 运行时

### [Deno](https://github.com/denoland/deno)

还记得这玩意吗？最近没啥热度了。

当初刚出来的时候就说它主打安全、TypeScript 无需配置开箱即用，内置一整套完整工具链如代码格式化工具、测试工具、Bench 工具、打包工具等，库中心化管理等。

Node 之父也是 Deno 之父(Ryan Dahl) 说 Node.js 的依赖管理是个败笔，特别是它 node_modules，一开始搞的所有库都采用中心化管理，通过 Url 来进行引入，不支持 package.json。结果 2022 年 8 月就开始支持实验性引入 npm 包，23 年正式发布了对 package.json 和 npm 的支持，自己啪啪打自己的脸，还发布了一篇文章解释为什么要支持 npm: [为什么我们添加 Deno 对 package.json 的支持](https://deno.com/blog/package-json-support)。大概的意思就是之前走的不兼容 npm 的路线导致社区上带来了很多声音，比如不能去复用 npm 生态，不支持运行老的 node 项目，自己搞一套标准放弃以前 node 积累的生态就是搬起石头砸自己的脚。

另外之前 Deno 载入远程包的时候会产生重复依赖的问题，比如同一个包的不同版本 "https://deno.land/std@0.179.0/uuid/mod.ts" 和 https://deno.land/std@0.179.1/uuid/mod.ts，它们是几乎相同的代码，但是它们版本号都出现在了模块图中。

Deno 给出的一个现代化解决方案就是使用裸说明符来引入，比如在 deno.json 中通过这样的方式去同时支持引入 deno 三方包和 npm 三方包

```json
{
  "imports": {
    "oak": "deno:oak@12",
    "chalk": "npm:chalk@5"
  }
}
```

使用方式也很简单，还是和以前一样，oak(类似于 Koa 的服务端框架) 来自于 deno， chalk 来自于 npm。

```json
import oak from "oak";
import chalk from "chalk";
```

官方也提供了 NPM 编译器（DNT）将 Deno 的代码转换为 NPM 包可以供 Node.js 直接使用。

总的来说，Deno 在向好的方向发展，自己捡回了以前 node 积累下来的生态去走兼容路线，并且同时在发展自己的特色。

这里有一个官方给出的和 Node 的特性对比：

| Deno                                                                              | Node                         |
| --------------------------------------------------------------------------------- | ---------------------------- |
| [√] 数以百万计的社区模块                                                          | [√] 数以百万计的社区模块     |
| [√] 内置 V8 引擎                                                                  | [√] 内置 V8 引擎             |
| [√] 默认安全的运行时(使用文件/网络等能力时需要赋予权限，可以防止三方包的违法行为) | [×] 不保证运行时安全         |
| [√] 内置 TypeScript、JSX、一整套代码开发工具链                                    | [×] 要配置一大堆的工具链文件 |
| [√] 写原生 Rust 扩展很简单                                                        | [×] 写原生 C++ 扩展老复杂了  |
| [√] 内置浏览器标准 API                                                            | [×] 不覆盖完整的浏览器 API   |
| [√] 所有标准库                                                                    | [×] 有限的标准库             |

同时 Web Server 请求的性能也超 Node.js 一倍，当然这些都是实验性数据，实际上生产项目后效果怎样还要打个问号 ？

![image-20230830002425523](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230830002425523.png)

另外还有一个用 Zig 语言写的 Bun JavaScript 运行时也值得关注一下~

我个人对于 Deno 的发展还是抱着比较乐观的心态的，等他真正成熟了以后可以多一个选择，TypeScript 开箱即用以及零配置的理念还是很好的，对于开发者来说可以开箱即用，不需要搞一大堆的配置。关于安全的特性，Node.js 在 20 版本之后开启了实验性支持，这点也是跟随 Deno，但是其它 Deno 好用的特性不知道以后 Node.js 会不会跟上。

## 工具类

### [SWC](https://github.com/swc-project/swc)

swc 是用 Rust 编写的超快 TypeScript/JavaScript 编译器。同时支持 Rust 和 JavaScript ，可以用于代替 Babel。

这里是官方给的性能对比数据： [Benchmarks](https://swc.rs/docs/benchmarks)，总结一下就是同步性能 swc 远超 Babel 和 esbuild，异步和多线程的性能 swc 和 esbuild 差不多，但都是远超 Babel 的。

这两年里面也越来越多的前端项目都使用 swc/esbuild 来代替 Babel 了。Deno 打包构建也是使用的 swc。我自己目前也在开发的项目中使用，构建速度上确实有比较明显的提升。

虽然快是快了，但是有个问题是不兼容 JavaScript 的生态， swc 不兼容 Babel 的一些插件，但是常用的插件在 swc 都能够找到对应的代替方案。

另外还有个问题就是写 swc 插件不支持使用 JS/TS 去写插件，只能使用 Rust， 这就造成了上手成本高的问题，会劝退很多人，但是好处就是可以获得比较高的性能收益（不要提 Rust 开发效率低，在熟悉了之后其实写起来效率挺高的）。当你的需求需要定制化或比较复杂的时候你不会 Rust 并且社区上也没有对应的开源方案，那就只能抓瞎了，最后换回 Babel，这也是一个比较尴尬的地方。但是我相信发展下去也会越来越完善的。

使用其实也比较简单，在 Webpack 中可以直接引入 swc-loader 即可

```js
rules: [
  {
    test: /\.m?js$/,
    exclude: /(node_modules)/,
    use: {
      // 使用 `.swcrc` 文件来进行配置
      loader: 'swc-loader',
    },
  },
];
```

### [Lightning CSS](https://lightningcss.dev/)

21 年 10 月开源的一个非常快的 CSS 解析器、转换器、打包器和压缩器。它是 cssnano 的一个 Rust 代替方案，我们现在在 Webpack 中用的 postcss-loader 内部就使用了 cssnano。官方宣称它比使用 Node.js 实现的 cssnano 速度快 100 倍以上（每个 Rust 写的工具都要去跟 JS 比一比），它在单线程上每秒能压缩超过 270 万行代码。这是官方贴的对比图：

![image-20230903224919696](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230903224919696.png)

对于中小项目来说，开发者使用体感可能并不强，但是对于大项目来说，可能可以将代码打包速度提升很多很多，但打包速度快了可能会让你少了喝一杯咖啡(or 摸鱼)的时间？

另外就是使用它打包的代码体积也会更小一些，这个还是挺有用的

![image-20230903225449281](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230903225449281.png)

### Rspack

### Farm

### Rome
