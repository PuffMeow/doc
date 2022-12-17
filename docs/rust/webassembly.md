## 官网简介

在 WebAssembly 官网上的介绍主要有四点：

### 高效

WebAssembly 有一套完整的语义，实际上 WASM 是体积小且加载快的二进制格式， 其目标就是充分发挥硬件的能力以达到原生语言的执行效率。

### 安全

WebAssembly 运行在一个内存安全，沙箱化的执行环境中，甚至可以在现有的 JavaScript 虚拟机中实现。在 web 环境中 ，WebAssembly 将会严格遵守同源策略以及浏览器安全策略

### 开放

WebAssembly 设计了一个非常规整的文本格式用来、调试、测试、实验、优化、学习、教学或者编写程序。可以以这种文本格式在 web 页面上查看 WASM 模块的源码。

### 标准

WebAssembly 在 web 中被设计成无版本、特性可测试、向后兼容的。WebAssembly 可以被 JavaScript 调用，进入 JavaScript 上下文，也可以像 Web API 一样调用浏览器的功能。WebAssembly 不仅可以运行在浏览器上，也可以运行在非 web 环境下（如 node.js、deno）。

## 兼容性

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668934320595-2bf73937-5d58-4115-ae18-d75c3b1c5973.png#averageHue=%23ebdac4&clientId=u855fa51d-5ec7-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=530&id=u5a2647ab&margin=%5Bobject%20Object%5D&name=image.png&originHeight=662&originWidth=1719&originalType=binary&ratio=1&rotation=0&showTitle=false&size=135309&status=done&style=none&taskId=u1a3d4b21-2a0e-47ab-937d-8be8d07c377&title=&width=1375.2)
可以看到目前的主流浏览器：Chrome、Edge、Safari、Firefox、Opera 都已经支持，Safari 11 版本（对应 IOS 11）以上的移动端对于 WebAssembly 的支持也比较好了，如果是低于 IOS 11 以下的系统就需要做逻辑兜底的处理了。所以如果是 B 端的项目，可以放心大胆的去在项目中进行落地，如果是 C 端的项目，可能会有一小部分用户的系统会不支持。

在正式去了解 WebAssembly 之前我们先来了解一下 LLVM 👇

## LLVM

LLVM 是模块化和可重用的编译器和工具链技术的集合，它是由 C++ 编写的。尽管叫做 LLVM，但它跟传统虚拟机几乎没啥关系。“LLVM” 这个名称本身并不是首字母缩写（并不是 Low Level Virtual Machine），LLVM 就是它的全称。它用于优化以任意的编程语言编写的程序的编译时间、链接时间、运行时间以及空闲时间，经过各种优化后，输出一套适合编译器系统的中间语言，目前采用它来做转换的语言有很多：Swift、Object-C、C#、Rust、Java 字节码等。
WASM 编译器底层也使用了 LLVM 去将原生代码（如 Rust、C、C++等）转换成 WASM 二进制代码。

### 编译器：

编译器包括三部分:
前端：负责处理源语言
优化器：负责优化代码
后端：负责处理目标语言

### 前端：

前端在接收到代码的时候就会去解析它，然后检查代码是否有语法或语法问题，然后代码就会转换成中间表示产物（intermediate representation) IR。

### 优化器:

优化器会去分析 IR 并将其转换成更加高效的代码，很少有编译器会有多个中间产物。优化器相当于一个中间产物到中间产物的转换器，其实就是在中间做了一层加工优化处理，优化器包括移除冗余的计算，去掉执行不到的冗余代码，还有一些其它的可以进行优化的选项。

### 后端：

后端会接收中间产物并转换它到其它语言（如机器码），它也可以链接多个后端去转换代码到一些其它语言。为了产生高效的机器代码，后端应该理解执行代码的体系结构。

### LLVM 的功能

LLVM 的核心是负责提供独立于源、目标的优化，并为许多 CPU 架构生成代码。这使得语言开发人员可以只创建一个前端，从源语言生成 LLVM 兼容的 IR 或 LLVM IR。

- LLVM 使用一种简单的低级语言，风格类似 C 语言
- LLVM 是强类型的
- LLVM 有严格定义的语义
- LLVM 具有精确的垃圾回收
- LLVM 提供了各种优化，可以根据需求选择。它具有积极的、标量的、过程间的、简单循环的和概要文件驱动的优化
- LLVM 提供了各种编译模型。分别是链接时间、安装时间、运行时和脱机
- LLVM 为各种目标架构生成机器码
- LLVM 提供 DWARF 调试信息（DWARF 是一种调试文件格式，许多编译器和调试器都使用它来支持源代码级别的调试）

LLVM 不是一个单一项目。它是子项目和其他项目的集合。这些项目被各种语言使用，比如 Rust、Ruby，Python, Haskell、C# 等。

了解了 LLVM 我们就正式进入 WASM 的内容介绍。

## WASM

> WASM 的主要目标就是要去构建高效的应用。

它是一个低级别的类汇编语言，设计用于高效执行和紧凑表达，它可以以接近原生代码的速度在所有 JS 引擎上执行 (手机、电脑浏览器、Node.js)。
每个 WebAssembly 文件都是一个高效、最优且自给自足的模块，称为 WebAssembly 模块(WASM)，它运行在沙盒上，内存安全，没有权限获取超出沙盒限制以外的东西，WebAssembly 是一个虚拟指令集结构。
JavaScript 代码的执行过程是：

- 把整个文件加载完成
- 将代码解析成抽象语法树
- 解释器进行解释然后编译再执行
- 最后再进行垃圾回收。

JavaScript 既是解释语言又是编译语言，所以 JavaScript 引擎在解析后启动执行。解释器执行代码的速度很快，但它每次解释时都会编译代码，这个阶段是解释代码的过程。
JavaScript 引擎有监视器 (在某些浏览器中称为分析器)。监视器跟踪代码执行情况，如果一个特定的代码块被频繁地执行，那么监视器将其标记为热代码。引擎使用即时 (JIT) 编译器编译代码块。引擎会花费一些时间进行编译，比如以纳秒为单位。花在这里的时间是值得的，因为下次调用函数时，执行速度会比之前快得多，因为编译型代码比解释型代码要快，这个阶段是优化代码阶段。
JavaScript 引擎增加了一(或两)层优化，监视器会持续监视代码的执行，监视器标记那些被执行频次更高的代码为高热点代码，引擎将进一步优化这段代码，这个优化需要很长时间。这个阶段产生运行速度非常快的高度优化过的代码，该阶段的优化代码执行速度要比上一段说的优化过的代码还要快得多。显然，引擎在这一阶段花费了更多时间，比如以毫秒为单位，这里耗费的时间将由代码性能和执行效率来进行补偿。
JavaScript 是一种动态类型的语言，引擎所能做的所有优化都是基于类型的推断。如果推断失败，那么将重新解释并执行代码，并删除优化过的代码，而不是抛出运行时异常。JavaScript 引擎实现必要的类型检查，并在推断的类型发生变化时提取优化的代码，但是如果重新推断类型，那花在上述代码优化阶段的功夫就白费了。开发中我们可以通过使用 TypeScript 来防止一些与类型相关的问题，使用 TypeScript，可以避免一些多态代码 (接受不同类型的代码) 的出现。在 JavaScript 引擎中，只接受一种类型的代码总是比多态代码运行得快，但是如果是 TS 里带有泛型的代码，那也会被影响到执行速度。
最后一步是垃圾回收，将删除内存中的所有活动对象，JavaScript 引擎中的垃圾回收采用标记清除算法，在垃圾回收过程中，JavaScript 引擎从根对象 (类似于 Node.js 中的全局对象) 开始。它查找从根对象开始引用的所有对象，并将它们标记为可访问对象，它将剩余的对象标记为不可访问的对象，最后清除不可访问的对象。

### 在 JS 引擎中 WebAssembly 是怎么执行的？

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668939110327-916ced83-2e60-45b5-9921-ceb222e529a3.png#averageHue=%23f6f6f6&clientId=ue822b59c-9418-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=190&id=NO2So&margin=%5Bobject%20Object%5D&name=image.png&originHeight=237&originWidth=840&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25022&status=done&style=none&taskId=u2e92b722-b816-48ca-b408-8017cdd912f&title=&width=672)
WASM 是二进制格式并且已经被编译和优化过了，首先 JS 引擎会去加载 WASM 代码，然后解码并转换成模块的内部表达（即 AST)。这个阶段是解码阶段，解码阶段要远远比 JS 的编译阶段要快。
接下来，解码后的 WASM 进入编译阶段，在这个阶段，对模块进行验证，在验证期间，对代码进行某些条件检查，以确保模块是安全的，没有任何有害的代码，在验证过程中对函数、指令序列和堆栈的使用进行类型检查，然后将验证过的代码编译为机器码。由于 WASM 二进制代码已经提前编译和优化过了，所以在其编译阶段会更快，在这个阶段，WASM 代码会被转换为机器码。
最后编译过的代码进入执行阶段，执行阶段，模块会被实例化并执行。在实例化的时候，JS 引擎会实例化状态和执行栈，最后再执行模块。
WASM 的另一个优点是模块可以从第一个字节开始编译和实例化，因此，JS 引擎不需要等到整个模块被下载，这可以进一步提高 WASM 的性能。
WASM 快的原因是因为它的执行步骤要比 JS 的执行步骤少，其二进制代码已经经过了优化和编译，并且可以进行流式编译。
但是总的来说，WASM 并不是总是比原生 JS 代码执行速度要快的，因为 WASM 代码和 JS 引擎交互和实例化也是要耗费时间的，所以需要考虑好使用场景，在一些简单的计算场景里，WASM 和 JS 引擎的交互时间都会远远超出其本身的执行时间，这种时候还不如直接使用 JS 来编写代码来得快，另一方面，也要减少 WASM 和 JS 引擎之间的数据交互，因为每次两者的数据交互都会耗费一定的时间。

### WASM 开发工具

编译器可以将高级代码转换为 WASM 二进制代码，但是生成的二进制文件都是经过了相关的压缩和性能优化的。它很难理解、调试和验证 (它是一堆十六进制数)。转换 WASM 二进制到原始源代码很难。WebAssembly 二进制工具包 (WABT) 帮助将 WASM 二进制转换为人类可读的格式，例如 WASM   文本 (WAST) 格式或 C 语言原生代码。WABT 工具包在 WASM 的开发生态中很重要，是我们开发 WASM 中的重要一环。
WABT（WebAssembly Binary ToolKit) 有以下的能力：

- wat2wasm：转换 WAST 到 WASM
- wasm2wat：转换 WASM 到 WAST
- wasm2c：转换 WASM 到 C 语言
- wast2json：转换 WAST 到 JSON
- wasm-validate：验证 WASM 是否按照规范来构建
- wasm-decomplie：反编译 WASM 代码到类似于 C 语言的语法的可读代码
- 还有一些其它的能力可以参考上面的地址

## 语言的选择

要写 WebAssembly 应用的话首先不能选用有 GC 的语言，不然垃圾收集器的代码也会占用很大一部分的体积，对 WASM 文件的初始化加载并不友好，比较好的选择就是 C/C++/Rust 这几个没有 GC 的语言，当然使用 Go、C#、TypeScript 这些也是可以的，但是性能也会没有 C/C++/Rust 这么好。从上面几个语言来看 Rust 对于前端选手来说会稍微亲切一些，从语法上看和 TS 有一点点的相似（但是学下去还是要比 TS 难得多的）， Rust 的官方和社区对于 WASM 都有着一流的支持，而且它也是一门系统级编程语言，有一个和 npm 一样好用的包管理器，同时也拥有着很好的性能，用来写 WASM 再好不过了。

## Rust 开发 WASM

Rust 提供了对 WASM 一流的支持，Rust 无需 GC 、零运行时开销的特点也让它成为了 WASM 的完美候选者。
Rust 是怎么编译成 WASM 代码的：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668939990971-4192e041-1a8b-4ad6-b334-0bb1ff253ec9.png#averageHue=%23f5f5f5&clientId=ue822b59c-9418-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=163&id=u57cfe451&margin=%5Bobject%20Object%5D&name=image.png&originHeight=204&originWidth=1382&originalType=binary&ratio=1&rotation=0&showTitle=false&size=34496&status=done&style=none&taskId=uc580ac8d-9602-4308-a0c3-7ef78cefa62&title=&width=1105.6)

### 开发环境搭建

#### wasm-pack(WASM 打包器)

一个专门用于打包、发布 wasm 的工具，可以用于构建可在 npm 发布的 wasm 工具包。
当我们开发完 wasm 模块时，可以直接使用 `wasm-pack publish` 命令把我们开发的 wasm 包发布到 npm 上。
使用 `cargo install wasm-pack` 命令来进行安装。

#### 创建 Rust 工程

```bash
cargo new example --lib
```

然后在其目录下控制台运行

```
npm init -y
```

package.json 内容如下:

```json
{
  "name": "example",
  "version": "0.1.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "rimraf dist pkg && webpack",
    "start": "rimraf dist pkg && webpack-dev-server",
    "test": "cargo test && wasm-pack test --headless"
  },
  "devDependencies": {
    "@wasm-tool/wasm-pack-plugin": "^1.6.0",
    "html-webpack-plugin": "^5.5.0",
    "rimraf": "^3.0.2",
    "webpack": "^5.75.0",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.11.1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

cargo.toml 依赖如下

```toml
[package]
categories = ["wasm"]
description = ""
edition = "2021"
name = "example"
version = "0.1.0"

[lib]
# 一个动态的系统库将会产生，类似于C共享库。当编译一个从其它语言加载调用的动态库时这属性将会被使用
crate-type = ["cdylib"]

[features]

[dependencies]
# 用于将实体从 Rust 绑定到 JavaScript，或反过来。
# 提供了 JS 和 WASM 之间的通道，用来传递对象、字符串、数组这些数据类型
wasm-bindgen = "0.2.83"
wee_alloc = {version = "0.4.5", optional = true}

# web-sys 可以和 JS 的 API 进行交互，比如 DOM
[dependencies.web-sys]
features = ["console"]
version = "0.3.60"

[dev-dependencies]
# 用于所有JS环境 (如Node.js和浏览器)中的 JS 全局对象和函数的绑定
js-sys = "0.3.60"

# 0 – 不优化
# 1 – 基础优化
# 2 – 更多优化
# 3 – 全量优化，关注性能时建议开启此项
# s – 优化二进制大小
# z – 优化二进制大小同时关闭循环向量，关注体积时建议开启此项
[profile.dev]
debug = true
# link time optimize LLVM 的链接时间优化，false 时只会优化当前包，true/fat会跨依赖寻找关系图里的所有包进行优化
# 其它选项还有 off-关闭优化，thin是fat的更快版本
lto = true
opt-level = 'z'

[profile.release]
debug = false
lto = true
opt-level = 'z'

```

#### 内存分配器

上面我们在依赖中加入了 wee_alloc 这个内存分配器，对比默认的 10kb 大小的分配器，它只有 1kb 的大小，但是它要比默认的分配器速度要慢，所以默认不开启，为减少模块打包时的大小，可以使用这个内存分配器。
在 src/lib.rs 中使用的代码如下：

```rust
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
```

#### Webpack 配置

项目根目录下新建 webpack.config.js 和 inde.html 文件，并新建 js/index.js 文件用于调用 wasm 暴露的函数。
WasmPackPlugin 这个插件会帮我们在运行 webpack 时自动去打包 wasm 模块生成可直接用于发布的 npm 模块。

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const dist = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: {
    index: './js/index.js',
  },
  output: {
    path: dist,
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
      inject: false,
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
```

#### 最终的项目目录

![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668945443430-ac700b58-13f9-42c0-ad4c-e8be33c41cbc.png#averageHue=%2322272d&clientId=ua92e12a1-05b3-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=303&id=u76ce9c87&margin=%5Bobject%20Object%5D&name=image.png&originHeight=379&originWidth=334&originalType=binary&ratio=1&rotation=0&showTitle=false&size=19948&status=done&style=none&taskId=u179df1c6-c928-41ec-bc3b-df1ef8c4b50&title=&width=267.2)
其中 pkg 文件夹是运行 npm start 之后由 webpack 生成的 wasm 打包产物。

### 功能开发

#### JS 调用 Rust

这里我们写一个斐波那契函数

```rust
// 斐波那契数列，时间复杂度 O(2^n)
#[wasm_bindgen]
pub fn fib(n: i32) -> i32 {
    match n {
        1 => 0,
        2 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}
```

然后在根目录下的 js/index.js 中编写如下代码进行调用

```javascript
async function main() {
  const module = await import('../pkg/index');
  console.log(module.fib(30));
}

main();
```

接下来运行 npm i 安装好项目依赖，再启动项目 npm start，在 localhost:8080 上面就能看到控制台打印出来了结果。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668949794879-f7412811-376a-4d7d-b9d3-ca5e2e6d0a1e.png#averageHue=%23eac58d&clientId=ua5321258-1ea0-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=142&id=u8d7f33c3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=178&originWidth=981&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23066&status=done&style=none&taskId=u839d852f-d7b5-4846-bc5c-5ad0bece869&title=&width=784.8)
再看 wasm-pack 给我们生成的 wasm 胶水代码，它在 pkg/index_bg.js 中，可以看到生成的代码中已经帮我们做好了一些边界判断和异常处理，然后 JS 侧直接引入这个文件去调用我们编写好的函数即可。
如果你不想使用 webpack 的插件来生成 wasm 包，也可以自己手动执行 `wasm-pack build` 命令来生成。

```javascript
import * as wasm from './index_bg.wasm';

const lTextDecoder =
  typeof TextDecoder === 'undefined'
    ? (0, module.require)('util').TextDecoder
    : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
  if (cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function _assertNum(n) {
  if (typeof n !== 'number') throw new Error('expected a number argument');
}
/**
 * @param {number} n
 * @returns {number}
 */
export function fib(n) {
  _assertNum(n);
  const ret = wasm.fib(n);
  return ret;
}

export function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
```

上面的 TextDecoder 是一个 JS 内建对象，可以将值读取解析成 JS 字符串
用法：`const decoder = newTextDecoder([label], [options]);`

- label — 编码格式，默认为 utf-8，也支持其他编码格式。
- options — 可选对象：
  - fatal — 布尔值，如果为 true 则为无效（不可解码）字符抛出异常，否则（默认）用字符 \uFFFD 替换无效字符。
  - ignoreBOM —— 布尔值，如果为 true 则忽略 BOM

`decoder.decode([input], [options])`
调用其 decode 方法，可以进行解码，其还可以接收一个 input 参数确定需要解码的 Buffer

#### Rust 调用 JS

项目根目录下创建一个 js2rust 目录，然后新建 point.js 文件，里面的代码是给 Rust 侧调用的：

```javascript
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get_x() {
    return this.x;
  }

  get_y() {
    return this.y;
  }

  set_x(x) {
    this.x = x;
  }

  set_y(y) {
    this.y = y;
  }

  add(p1) {
    this.x += p1.x;
    this.y += p1.y;
  }
}
```

我们上面创建了一个 JS 侧的 Point 对象，然后在 Rust 端我们看看如何进行调用：
先去到 src/lib.rs 目录下，假入下面的代码

```rust
// 调用 JS 中的方法
#[wasm_bindgen(module = "/js2rust/point.js")]
extern "C" {
    pub type Point;

    #[wasm_bindgen(constructor)]
    fn new(x: i32, y: i32) -> Point;

    #[wasm_bindgen(method, getter)]
    fn get_x(this: &Point) -> i32;

    #[wasm_bindgen(method, getter)]
    fn get_y(this: &Point) -> i32;

    #[wasm_bindgen(method, setter)] //5
    fn set_x(this: &Point, x: i32) -> i32;

    #[wasm_bindgen(method, setter)]
    fn set_y(this: &Point, y: i32) -> i32;

    #[wasm_bindgen(method)]
    fn add(this: &Point, p: Point);
}

// 这个函数 JS 侧可以继续进行调用，最终会返回一个 point 对象实例
#[wasm_bindgen]
pub fn test_point() -> Point {
    let p = Point::new(10, 10);
    let p1 = Point::new(6, 3);
    p.add(p1);
    p
}
```

更多相关介绍可以参考[官方文档](https://rustwasm.github.io/wasm-bindgen/examples/index.html)

### 发布

当我们调试好代码之后，就可以在 npm 上发布我们的 wasm 包了。
直接 cd 到 pkg 目录下，修改我们的 package.json 的 name 为 example-fib， 然后执行 `npm publish`就可以发布到 npm 上了，后续可以在我们自己的项目中 `npm install example-fib` 下载来调用

```javascript
import { fib } from 'example-fib';

async function main() {
  // const module = await import("../pkg/index");
  // console.log(module.fib(30));

  console.log(fib(40));
}

main();
```

我们通过 npm 包的形式引入我们的 wasm 斐波那契函数，可以看到一样可以调用成功。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668949461889-124963b3-c5f7-496c-8e60-a40f1af8c444.png#averageHue=%23eac58d&clientId=ua92e12a1-05b3-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=134&id=uce1ae7e9&margin=%5Bobject%20Object%5D&name=image.png&originHeight=168&originWidth=981&originalType=binary&ratio=1&rotation=0&showTitle=false&size=22889&status=done&style=none&taskId=u26e43c10-3354-4e7e-bab9-19281ab0bbe&title=&width=784.8)

### WASM 和 JS 性能比较

我写了一段测试代码测试上面写的斐波那契数列执行时间，WASM 版本和 JS 版本的执行时间比较如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669136284614-11f2bdd3-df73-494f-8364-d2af5b676a9f.png#averageHue=%23e4e1df&clientId=u5e276077-7ee1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=98&id=ua60b9edc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=123&originWidth=640&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13355&status=done&style=none&taskId=u5b89bd45-8eed-41d6-a111-a0492b19704&title=&width=512)
JS 版本的 Fibonacci 函数

```javascript
function jsFib(n) {
  if (n === 1 || n === 2) return 1;
  return jsFib(n - 1) + jsFib(n - 2);
}
```

从结果中我们可以看到，在时间复杂度为 O(2^n) 的算法中， WASM 的性能是要好于 JS 的，i 的值越大，WASM 的优势就会越明显，但是如果 i 的值比较小，WASM 的性能不一定比得过 JS，因为其中 JS 和 WASM 的交互就有一定的时间成本，当然这里的比较也是在 WASM 和 JS 侧数据交互比较少的情况，如果数据交互量大了，那么速度也是会受到一定的影响的，所以在业务开发中如果使用到 WASM 模块，那么就需要尽可能减少 JS 和 WASM 之间的数据传输。

同时这里也放一篇相关的文章供大家参考，这篇文章主要讲 Rust 版本的 Markdown 解析器编译到 WASM 后和 JS 版本的 Markdown 解析器做性能对比：
[https://sendilkumarn.com/blog/increase-rust-wasm-performance/](https://sendilkumarn.com/blog/increase-rust-wasm-performance/)
下面我贴一下作者的最终对比结果：
未经过优化的 WASM 代码：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668953030440-b671d4e0-f5ec-461f-a428-7a749728d413.png#averageHue=%23f4f4f2&clientId=ua5321258-1ea0-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=268&id=u415d4219&margin=%5Bobject%20Object%5D&name=image.png&originHeight=335&originWidth=616&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21088&status=done&style=none&taskId=uf96002f3-bd1f-4fea-93c5-f793638ca8d&title=&width=492.8)

Rust 开启 lto 优化和优化级别“3”，性能最优
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668953091554-c1e814aa-7196-4172-a22f-bcb4a4713a47.png#averageHue=%23f5f5f5&clientId=ua5321258-1ea0-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=271&id=ue6f2d20d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=339&originWidth=617&originalType=binary&ratio=1&rotation=0&showTitle=false&size=22553&status=done&style=none&taskId=u97fd77bf-c12b-470a-82a6-46cb7bc5fc4&title=&width=493.6)

Rust 开启 lot 和 优化级别 "z"，性能有所降低，但是打包出来的 WASM 模块体积会更小
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668953265730-ad68973f-9923-473c-98ac-6779b4398c21.png#averageHue=%23f4f2e7&clientId=ua5321258-1ea0-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=261&id=u1f0100bd&margin=%5Bobject%20Object%5D&name=image.png&originHeight=326&originWidth=620&originalType=binary&ratio=1&rotation=0&showTitle=false&size=22042&status=done&style=none&taskId=u81c8895a-747b-4c07-bf8e-608a0489784&title=&width=496)

### 代码体积优化

#### WASM 内存模型

在 JS 引擎内部，WASM 和 JS 在不同的位置运行。跨越它们之间的边界进行交互是有成本的。浏览器内部用了一些手段来降低这个成本，但是当程序跨越这个边界时，这个行为很快就会成为程序的主要性能瓶颈。以减少边界跨越的方式设计 WASM 程序是很重要。但是一旦程序变大，就很难控制。为了防止边界跨越，WASM 模块附带了内存模型。WASM 模块中的内存是线性内存的向量。线性内存模型是一种内存寻址技术，其中内存被组织在一个块线性地址空间中。它也被称为扁平内存模型。线性内存模型使理解、编程和表示内存变得更容易。但是它也有巨大的缺点，例如重新排列内存中的元素需要大量的执行时间，并且会浪费大量的内存区域。在这里，内存表示一个包含未解释数据的原始字节向量。WASM 使用可调整大小的数组缓冲区来保存内存的原始字节。创建的内存可以从 JS 和 WASM 模块中进行访问和改变。

#### WASM 内存分析

使用 twiggy 这个 crate

```bash
cargo install twiggy
```

使用这个包可以看到相关代码大小占用以及寻找某些编译器不知道如何进行优化的冗余代码
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669130538272-696a1439-bcca-428c-8c92-5db6867f6a27.png#averageHue=%23292d36&clientId=u5e276077-7ee1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=300&id=secKz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=480&originWidth=876&originalType=binary&ratio=1&rotation=0&showTitle=false&size=53279&status=done&style=none&taskId=u4304dc50-f74e-44e6-9c41-1c5934844e6&title=&width=547.7999877929688)
这样的一段代码编译成 WASM 之后，我们看一下其大小，
输入命令 `twiggy top -n 10 ./pkg/index_bg.wasm` 对输出的 pkg/index_bg.wasm 文件进行代码分析可以看到下面的结果，top -n 10 表示取排名前十的文件，我们可以看到这个 wasm 文件总共占了 8kb 的大小，我们可以根据相关的信息来进行代码优化，越复杂的应用最后展示的信息会越明朗，因为我们这里的代码比较简单，展示出来的基本都是一些内置函数的代码大小，更多相关信息可以查看 twiggy 文档。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669130463133-a0543a09-29ed-4320-a3b7-a3a68a1fb1de.png#averageHue=%232d333d&clientId=u5e276077-7ee1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=223&id=ucf83d30a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=279&originWidth=1018&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41155&status=done&style=none&taskId=u3b286063-7229-4960-b28d-12e16f493f6&title=&width=814.4)

#### 进一步压缩体积

使用[ wasm-opt ](https://rustwasm.github.io/docs/wasm-bindgen/examples/add.html)这个 C++ 编写的工具可以进一步去压缩 wasm 模块的体积大小。[下载](https://github.com/WebAssembly/binaryen/releases) 完后将其解压放到 ~/.cargo/bin 目录下，然后 `wasm-opt -h` 之后控制台能打印出帮助信息表示安装成功了。
我们拿上面说到的 8kb 的 wasm 文件试着压缩一下，在项目根目录下执行
`wasm-opt -Oz pkg/index_bg.wasm -o pkg/index_opt_bg.wasm`，Oz 选项代表极致压缩大小。
然后查看生成的 index_opt_bg.wasm 文件，压缩前 7.86 kb，压缩后 6.12 kb。正常的压缩效率会在 10%~20% 左右。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669534053834-7e1fa44b-457a-4fde-9f8c-7c3a05678671.png#averageHue=%23f7f6f4&clientId=u5cd0ab4f-accf-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=183&id=u494b5a2c&margin=%5Bobject%20Object%5D&name=image.png&originHeight=237&originWidth=271&originalType=binary&ratio=1&rotation=0&showTitle=false&size=9253&status=done&style=none&taskId=ua6c90bc1-c2f1-4daf-904e-a56b91ac942&title=&width=208.8000030517578)![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669534040879-2744e7dc-99cd-4cc2-b546-36fe502c9b87.png#averageHue=%23f8f6f4&clientId=u5cd0ab4f-accf-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=194&id=EzRAw&margin=%5Bobject%20Object%5D&name=image.png&originHeight=290&originWidth=280&originalType=binary&ratio=1&rotation=0&showTitle=false&size=11625&status=done&style=none&taskId=u9d6b5561-ac94-4906-85a7-ed55f46d81b&title=&width=187)

#### WASM 包发布

cd 到根目录下的 pkg 目录下，然后执行 `npm publish` 就能把包发布到 npm 仓库上，然后在 JS 端 webpack 开启 WASM 实验性配置，就能使用起来了，在一些复杂的计算场景中可以使用 WASM 来提高大量的性能，使用 WASM 之后可以将一些复杂计算逻辑放到客户端来做，这样就能够减少服务器的压力了，节省服务器的一些成本。

## WASM 适用范围

| 图片/视频编辑 | 游戏          | 流媒体应用         |
| ------------- | ------------- | ------------------ |
| 图像识别      | 直播          | 虚拟现实           |
| CAD 软件      | 加密/解密工具 | 可视化/仿真平台... |

## WASM 是否要去代替 JavaScript？

WebAssembly 是浏览器中的第四门语言，其主要是被设计为 JavaScript 的一个完善补充，而不是代替品。
其它语言编写的库可以很好的去移植到 Web 中，和 JavaScript 的内容结合到一起使用，大多数 HTML/CSS/JavaScript 应用结合几个高性能的 WebAssembly 模块（例如，绘图，模拟，图像/声音/视频处理，可视化，动画，压缩等等我们今天可以在 asm.js 中看到的例子）能够允许开发者像今天我们所用的 JS 库一样去重用流行的 WASM 库。

## WASM 开发框架

开发软件时使用 WASM 的方式有几种：

- 纯 WASM 实现，包括 UI 和逻辑
- UI 使用 HTML/CSS/JS，逻辑计算使用 WASM
- 复用其它语言中的库，使用 WASM 来移植到已有的 Web 软件中

如果需要使用纯 WASM 来开发应用，不同语言和 WASM 开发相关的框架：

- Rust： [Yew](https://yew.rs/) (语法类似于 React)、[Seed](https://github.com/seed-rs/seed)、[Perseus](https://link.zhihu.com/?target=https%3A//github.com/arctic-hen7/perseus)
- Go：Vecty、Vugu
- C#：Blazor

虽然现在可以用 WASM 来编写 Web 应用了，但是还存在一定的局限性，就是无法直接从 WASM 中直接操作 DOM，还是需要通过 FFI 来进行调用 JS 提供的能力。

## WASM 相关的库

图片处理：[Photon](https://github.com/silvia-odwyer/photon#get-started-with-webassembly)，这是一个高性能的 Rust 编写的图片处理库，支持 Rust 原生调用、浏览器中使用 WASM 调用、在 Node 中使用 WASM 调用。
WASM 运行时： [Wasmer](https://github.com/wasmerio/wasmer)，[Wasmtime](https://github.com/bytecodealliance/wasmtime)，其可以嵌入到任何编程语言并且可以在多种设备上去运行 WebAssembly 。根据 Wasmer 官网介绍，quick.js 引擎的 WASM 版本也可以在一些脱离于浏览器之外的其它环境上去运行。

## 现有的使用 WASM 编写的应用

### PSPDFKit

[产品官网](https://pspdfkit.com/getting-started/web/?frontend=vanillajs&download=npm&integration=module)
其官网介绍了他们的 Web 版本是如何使用 WASM 进行优化的，其中他们主要使用 WASM 做了 4 个优化的工作，其介绍的相关文章在这里[ 优化 WASM 的启动性能](https://pspdfkit.com/blog/2018/optimize-webassembly-startup-performance/)，他们主要做的加载优化是下面的 4 个方面：

- 文件缓存，因为 .wasm 文件和 .js 文件类似，静态资源是从网络进行加载的，所以可以进行浏览器缓存，可以强制或者协商缓存到本地，这个一般需要服务端来配合。
- 使用流实例化
- 把已经编译好的 WASM 模块缓存到 IndexDB 中加快后续加载速度
- 使用对象池缓存预热实例

这是他们给出的一段主要代码：

```javascript
const MODULE_VERSION = 1;

// 从 IndexDB 加载缓存
const cache = await getCache('WASMCache');
let compiledModule = await cache.get(MODULE_VERSION);

// 创建一个 WebAssembly.Module 实例，如果缓存中存在则直接返回缓存
if (compiledModule) {
  return WebAssembly.instantiate(compiledModule, imports);
}

const fetchPromise = fetch('module.wasm');

let instantiatePromise;

// 检测浏览器是否支持 WebAssembly.instantiateStreaming 流式实例化
const isInstantiateStreamingSupported =
  typeof WebAssembly.instantiateStreaming == 'function';

if (isInstantiateStreamingSupported) {
  instantiatePromise = WebAssembly.instantiateStreaming(fetchPromise, imports);
} else {
  // 不支持则采用原始的实例化方式
  instantiatePromise = fetchPromise
    .then((response) => response.arrayBuffer())
    .then((buffer) => WebAssembly.instantiate(buffer, imports));
}

const result = await instantiatePromise;

// 将加载结果缓存到 IndexDB 中
cache.put(MODULE_VERSION, result.module);
return result.instance;
```

其中流实例化这个方式还是比较新的特性，目前兼容性并不是特别好，所以需要做好兜底处理，从下图可以看到在 Safari 15 以上才支持。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668961210570-5b8bb4e7-5690-405c-b567-ed229a25c374.png#averageHue=%23e9dac5&clientId=u5f803c71-0546-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=396&id=u6b7e2520&margin=%5Bobject%20Object%5D&name=image.png&originHeight=495&originWidth=1706&originalType=binary&ratio=1&rotation=0&showTitle=false&size=99857&status=done&style=none&taskId=u7a27ecf4-8ba6-430c-be5d-d13dea8d90f&title=&width=1364.8)
PSPDFKit 使用流实例化和未使用流实例化，在 Firfox 上测试结果，使用后快了 1.8 倍
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1669129851164-eb967a19-46a8-44fe-8a8e-225039936f0a.png#averageHue=%235d6b77&clientId=u5e276077-7ee1-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=344&id=ueac16511&margin=%5Bobject%20Object%5D&name=image.png&originHeight=595&originWidth=947&originalType=binary&ratio=1&rotation=0&showTitle=false&size=53850&status=done&style=none&taskId=u86d371d7-de48-4332-a5c2-e71142e4b40&title=&width=547)

### 谷歌地球

可以看到谷歌地球的加载过程中除了 WASM 模块文件外还有大量的 WebWorker 相关的文件，可以说为了在浏览器跑起这个大型 3D 应用是下足了苦心的。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668960483516-cb768515-d49c-41a0-a86c-403a5b59b416.png#averageHue=%23151616&clientId=u5f803c71-0546-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=766&id=udc246894&margin=%5Bobject%20Object%5D&name=image.png&originHeight=958&originWidth=1173&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1359683&status=done&style=none&taskId=u553ee51a-9894-4e5f-a94e-9efd6258192&title=&width=938.4)

### Figma

一个基于浏览器的多人实时协作 UI 设计工具，以前的 Figma 使用 asm.js 来加快文件读取速度，现在改用 WASM 后，它的速度又飙升了很多。从它的官网上，也是可以瞄到有 WASM 的痕迹， wasm.br 结尾的文件是使用 Brotil 技术来进行压缩过的，其压缩率比 gzip 都要高，Brotil 目前已经被大多数浏览器实现，如果客户端声称接受 Accept-Encoding: br，服务器就可以返回 wasm.br 文件
![image.png](https://cdn.nlark.com/yuque/0/2022/png/2526622/1668961987353-01fdd82c-c3be-4602-b89c-0a56eb10f7a7.png#averageHue=%23f2f2f2&clientId=u5f803c71-0546-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=759&id=u796f1c8b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=949&originWidth=1403&originalType=binary&ratio=1&rotation=0&showTitle=false&size=114489&status=done&style=none&taskId=u247f6aa8-13cd-43bd-b8e9-6f7148cb78f&title=&width=1122.4)

### AutoCAD Web

AutoCAD 是一款自动计算机辅助设计软件，用于绘制二维制图和基本三维设计，用于土木建筑，装饰装潢，工业制图，工程制图，电子工业，服装加工等多方面领域。

### eBay

[一个 eBay 实际项目中使用 WASM 的案例](https://tech.ebayinc.com/engineering/webassembly-at-ebay-a-real-world-use-case/)，通过 WASM 和 WebWorker 结合使得其应用的条形码扫描成功率最后达到了将近 100%

### 其它

当然还有很多软件也用了 WASM，比如 B 站的视频上传、Web 版本 PhotoShop 等等

## WASM 的未来

WASI（WebAssembly System Interface），一种使用标准化系统接口在任何系统上可移植地运行 WebAssembly 的方法。随着 WASM 的性能越来越高，WASI 可以证明是在任何操作系统上运行任何代码的可行方式，其不受操作系统限制去操作系统级接口/资源。
目前 WebAssembly 只有几年的历史，WASM 在 2019 年发布 1.0 版本后，2022 年 4 月也发布了 2.0 的草案。预计几年后，Yew 等框架将与 React、Angular 和 Vue 变得一样普遍，未来仍然大有可为。
