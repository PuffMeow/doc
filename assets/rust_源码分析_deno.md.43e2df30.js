import{_ as s,o as n,c as a,Q as l}from"./chunks/framework.18ed7b43.js";const m=JSON.parse('{"title":"深入浅出 Deno，JS 运行时是如何实现的？","description":"","frontmatter":{},"headers":[],"relativePath":"rust/源码分析/deno.md","filePath":"rust/源码分析/deno.md","lastUpdated":1684561290000}'),p={name:"rust/源码分析/deno.md"},o=l(`<h1 id="深入浅出-deno-js-运行时是如何实现的" tabindex="-1">深入浅出 Deno，JS 运行时是如何实现的？ <a class="header-anchor" href="#深入浅出-deno-js-运行时是如何实现的" aria-label="Permalink to &quot;深入浅出 Deno，JS 运行时是如何实现的？&quot;">​</a></h1><h2 id="为什么要了解-deno-源码" tabindex="-1">为什么要了解 Deno 源码？ <a class="header-anchor" href="#为什么要了解-deno-源码" aria-label="Permalink to &quot;为什么要了解 Deno 源码？&quot;">​</a></h2><p>Deno 和 Node.js 都是同一个作者 Ryan Dahl， Ryan Dahl 就是因为对 Node.js 感到不满，特别是在安全性和 package.json 的设计上，所以就另起炉灶搞了个 Deno。Deno 、 Node.js 或者 Bun.js ，这些其实都类似，都是一个 JavaScript 运行时，所以学习这几个中的任意一个，都可以了解到 JS 运行时的一些设计理念和思想。这里我们就以 Deno 为例来讲讲。</p><p>Deno 对比 Node.js 有哪些特点？</p><ul><li>Deno 原生内置了 TS 支持、lint/benchmark/格式化/测试/文档 等工具、默认零配置可开箱即用、标准 Web API 的支持</li><li>原生内置通过 URL 来加载模块（Node.js 于 17.6 版本也开启了实验性的支持）</li><li>安全，访问本地文件/网络/调用 FFI 等操作需要授权(Node.js 20 也支持这个特性了)</li></ul><p>还有一个要说的点，现在 Deno 也开始兼容 NPM 了，也可以使用 package.json 和安装 node_modules，但是这是可选的，这看似有点违背了 Deno 一开始设计的初衷，但是如果不这样做，就意味着丢掉了 NPM 庞大的生态体系，导致用户量会一直上不来，这也有 <a href="https://deno.com/blog/package-json-support" target="_blank" rel="noreferrer">一篇文章讲了为什么 Deno 要支持 NPM</a>，目前 Deno 的网络引入模块功能还有一些缺陷，比如会导致重复依赖引入，但是这已经在 Deno 官方的解决清单里了，未来版本会解决。</p><p>其它废话就不多说了，直接来进入主题，了解一下实现一个 JS 运行时的原理吧</p><h2 id="基本架构" tabindex="-1">基本架构 <a class="header-anchor" href="#基本架构" aria-label="Permalink to &quot;基本架构&quot;">​</a></h2><p>首先我们先了解一下 Deno 的基本架构，主要大模块分为下面这几个：</p><p><img src="https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230415230850930.png" alt="image-20230415230850930"></p><h2 id="启动流程" tabindex="-1">启动流程 <a class="header-anchor" href="#启动流程" aria-label="Permalink to &quot;启动流程&quot;">​</a></h2><p>下面我们来看下启动一个 js 文件的主流程，假设我们有一个 main.js 文件，里面有一个读文件操作</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">deno</span></span>
<span class="line"><span style="color:#e1e4e8;">├── main.js</span></span>
<span class="line"><span style="color:#e1e4e8;">└── test.txt</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">deno</span></span>
<span class="line"><span style="color:#24292e;">├── main.js</span></span>
<span class="line"><span style="color:#24292e;">└── test.txt</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>main.js</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">data</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> Deno.</span><span style="color:#B392F0;">readTextFile</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;test.txt&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(data);</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">data</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> Deno.</span><span style="color:#6F42C1;">readTextFile</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;test.txt&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#24292E;">console.</span><span style="color:#6F42C1;">log</span><span style="color:#24292E;">(data);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>test.txt</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">Hello World</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">Hello World</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>类似于运行 <code>node main.js</code>， 此时控制台运行 <code>deno run -A main.js</code>，就能看到 <code>&quot;Hello World&quot;</code> 的输出了，</p><p>这就是一个完整的 deno 运行流程。 在运行的时候我们需要加上 -A 参数或者 --allow-read 参数来给予 Deno 访问文件的权限， -A 表示赋予所有权限，包括网络、读写文件、系统信息、ffi 等。</p><p>接下来我们就从源码中看一下这个运行过程是如何完成的。</p><h2 id="源码解析" tabindex="-1">源码解析 <a class="header-anchor" href="#源码解析" aria-label="Permalink to &quot;源码解析&quot;">​</a></h2><p>首先我们从命令行 Cli 模块入手，以下代码经过精简，<a href="https://github.com/denoland/deno/blob/main/cli/main.rs#L233" target="_blank" rel="noreferrer">源码在这儿</a></p><div class="language-rust vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// 主要命令行运行入口</span></span>
<span class="line"><span style="color:#F97583;">pub</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">fn</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">main</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 收集命令行参数</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> args</span><span style="color:#F97583;">:</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Vec</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">String</span><span style="color:#E1E4E8;">&gt; </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">env</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">args</span><span style="color:#E1E4E8;">()</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">collect</span><span style="color:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 返回一个 future 异步任务</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> future </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">move</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 处理权限，比如 --allow-read/--allow-write/--allow-net 等</span></span>
<span class="line"><span style="color:#6A737D;">    // 当输入 deno run --allow-read main.ts，会解析对应参数然后全部写入到 flags 变量中</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> flags </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">flags_from_vec</span><span style="color:#E1E4E8;">(args)</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">unwrap</span><span style="color:#E1E4E8;">();</span></span>
<span class="line"><span style="color:#6A737D;">    // 初始化 v8 引擎参数，如果参数设置有错就直接退出</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">init_v8_flags</span><span style="color:#E1E4E8;">(</span><span style="color:#F97583;">&amp;</span><span style="color:#E1E4E8;">flags</span><span style="color:#F97583;">.</span><span style="color:#E1E4E8;">v8_flags, </span><span style="color:#B392F0;">get_v8_flags_from_env</span><span style="color:#E1E4E8;">());</span></span>
<span class="line"><span style="color:#6A737D;">    // 运行命令行 比如 deno run 匹配 DenoSubcommand::RUN</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">run_subcommand</span><span style="color:#E1E4E8;">(flags)</span><span style="color:#F97583;">.await</span></span>
<span class="line"><span style="color:#E1E4E8;">  };</span></span>
<span class="line"><span style="color:#6A737D;">  // run_local创建 tokio 异步运行时，最大线程数 32 个</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> exit_code </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">unwrap_or_exit</span><span style="color:#E1E4E8;">(</span><span style="color:#B392F0;">run_local</span><span style="color:#E1E4E8;">(future));</span></span>
<span class="line"><span style="color:#6A737D;">  // 如果运行错误就退出</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#B392F0;">std</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">process</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">exit</span><span style="color:#E1E4E8;">(exit_code);</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// 主要命令行运行入口</span></span>
<span class="line"><span style="color:#D73A49;">pub</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">fn</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">main</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#6A737D;">  // 收集命令行参数</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> args</span><span style="color:#D73A49;">:</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Vec</span><span style="color:#24292E;">&lt;</span><span style="color:#6F42C1;">String</span><span style="color:#24292E;">&gt; </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">env</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">args</span><span style="color:#24292E;">()</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">collect</span><span style="color:#24292E;">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 返回一个 future 异步任务</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> future </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">move</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#6A737D;">    // 处理权限，比如 --allow-read/--allow-write/--allow-net 等</span></span>
<span class="line"><span style="color:#6A737D;">    // 当输入 deno run --allow-read main.ts，会解析对应参数然后全部写入到 flags 变量中</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> flags </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">flags_from_vec</span><span style="color:#24292E;">(args)</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">unwrap</span><span style="color:#24292E;">();</span></span>
<span class="line"><span style="color:#6A737D;">    // 初始化 v8 引擎参数，如果参数设置有错就直接退出</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">init_v8_flags</span><span style="color:#24292E;">(</span><span style="color:#D73A49;">&amp;</span><span style="color:#24292E;">flags</span><span style="color:#D73A49;">.</span><span style="color:#24292E;">v8_flags, </span><span style="color:#6F42C1;">get_v8_flags_from_env</span><span style="color:#24292E;">());</span></span>
<span class="line"><span style="color:#6A737D;">    // 运行命令行 比如 deno run 匹配 DenoSubcommand::RUN</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">run_subcommand</span><span style="color:#24292E;">(flags)</span><span style="color:#D73A49;">.await</span></span>
<span class="line"><span style="color:#24292E;">  };</span></span>
<span class="line"><span style="color:#6A737D;">  // run_local创建 tokio 异步运行时，最大线程数 32 个</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> exit_code </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">unwrap_or_exit</span><span style="color:#24292E;">(</span><span style="color:#6F42C1;">run_local</span><span style="color:#24292E;">(future));</span></span>
<span class="line"><span style="color:#6A737D;">  // 如果运行错误就退出</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6F42C1;">std</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">process</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">exit</span><span style="color:#24292E;">(exit_code);</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>当运行了 <code>deno run</code> ，就会进入到 <code>run_subcommand</code> 中，同时把解析好的命令行参数传递进去，<code>run_subcommand</code> 返回一个异步任务最后交给 tokio 去执行。</p><p>下面我们来看一下 <code>run_subcommand</code> 中的代码，我们可以看到主要是执行了 <code>run_script</code> 这个方法，并把 flags 命令行参数往里面传递</p><div class="language-rust vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">fn</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">run_subcommand</span><span style="color:#E1E4E8;">(flags</span><span style="color:#F97583;">:</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Flags</span><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">-&gt;</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Result</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">i32</span><span style="color:#E1E4E8;">, </span><span style="color:#B392F0;">AnyError</span><span style="color:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">match</span><span style="color:#E1E4E8;"> flags</span><span style="color:#F97583;">.</span><span style="color:#E1E4E8;">subcommand</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">clone</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">DenoSubcommand</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">Run</span><span style="color:#E1E4E8;">(run_flags) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#B392F0;">tools</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">run</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">run_script</span><span style="color:#E1E4E8;">(flags)</span><span style="color:#F97583;">.await</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">fn</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">run_subcommand</span><span style="color:#24292E;">(flags</span><span style="color:#D73A49;">:</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Flags</span><span style="color:#24292E;">) </span><span style="color:#D73A49;">-&gt;</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Result</span><span style="color:#24292E;">&lt;</span><span style="color:#6F42C1;">i32</span><span style="color:#24292E;">, </span><span style="color:#6F42C1;">AnyError</span><span style="color:#24292E;">&gt; {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">match</span><span style="color:#24292E;"> flags</span><span style="color:#D73A49;">.</span><span style="color:#24292E;">subcommand</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">clone</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">DenoSubcommand</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">Run</span><span style="color:#24292E;">(run_flags) </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6F42C1;">tools</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">run</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">run_script</span><span style="color:#24292E;">(flags)</span><span style="color:#D73A49;">.await</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>继续往里面去看，可以看到这个函数是运行 JS 文件的地方，主要是先创建一个全局的状态管理对象，然后拿到 JS 的主入口模块，检测运行的权限，然后创建一个执行的 Worker，最后再运行起来</p><div class="language-rust vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">/// 运行指定的 js 文件</span></span>
<span class="line"><span style="color:#F97583;">pub</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">fn</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">run_script</span><span style="color:#E1E4E8;">(flags</span><span style="color:#F97583;">:</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Flags</span><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">-&gt;</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Result</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">i32</span><span style="color:#E1E4E8;">, </span><span style="color:#B392F0;">AnyError</span><span style="color:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="color:#6A737D;">  // ProcState 存储一个 deno 实例的状态，它的状态会被所有已经创建的 worker 共享</span></span>
<span class="line"><span style="color:#6A737D;">  // 内部存储了 deno 中会用到的二进制数据，可以跨线程传递数据的广播通道生产者和 sharedArrayBuffer</span></span>
<span class="line"><span style="color:#6A737D;">  // WASM 依赖信息，网络缓存、网络请求客户端，分析和翻译 node.js 代码，npm 的兼容和解析处理， 处理 TS 配置和类型检查，</span></span>
<span class="line"><span style="color:#6A737D;">  // 构建模块的依赖关系，处理模块以及预加载需要的数据等操作</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> ps </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">ProcState</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">from_flags</span><span style="color:#E1E4E8;">(flags)</span><span style="color:#F97583;">.await?</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 主入口模块，解析后返回一个 URL ，有多种解析模式，命令行标准输入、npm、远程、本地文件等</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> main_module </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> ps</span><span style="color:#F97583;">.</span><span style="color:#E1E4E8;">options</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">resolve_main_module</span><span style="color:#E1E4E8;">()</span><span style="color:#F97583;">?</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 获取运行的权限，具有内部可变性，可以跨线程，比如可以传递到 Web Worker</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> permissions </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">PermissionsContainer</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">new</span><span style="color:#E1E4E8;">(</span><span style="color:#B392F0;">Permissions</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">from_options</span><span style="color:#E1E4E8;">(</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">&amp;</span><span style="color:#E1E4E8;">ps</span><span style="color:#F97583;">.</span><span style="color:#E1E4E8;">options</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">permissions_options</span><span style="color:#E1E4E8;">(),</span></span>
<span class="line"><span style="color:#E1E4E8;">  )</span><span style="color:#F97583;">?</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span></span>
<span class="line"><span style="color:#6A737D;">  // 创建一个运行 js 程序的 worker，把主入口模块和权限往里传</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">mut</span><span style="color:#E1E4E8;"> worker </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">create_main_worker</span><span style="color:#E1E4E8;">(</span><span style="color:#F97583;">&amp;</span><span style="color:#E1E4E8;">ps, main_module, permissions)</span><span style="color:#F97583;">.await?</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> exit_code </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> worker</span><span style="color:#F97583;">.</span><span style="color:#B392F0;">run</span><span style="color:#E1E4E8;">()</span><span style="color:#F97583;">.await?</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#B392F0;">Ok</span><span style="color:#E1E4E8;">(exit_code)</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">/// 运行指定的 js 文件</span></span>
<span class="line"><span style="color:#D73A49;">pub</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">fn</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">run_script</span><span style="color:#24292E;">(flags</span><span style="color:#D73A49;">:</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Flags</span><span style="color:#24292E;">) </span><span style="color:#D73A49;">-&gt;</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Result</span><span style="color:#24292E;">&lt;</span><span style="color:#6F42C1;">i32</span><span style="color:#24292E;">, </span><span style="color:#6F42C1;">AnyError</span><span style="color:#24292E;">&gt; {</span></span>
<span class="line"><span style="color:#6A737D;">  // ProcState 存储一个 deno 实例的状态，它的状态会被所有已经创建的 worker 共享</span></span>
<span class="line"><span style="color:#6A737D;">  // 内部存储了 deno 中会用到的二进制数据，可以跨线程传递数据的广播通道生产者和 sharedArrayBuffer</span></span>
<span class="line"><span style="color:#6A737D;">  // WASM 依赖信息，网络缓存、网络请求客户端，分析和翻译 node.js 代码，npm 的兼容和解析处理， 处理 TS 配置和类型检查，</span></span>
<span class="line"><span style="color:#6A737D;">  // 构建模块的依赖关系，处理模块以及预加载需要的数据等操作</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> ps </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">ProcState</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">from_flags</span><span style="color:#24292E;">(flags)</span><span style="color:#D73A49;">.await?</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 主入口模块，解析后返回一个 URL ，有多种解析模式，命令行标准输入、npm、远程、本地文件等</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> main_module </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> ps</span><span style="color:#D73A49;">.</span><span style="color:#24292E;">options</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">resolve_main_module</span><span style="color:#24292E;">()</span><span style="color:#D73A49;">?</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">  // 获取运行的权限，具有内部可变性，可以跨线程，比如可以传递到 Web Worker</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> permissions </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">PermissionsContainer</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">new</span><span style="color:#24292E;">(</span><span style="color:#6F42C1;">Permissions</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">from_options</span><span style="color:#24292E;">(</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">&amp;</span><span style="color:#24292E;">ps</span><span style="color:#D73A49;">.</span><span style="color:#24292E;">options</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">permissions_options</span><span style="color:#24292E;">(),</span></span>
<span class="line"><span style="color:#24292E;">  )</span><span style="color:#D73A49;">?</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#24292E;">    </span></span>
<span class="line"><span style="color:#6A737D;">  // 创建一个运行 js 程序的 worker，把主入口模块和权限往里传</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">mut</span><span style="color:#24292E;"> worker </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">create_main_worker</span><span style="color:#24292E;">(</span><span style="color:#D73A49;">&amp;</span><span style="color:#24292E;">ps, main_module, permissions)</span><span style="color:#D73A49;">.await?</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">let</span><span style="color:#24292E;"> exit_code </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> worker</span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">run</span><span style="color:#24292E;">()</span><span style="color:#D73A49;">.await?</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6F42C1;">Ok</span><span style="color:#24292E;">(exit_code)</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><p>接下来我们再来看下 <code>create_main_worker</code> 这个函数，里面创建用于 JS 运行起来的工作者线程</p><div class="language-rust vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">pub</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">fn</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">create_main_worker</span><span style="color:#E1E4E8;">(</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">&amp;</span><span style="color:#79B8FF;">self</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  main_module</span><span style="color:#F97583;">:</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">ModuleSpecifier</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  permissions</span><span style="color:#F97583;">:</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">PermissionsContainer</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">-&gt;</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Result</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">CliMainWorker</span><span style="color:#E1E4E8;">, </span><span style="color:#B392F0;">AnyError</span><span style="color:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#79B8FF;">self</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">.</span><span style="color:#B392F0;">create_custom_worker</span><span style="color:#E1E4E8;">(</span></span>
<span class="line"><span style="color:#E1E4E8;">      main_module,</span></span>
<span class="line"><span style="color:#E1E4E8;">      permissions,</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#B392F0;">vec!</span><span style="color:#E1E4E8;">[],</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#B392F0;">Default</span><span style="color:#F97583;">::</span><span style="color:#B392F0;">default</span><span style="color:#E1E4E8;">(),</span></span>
<span class="line"><span style="color:#E1E4E8;">    )</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">.await</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">pub</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">fn</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">create_main_worker</span><span style="color:#24292E;">(</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">&amp;</span><span style="color:#005CC5;">self</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  main_module</span><span style="color:#D73A49;">:</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">ModuleSpecifier</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  permissions</span><span style="color:#D73A49;">:</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">PermissionsContainer</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">) </span><span style="color:#D73A49;">-&gt;</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Result</span><span style="color:#24292E;">&lt;</span><span style="color:#6F42C1;">CliMainWorker</span><span style="color:#24292E;">, </span><span style="color:#6F42C1;">AnyError</span><span style="color:#24292E;">&gt; {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#005CC5;">self</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">.</span><span style="color:#6F42C1;">create_custom_worker</span><span style="color:#24292E;">(</span></span>
<span class="line"><span style="color:#24292E;">      main_module,</span></span>
<span class="line"><span style="color:#24292E;">      permissions,</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6F42C1;">vec!</span><span style="color:#24292E;">[],</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6F42C1;">Default</span><span style="color:#D73A49;">::</span><span style="color:#6F42C1;">default</span><span style="color:#24292E;">(),</span></span>
<span class="line"><span style="color:#24292E;">    )</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">.await</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div>`,30),e=[o];function r(c,t,y,E,i,d){return n(),a("div",null,e)}const b=s(p,[["render",r]]);export{m as __pageData,b as default};
