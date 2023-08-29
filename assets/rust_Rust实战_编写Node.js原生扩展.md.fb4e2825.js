import{_ as s,o as n,c as a,Q as e}from"./chunks/framework.18ed7b43.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"rust/Rust实战/编写Node.js原生扩展.md","filePath":"rust/Rust实战/编写Node.js原生扩展.md","lastUpdated":1692204806000}'),l={name:"rust/Rust实战/编写Node.js原生扩展.md"},p=e(`<h2 id="前言" tabindex="-1">前言 <a class="header-anchor" href="#前言" aria-label="Permalink to &quot;前言&quot;">​</a></h2><p>本文将从零带你去使用 Rust 构建一个 Node.js 原生扩展(Native Addon)，为什么要学这个？ 正如我们之前所提到的，Rust 可以给 Node.js 打开性能逃生的通道。当我们使用 Node.js 去写 Web 服务或者一些提效工具遇到 CPU 密集计算的时候，这时候就可以上 Rust 了。</p><p>如果你感兴趣的话可以去 npm 搜一下 @puffmeow/rusty-schema2ts 这个包，它就是用 Rust napi-rs 写的。</p><p>废话不多说，下面我们就来看看如何通过 Rust 构建一个 Npm 包。</p><h2 id="前置条件" tabindex="-1">前置条件 <a class="header-anchor" href="#前置条件" aria-label="Permalink to &quot;前置条件&quot;">​</a></h2><ul><li>Rust 环境：去官网自行安装</li><li>Node.js 环境：去官网自行安装</li><li>@napi-rs/cli：全局安装 <code>npm install -g @napi-rs/cli</code></li></ul><h2 id="示例项目" tabindex="-1">示例项目 <a class="header-anchor" href="#示例项目" aria-label="Permalink to &quot;示例项目&quot;">​</a></h2><p>这里我们直接从零用一个例子来讲讲如何开始</p><h3 id="初始化项目" tabindex="-1">初始化项目 <a class="header-anchor" href="#初始化项目" aria-label="Permalink to &quot;初始化项目&quot;">​</a></h3><p><img src="https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20230812171630131.png" alt="image-20230812171630131"></p><p>可以看着上面这个图的步骤来：</p><ol><li><code>napi new</code></li><li>输入下包名，推荐去 npm 上创建一个自己的组织，我们这里就用 @puffmeow，然后包名就是 @puffmeow/example</li><li>当前项目的目录名</li><li>选择要支持的平台，Native Addon 是不能跨平台的，所以要选择跨平台构建，这里我们直接按 a 进行全选，全平台构建</li><li>这个我们如果使用 Github workflow 来构建的话，就选上，到时候会通过 github workflow 把所有的包放到容器中进行跨平台构建</li><li>等待项目初始化完成</li></ol><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">test</span></span>
<span class="line"><span style="color:#e1e4e8;">└── example</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── Cargo.toml</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── __test__</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   └── index.spec.mjs</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── build.rs</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── npm</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── android-arm-eabi</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── android-arm64</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── darwin-arm64</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── darwin-universal</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── darwin-x64</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── freebsd-x64</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── linux-arm-gnueabihf</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── linux-arm64-gnu</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── linux-arm64-musl</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── linux-x64-gnu</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── linux-x64-musl</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── win32-arm64-msvc</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   ├── win32-ia32-msvc</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   └── win32-x64-msvc</span></span>
<span class="line"><span style="color:#e1e4e8;">    │       ├── README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    │       └── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── rustfmt.toml</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── src</span></span>
<span class="line"><span style="color:#e1e4e8;">    │   └── lib.rs</span></span>
<span class="line"><span style="color:#e1e4e8;">    └── yarn.lock</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">test</span></span>
<span class="line"><span style="color:#24292e;">└── example</span></span>
<span class="line"><span style="color:#24292e;">    ├── Cargo.toml</span></span>
<span class="line"><span style="color:#24292e;">    ├── __test__</span></span>
<span class="line"><span style="color:#24292e;">    │   └── index.spec.mjs</span></span>
<span class="line"><span style="color:#24292e;">    ├── build.rs</span></span>
<span class="line"><span style="color:#24292e;">    ├── npm</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── android-arm-eabi</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── android-arm64</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── darwin-arm64</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── darwin-universal</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── darwin-x64</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── freebsd-x64</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── linux-arm-gnueabihf</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── linux-arm64-gnu</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── linux-arm64-musl</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── linux-x64-gnu</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── linux-x64-musl</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── win32-arm64-msvc</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   ├── win32-ia32-msvc</span></span>
<span class="line"><span style="color:#24292e;">    │   │   ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │   │   └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    │   └── win32-x64-msvc</span></span>
<span class="line"><span style="color:#24292e;">    │       ├── README.md</span></span>
<span class="line"><span style="color:#24292e;">    │       └── package.json</span></span>
<span class="line"><span style="color:#24292e;">    ├── package.json</span></span>
<span class="line"><span style="color:#24292e;">    ├── rustfmt.toml</span></span>
<span class="line"><span style="color:#24292e;">    ├── src</span></span>
<span class="line"><span style="color:#24292e;">    │   └── lib.rs</span></span>
<span class="line"><span style="color:#24292e;">    └── yarn.lock</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br></div></div>`,13),c=[p];function o(r,i,t,m,b,u){return n(),a("div",null,c)}const E=s(l,[["render",o]]);export{d as __pageData,E as default};
