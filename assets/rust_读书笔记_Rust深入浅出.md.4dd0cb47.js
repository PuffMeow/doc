import{_ as s,c as n,o as a,N as l}from"./chunks/framework.3202de66.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"rust/读书笔记/Rust深入浅出.md","lastUpdated":1681487704000}'),p={name:"rust/读书笔记/Rust深入浅出.md"},o=l(`<h2 id="控制台打印" tabindex="-1">控制台打印 <a class="header-anchor" href="#控制台打印" aria-label="Permalink to &quot;控制台打印&quot;">​</a></h2><div class="language-rust line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">fn</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">main</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 默认用法,打印Display</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:o</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">9</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 八进制</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:x</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">255</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 十六进制 小写</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:X</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">255</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 十六进制 大写</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:p</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&amp;</span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 指针</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:b</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">15</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 二进制</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:e</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">10000</span><span style="color:#FFCB6B;">f32</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 科学计数(小写)</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:E</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">10000</span><span style="color:#FFCB6B;">f32</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 科学计数(大写)</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:?</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">test</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 打印Debug</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">:#?</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">test1</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">test2</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">));</span><span style="color:#676E95;font-style:italic;"> // 带换行和缩进的Debug打印</span></span>
<span class="line"><span style="color:#82AAFF;">println!</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&quot;{</span><span style="color:#C3E88D;">a</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;"> </span><span style="color:#89DDFF;">{</span><span style="color:#C3E88D;">b</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;"> </span><span style="color:#89DDFF;">{</span><span style="color:#C3E88D;">b</span><span style="color:#89DDFF;">}&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> a </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">x</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> b </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">y</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">);</span><span style="color:#676E95;font-style:italic;"> // 命名参数</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div>`,2),t=[o];function e(r,c,D,F,y,i){return a(),n("div",null,t)}const A=s(p,[["render",e]]);export{u as __pageData,A as default};
