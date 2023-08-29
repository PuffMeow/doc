# Rust 在前端都干了些啥？

## 前言

这里有一篇两年前的文章：[Rust 是 JavaScript 基础设施的未来](https://mp.weixin.qq.com/s?__biz=MzkxNDIzNTg4MA==&mid=2247485792&idx=1&sn=682a4dee7ce4d3b47a81baf9ebd7a98a)，应该还是有挺多人看到过的。当时在前端社区上还掀起了一阵 Rust 风，有人说怎么天天造轮子，有人说实在是学不动了，也有人抱着积极的心态去拥抱新东西。

那么现在两年已经过去了， Rust 在前端最近咋样了，它都干了些啥？

## 目前用 Rust 搞了哪些前端基建工具

虽然有一些工具开头的那篇文章中已经讲了，但我这里还是要简单说一下。

### [SWC](https://github.com/swc-project/swc)

swc 是用 Rust 编写的超快 TypeScript/JavaScript 编译器。同时支持 Rust 和 JavaScript ，可以用于代替 Babel。

这里是官方给的性能对比数据： [Benchmarks](https://swc.rs/docs/benchmarks)

结论是同步性能  swc  远超 Babel 和 esbuild，异步和多线程的性能 swc 和 esbuild 差不多，但都是远超 Babel 的。

这两年里面也越来越多的前端项目都使用 swc/esbuild 来代替 Babel 了。

### [Deno](https://github.com/denoland/deno)

还记得这玩意吗？最近没啥热度了。

当初刚出来的时候就说它主打安全、TypeScript 无需配置开箱即用，内置一整套完整工具链如代码格式化工具、测试工具、Bench 工具、打包工具等，库中心化管理等。

Node 之父也是 Deno 之父(Ryan Dahl) 说 Node.js 的依赖管理是个败笔，特别是它 node_modules，一开始搞的所有库都采用中心化管理，通过 Url 来进行引入，不支持 package.json。结果2022年8月就开始支持实验性引入 npm 包，23年正式发布了对 package.json 和 npm 的支持，自己啪啪打自己的脸，还发布了一篇文章解释为什么要支持 npm: [为什么我们添加 Deno 对 package.json 的支持](https://deno.com/blog/package-json-support)。大概的意思就是之前走的不兼容 npm 的路线导致社区上带来了很多声音，比如不能去复用 npm 生态，不支持运行老的 node 项目，自己搞一套标准放弃以前 node 积累的生态就是搬起石头砸自己的脚。

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

使用方式也很简单，还是和以前一样，oak(类似于 Koa 的服务端框架) 来自于 deno， chalk 来自于 npm

```json
import oak from "oak";
import chalk from "chalk";
```

总的来说，Deno 在向好的方向发展，自己捡回了以前 node 积累下来的生态去走兼容路线，并且同时在发展自己的特色。

这里有一个官方给出的和 Node 的特性对比：

| Deno                                                         | Node                         |
| ------------------------------------------------------------ | ---------------------------- |
| [√] 数以百万计的社区模块                                     | [√] 数以百万计的社区模块     |
| [√] 内置 V8 引擎                                             | [√] 内置 V8 引擎             |
| [√] 默认安全的运行时(使用文件/网络等能力时需要赋予权限，可以防止三方包的违法行为) | [×] 不保证运行时安全         |
| [√] 内置 TypeScript、JSX、一整套代码开发工具链               | [×] 要配置一大堆的工具链文件 |
| [√] 写原生 Rust 扩展很简单                                   | [×] 写原生 C++ 扩展老复杂了  |
| [√] 内置浏览器标准 API                                       | [×] 不覆盖完整的浏览器 API   |
| [√] 所有标准库                                               | [×] 有限的标准库             |

 同时网络请求的性能也超 Node.js 一倍，当然这些都是实验性数据，实际上生产项目后效果怎样还要打个问号 ？

![image-20230830002425523](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230830002425523.png)

另外还有一个用 Zig 语言写的 Bun JavaScript 运行时也值得关注一下~