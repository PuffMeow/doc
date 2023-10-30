## 简介

正如 WebAssembly 这个名字一样，它里面带着 "Web" ，在一开始它确实是为了解决网页的密集型计算性能和复用其它语言的代码到网页上这些问题而诞生的，但是不仅仅如此，它其实也能跑在任何非 Web 环境之下。比如我们前端常用的 Node.js 就支持直接运行 WASM 模块，因为在 V8 引擎里面已经内置了 WASM 运行时，除此之外，我们也可以直接使用专门的 WASM 运行时来运行其代码，比如用 Rust 编写的 Wasmer、Wasmtime 还有使用 C++ 编写的 WasmEdge。运行时提供了 WASM 模块执行的环境，并且运行时本身也是可以跨平台的，这就可以真正实现 `Write once, run everywhere`  的目标，另外，绝大多数的服务端语言都是可以编译成 WASM 模块的，但是最推荐的还是 C/C++/Rust，因为它们没有自带 GC，编译出来的 WASM 会比较小。本文我们就来说说如何在 Node.js 和 Wasmtime 中去运行我们使用 Rust 编译出来的 WASM 模块

## 编译 WASM 模块



## 运行在 Node.js 上



## 运行在 Wasmtime 上



## 性能对比



## 总结

