import{_ as s,o as n,c as a,Q as e}from"./chunks/framework.18ed7b43.js";const y=JSON.parse('{"title":"看完这篇文章你能了解到什么?","description":"","frontmatter":{},"headers":[],"relativePath":"backend/应用部署/2.docker部署.md","filePath":"backend/应用部署/2.docker部署.md","lastUpdated":1673276359000}'),p={name:"backend/应用部署/2.docker部署.md"},l=e(`<h1 id="看完这篇文章你能了解到什么" tabindex="-1">看完这篇文章你能了解到什么? <a class="header-anchor" href="#看完这篇文章你能了解到什么" aria-label="Permalink to &quot;看完这篇文章你能了解到什么?&quot;">​</a></h1><ul><li><strong>了解常见的 Docker 知识</strong></li></ul><ul><li><strong>利用 Docker 快速跨平台部署后端( Node.js + MongoDB + Redis + Nginx ) 项目</strong></li><li>一些常见的 Linux 系统操作</li><li>编写 Dockerfile 文件</li><li>编写 docker-compose 文件</li><li>编写 一些常见的 nginx 配置文件</li></ul><h1 id="ps" tabindex="-1">PS <a class="header-anchor" href="#ps" aria-label="Permalink to &quot;PS&quot;">​</a></h1><p>这里主要讲的是利用容器化的方式去部署项目，容器化部署的好处有很多哈，比如容器可以很方便从一台电脑迁移到另一台电脑。</p><p>如果想要了解传统的实机部署方式，可以看看我的另一篇文章 <a href="./1.传统部署.html">传统部署</a></p><h1 id="docker-是什么" tabindex="-1">Docker 是什么？ <a class="header-anchor" href="#docker-是什么" aria-label="Permalink to &quot;Docker 是什么？&quot;">​</a></h1><p>简单一句话就是一个应用打包、分发、部署的工具，可以把它理解为一个轻量的虚拟机，但是是以容器的方式运行的。</p><p>支持各种系统 Linux，MacOS，Windows 等。可以使用容器化部署以降低项目在不同的平台之间进行部署的成本。</p><p>再也不会出现 <strong>“怎么在我的电脑能运行，到了服务器就运行不了”</strong> 这种情况。</p><h1 id="docker-基本概念" tabindex="-1">Docker 基本概念 <a class="header-anchor" href="#docker-基本概念" aria-label="Permalink to &quot;Docker 基本概念&quot;">​</a></h1><p>使用 Docker 前需要先了解这几个基本概念</p><ul><li>镜像（image）</li><li>容器（container）</li><li>仓库（repository）</li></ul><p>获取镜像的方式可以通过 Dockerfile 文件创建，也可以通过 dockerHub 仓库下载</p><ul><li>Docker 中<strong>镜像</strong>和<strong>容器</strong>的关系就像 <strong>类</strong> 与 <strong>实例</strong> 的关系</li><li>镜像可以通过 Dockerfile 文件来生成，容器通过镜像来创建</li></ul><h1 id="docker-使用国内镜像加速" tabindex="-1">Docker 使用国内镜像加速 <a class="header-anchor" href="#docker-使用国内镜像加速" aria-label="Permalink to &quot;Docker 使用国内镜像加速&quot;">​</a></h1><p>Linux 系统</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">vim /etc/docker/daemon.json</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">vim /etc/docker/daemon.json</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>Windows 系统，找到 daemon.json 文件并打开修改</p><p><code>C:\\Users&lt;你的用户名&gt;.docker\\daemon.json</code> 文件</p><p>然后修改里面的 <code>registry-mirrors</code> 字段，可以添加多个源地址。可以在下载镜像的时候加速</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">{</span></span>
<span class="line"><span style="color:#e1e4e8;">  &quot;builder&quot;: {</span></span>
<span class="line"><span style="color:#e1e4e8;">    &quot;gc&quot;: {</span></span>
<span class="line"><span style="color:#e1e4e8;">      &quot;defaultKeepStorage&quot;: &quot;20GB&quot;,</span></span>
<span class="line"><span style="color:#e1e4e8;">      &quot;enabled&quot;: true</span></span>
<span class="line"><span style="color:#e1e4e8;">    }</span></span>
<span class="line"><span style="color:#e1e4e8;">  },</span></span>
<span class="line"><span style="color:#e1e4e8;">  &quot;experimental&quot;: false,</span></span>
<span class="line"><span style="color:#e1e4e8;">  &quot;features&quot;: {</span></span>
<span class="line"><span style="color:#e1e4e8;">    &quot;buildkit&quot;: true</span></span>
<span class="line"><span style="color:#e1e4e8;">  },</span></span>
<span class="line"><span style="color:#e1e4e8;">  &quot;registry-mirrors&quot;: [</span></span>
<span class="line"><span style="color:#e1e4e8;">    &quot;https://registry.docker-cn.com&quot;</span></span>
<span class="line"><span style="color:#e1e4e8;">  ]</span></span>
<span class="line"><span style="color:#e1e4e8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">{</span></span>
<span class="line"><span style="color:#24292e;">  &quot;builder&quot;: {</span></span>
<span class="line"><span style="color:#24292e;">    &quot;gc&quot;: {</span></span>
<span class="line"><span style="color:#24292e;">      &quot;defaultKeepStorage&quot;: &quot;20GB&quot;,</span></span>
<span class="line"><span style="color:#24292e;">      &quot;enabled&quot;: true</span></span>
<span class="line"><span style="color:#24292e;">    }</span></span>
<span class="line"><span style="color:#24292e;">  },</span></span>
<span class="line"><span style="color:#24292e;">  &quot;experimental&quot;: false,</span></span>
<span class="line"><span style="color:#24292e;">  &quot;features&quot;: {</span></span>
<span class="line"><span style="color:#24292e;">    &quot;buildkit&quot;: true</span></span>
<span class="line"><span style="color:#24292e;">  },</span></span>
<span class="line"><span style="color:#24292e;">  &quot;registry-mirrors&quot;: [</span></span>
<span class="line"><span style="color:#24292e;">    &quot;https://registry.docker-cn.com&quot;</span></span>
<span class="line"><span style="color:#24292e;">  ]</span></span>
<span class="line"><span style="color:#24292e;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><ul><li>Docker 中国官方：<a href="https://registry.docker-cn.com" target="_blank" rel="noreferrer">https://registry.docker-cn.com</a></li><li>中科大：<a href="https://docker.mirrors.ustc.edu.cn" target="_blank" rel="noreferrer">https://docker.mirrors.ustc.edu.cn</a></li><li>网易：<a href="http://hub-mirror.c.163.com" target="_blank" rel="noreferrer">http://hub-mirror.c.163.com</a></li></ul><h1 id="hello-world" tabindex="-1">Hello world <a class="header-anchor" href="#hello-world" aria-label="Permalink to &quot;Hello world&quot;">​</a></h1><p>Docker 允许你在容器内运行应用程序， 使用 <strong>docker run</strong> 命令来在容器内运行一个应用程序</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run ubuntu:15.10 /bin/echo &quot;Hello world&quot;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run ubuntu:15.10 /bin/echo &quot;Hello world&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>安装一个 ubuntu 15.10 版本的容器，并在容器中输出 hello world，如果本地不存在该容器就会从远程仓库下载，相当于你在 Docker 容器内安装了一个 ubuntu 系统的虚拟环境，可以在里面执行各种 Linux 的指令。</p><h2 id="交互式容器" tabindex="-1">交互式容器 <a class="header-anchor" href="#交互式容器" aria-label="Permalink to &quot;交互式容器&quot;">​</a></h2><p>相当于可以在容器虚拟环境中打开控制台。</p><p>放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 /bin/bash</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run -i -t ubuntu:15.10 /bin/bash</span></span>
<span class="line"><span style="color:#e1e4e8;"># 或者</span></span>
<span class="line"><span style="color:#e1e4e8;">docker run -it ubuntu:15.10 /bin/bash</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run -i -t ubuntu:15.10 /bin/bash</span></span>
<span class="line"><span style="color:#24292e;"># 或者</span></span>
<span class="line"><span style="color:#24292e;">docker run -it ubuntu:15.10 /bin/bash</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><ul><li><strong>-t:</strong> 在新容器内指定一个伪终端或终端。</li><li><strong>-i:</strong> 允许你对容器内的标准输入 (STDIN) 进行交互。</li><li><strong>-d：</strong> 让容器在后台运行，输入后不进入交互模式</li><li><strong>-p</strong>：表示暴露端口</li><li>在控制台中输入 exit 退出</li></ul><p>如果输入了-d 参数，会让容器后台运行，那么怎么进入到容器中呢？</p><p>一个是<code>docker attach 容器ID</code>命令，如果从这个命令进入到容器中后，再输入<code>exit</code>会把整个容器也退出，不再维持后台运行的状态。</p><p>另一个是<code>docker exec -it 容器ID /bin/bash</code>命令回到容器中，执行这个命令在容器中输入<code>exit</code>不会把整个容器也退出，容器仍将维持后台运行状态。</p><h2 id="docker-状态" tabindex="-1">Docker 状态 <a class="header-anchor" href="#docker-状态" aria-label="Permalink to &quot;Docker 状态&quot;">​</a></h2><p>输入指令<code>docker ps -a</code>可以查看所有的容器。</p><p><img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d2b13f1b73146a183a313b377de0d2d~tplv-k3u1fbpfcp-watermark.image?" alt="image.png"></p><p>如果要恢复一个已经停止的容器可以输入<code>docker start 容器ID</code>，同样的，想要停止一个容器可以输入<code>docker stop 容器ID</code>。</p><p>另外还有<code>docker restart 容器ID</code> 命令用于重启容器</p><table><thead><tr><th>CONTAINER ID</th><th>IMAGE</th><th>COMMAND</th><th>CREATED</th><th>STATUS</th></tr></thead><tbody><tr><td>容器 ID</td><td>使用的镜像</td><td>启动容器时运行的命令</td><td>容器的创建时间</td><td>容器状态</td></tr></tbody></table><p>容器的状态有 7 种：</p><ul><li>created（已创建）</li><li>restarting（重启中）</li><li>running 或 Up（运行中）</li><li>removing（迁移中）</li><li>paused（暂停）</li><li>exited（停止）</li><li>dead（死亡）</li></ul><h2 id="删除一个容器" tabindex="-1">删除一个容器 <a class="header-anchor" href="#删除一个容器" aria-label="Permalink to &quot;删除一个容器&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker rm -f 容器ID</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker rm -f 容器ID</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="清理列表中所有终止状态的容器" tabindex="-1">清理列表中所有终止状态的容器 <a class="header-anchor" href="#清理列表中所有终止状态的容器" aria-label="Permalink to &quot;清理列表中所有终止状态的容器&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker container prune</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker container prune</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="查看镜像" tabindex="-1">查看镜像 <a class="header-anchor" href="#查看镜像" aria-label="Permalink to &quot;查看镜像&quot;">​</a></h2><p><img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6373aec969b41118d7473d3a96b53a6~tplv-k3u1fbpfcp-watermark.image?" alt="image-20211015233846053.png"></p><table><thead><tr><th><strong>REPOSITORY</strong></th><th><strong>TAG</strong></th><th><strong>IMAGE ID</strong></th><th><strong>CREATED</strong></th><th><strong>SIZE</strong></th></tr></thead><tbody><tr><td>镜像的仓库源</td><td>镜像的标签</td><td>镜像 ID</td><td>镜像创建时间</td><td>镜像大小</td></tr></tbody></table><h2 id="删除镜像" tabindex="-1">删除镜像 <a class="header-anchor" href="#删除镜像" aria-label="Permalink to &quot;删除镜像&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker rmi 镜像仓库源</span></span>
<span class="line"><span style="color:#e1e4e8;"># 比如说要删除上面的test v0.0.1版本</span></span>
<span class="line"><span style="color:#e1e4e8;">docker rmi test:v0.0.1</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker rmi 镜像仓库源</span></span>
<span class="line"><span style="color:#24292e;"># 比如说要删除上面的test v0.0.1版本</span></span>
<span class="line"><span style="color:#24292e;">docker rmi test:v0.0.1</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="获取镜像" tabindex="-1">获取镜像 <a class="header-anchor" href="#获取镜像" aria-label="Permalink to &quot;获取镜像&quot;">​</a></h2><p>当使用<code>docker run</code>命令来运行本地不存在的镜像时会自动下载镜像，但也可以使用<code>docker pull</code>命令来提前下载</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker pull 镜像名:版本号</span></span>
<span class="line"><span style="color:#e1e4e8;"># 例如</span></span>
<span class="line"><span style="color:#e1e4e8;">docker pull ubuntu:15.10</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker pull 镜像名:版本号</span></span>
<span class="line"><span style="color:#24292e;"># 例如</span></span>
<span class="line"><span style="color:#24292e;">docker pull ubuntu:15.10</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="查找镜像" tabindex="-1">查找镜像 <a class="header-anchor" href="#查找镜像" aria-label="Permalink to &quot;查找镜像&quot;">​</a></h2><p>直接去官网找吧 <strong><a href="https://hub.docker.com/" target="_blank" rel="noreferrer">https://hub.docker.com/</a></strong></p><h2 id="安装软件" tabindex="-1">安装软件 <a class="header-anchor" href="#安装软件" aria-label="Permalink to &quot;安装软件&quot;">​</a></h2><p>比如在上面的官网中查找一个 redis 镜像，然后安装最新版的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run -d -p 6379:6379 --name redis redis:latest</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run -d -p 6379:6379 --name redis redis:latest</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>-p 命令后面接的端口号指， 宿主机端口号:容器内端口号，也就是说把容器内开启的端口号挂载到宿主机的端口号上。</p><h2 id="将宿主机目录指向容器内目录" tabindex="-1">将宿主机目录指向容器内目录 <a class="header-anchor" href="#将宿主机目录指向容器内目录" aria-label="Permalink to &quot;将宿主机目录指向容器内目录&quot;">​</a></h2><p>使用 -v 指令</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run -p 3000:3000 --name my-server -v 代码位置的绝对路径:/app -d server:v1</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run -p 3000:3000 --name my-server -v 代码位置的绝对路径:/app -d server:v1</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><ul><li>bind mount: -v 绝对路径</li><li>volumn: -v 随便起一个名字</li></ul><p>上面的命令表示将宿主机某个绝对路径上的代码挂载到容器里的 app 目录下，后台运行，容器名字为 server，并且版本号为 v1</p><h2 id="容器间通信" tabindex="-1">容器间通信 <a class="header-anchor" href="#容器间通信" aria-label="Permalink to &quot;容器间通信&quot;">​</a></h2><p>创建一个虚拟网络进行通信</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker network create my-net</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker network create my-net</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>创建完成网络之后就可以在一个容器内指定网络，比如在 my-net 网络中启动 redis 容器，并且用 --network-alias 起了一个别名</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run -d --name redis --network my-net --network-alias redis redis:latest</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run -d --name redis --network my-net --network-alias redis redis:latest</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h1 id="docker-compose" tabindex="-1">docker-compose <a class="header-anchor" href="#docker-compose" aria-label="Permalink to &quot;docker-compose&quot;">​</a></h1><p>可以使用 docker 组合将多个容器进行组合到一起，然后可以一键运行多个容器</p><p>比如 windows 的桌面图形版 docker 就不需要单独安装，如果是 MacOS 或者 Linux 系统就需要单独安装</p><p>命令行输入 <code>docker-compose -v</code> 检测是否安装成功</p><p>需要单独编写 docker-compose 脚本，然后在其中编写命令使用</p><p>在同一个 docker-compose 里的容器都默认使用相同的网络，就不需要单独再写网络了</p><p>在编写 docker-compose.yml 的目录执行 <code>docker-compose up</code> 就能跑起来了，如需后台运行可以加 -d 参数</p><p>具体关于 docker-compose 的使用可以看下面实战篇</p><h2 id="docker-compose-常用命令" tabindex="-1">docker-compose 常用命令 <a class="header-anchor" href="#docker-compose-常用命令" aria-label="Permalink to &quot;docker-compose 常用命令&quot;">​</a></h2><p>查看容器运行状态</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose ps -a</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose ps -a</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>启动容器并构建</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose up --build -d</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose up --build -d</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>不使用缓存构建容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose build --no-cache</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose build --no-cache</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>删除容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose down</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose down</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>重启容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose restart</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose restart</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>停止容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose stop</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose stop</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>单个服务重启</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose restart service-name</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose restart service-name</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>进入某个容器服务的命令行</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose exec service-name sh</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose exec service-name sh</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>查看某个容器服务运行日志</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose logs service-name</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose logs service-name</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h1 id="实战篇" tabindex="-1">实战篇 <a class="header-anchor" href="#实战篇" aria-label="Permalink to &quot;实战篇&quot;">​</a></h1><h2 id="基础部署" tabindex="-1">基础部署 <a class="header-anchor" href="#基础部署" aria-label="Permalink to &quot;基础部署&quot;">​</a></h2><p>这里我们来拿一个前端应用创建一个镜像，我之前写了一个后台管理系统，拿来举个例子</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker run -it -d --name admin --privileged -p 8080:8080 -v \${PWD}/:/admin node:16.14.2 /bin/bash -c &quot;cd /admin &amp;&amp; npm install -g pnpm &amp;&amp; pnpm install &amp;&amp; pnpm run start&quot;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker run -it -d --name admin --privileged -p 8080:8080 -v \${PWD}/:/admin node:16.14.2 /bin/bash -c &quot;cd /admin &amp;&amp; npm install -g pnpm &amp;&amp; pnpm install &amp;&amp; pnpm run start&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>这句话的意思是 创建一个 docker 容器并在后台运行，--privileged 命令是授予容器 root 权限，然后把容器的 8080 端口暴露到宿主机的 8080 端口， 然后把宿主机内的代码目录路径指向容器内的 <code>/admin</code> 路径( <code>\${PWD}</code> 命令是获取当前目录的绝对路径，当前目录则为代码所在的根目录)， 然后使用 node 16.14.2 版本的镜像，在控制台依次运行下列命令：</p><blockquote><p>cd /admin 进入到容器内的 /admin 目录</p><p>node install -g pnpm 全局安装 pnpm 包管理器(我项目中用到了 pnpm)</p><p>pnpm install 安装依赖</p><p>pnpm run start 启动项目，运行在 8080 端口</p></blockquote><p>如果想要修改容器内的文件，则需要使用 vim，但是可能会遇到容器没有 vim 命令的问题，解决方式如下</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 先运行</span></span>
<span class="line"><span style="color:#e1e4e8;">apt-get update</span></span>
<span class="line"><span style="color:#e1e4e8;"># 再安装 vim</span></span>
<span class="line"><span style="color:#e1e4e8;">apt-get install vim</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 先运行</span></span>
<span class="line"><span style="color:#24292e;">apt-get update</span></span>
<span class="line"><span style="color:#24292e;"># 再安装 vim</span></span>
<span class="line"><span style="color:#24292e;">apt-get install vim</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><h2 id="利用-docker-进行后端项目部署" tabindex="-1">利用 Docker 进行后端项目部署 <a class="header-anchor" href="#利用-docker-进行后端项目部署" aria-label="Permalink to &quot;利用 Docker 进行后端项目部署&quot;">​</a></h2><p>首先需要准备一个云服务器，前提就是需要有服务器~~~这里我用的是腾讯云的 CentOS7 系统，这也是 Linux 系统的。具体需要云服务器的可以自己到腾讯云或者阿里云购买，如果是学生身份的话买一个服务器就一两百块一年。买服务器这一步就不具体详述了。</p><p>下面我们就主要讲一下如何利用 docker-compose 部署一个在本地开发好的 nginx + node.js + redis + mongodb 的项目到云服务器上。</p><h2 id="docker-安装" tabindex="-1">Docker 安装 <a class="header-anchor" href="#docker-安装" aria-label="Permalink to &quot;Docker 安装&quot;">​</a></h2><p>首先登录到云服务器上，可以通过腾讯云或者阿里云的官网进行网页登录，也可以利用 ssh 在本地控制台登录。登录成功后先安装 Docker 。不知道怎么在本地连接远程服务器的可以看我另一篇文章 <a href="https://juejin.cn/post/6976114620897427464" target="_blank" rel="noreferrer">手摸手教你如何从零一步一步部署一个前端项目到远程服务器~~</a></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo yum install docker-ce docker-ce-cli containerd.io</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo yum install docker-ce docker-ce-cli containerd.io</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>安装完成之后控制台会显示 Complete!，然后在控制台输入 <code>docker -v</code> 可以看到 docker 的版本号信息：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">Docker version 20.10.13, build a224086</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">Docker version 20.10.13, build a224086</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>如果不是 CentOS 系统可以自己去官网安装。安装地址在这儿 <code>https://docs.docker.com/get-docker/</code>，找到和自己电脑对应的操作系统安装就行</p><h2 id="设置开机自启" tabindex="-1">设置开机自启 <a class="header-anchor" href="#设置开机自启" aria-label="Permalink to &quot;设置开机自启&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo systemctl enable docker</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo systemctl enable docker</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="启动-docker" tabindex="-1">启动 Docker <a class="header-anchor" href="#启动-docker" aria-label="Permalink to &quot;启动 Docker&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo systemctl start docker</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo systemctl start docker</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>启动成功之后，控制台输入 <code>docker info</code> 可以看到 Server 一栏有相关信息：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">Server:</span></span>
<span class="line"><span style="color:#e1e4e8;">  Containers: 0</span></span>
<span class="line"><span style="color:#e1e4e8;">  Running: 0</span></span>
<span class="line"><span style="color:#e1e4e8;">  Paused: 0</span></span>
<span class="line"><span style="color:#e1e4e8;">  Stopped: 0</span></span>
<span class="line"><span style="color:#e1e4e8;">  Images: 0</span></span>
<span class="line"><span style="color:#e1e4e8;">  ......</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">Server:</span></span>
<span class="line"><span style="color:#24292e;">  Containers: 0</span></span>
<span class="line"><span style="color:#24292e;">  Running: 0</span></span>
<span class="line"><span style="color:#24292e;">  Paused: 0</span></span>
<span class="line"><span style="color:#24292e;">  Stopped: 0</span></span>
<span class="line"><span style="color:#24292e;">  Images: 0</span></span>
<span class="line"><span style="color:#24292e;">  ......</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><h2 id="测试安装结果" tabindex="-1">测试安装结果 <a class="header-anchor" href="#测试安装结果" aria-label="Permalink to &quot;测试安装结果&quot;">​</a></h2><p>输入下面命令会去 dockerHub 拉取 hello-world 这个镜像然后启动</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo docker run hello-world</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo docker run hello-world</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>最终控制台显示了 <code>Hello from Docker!</code> 那就证明安装 Docker 这一步就已经完成啦。</p><h2 id="服务器安装-docker-compose" tabindex="-1">服务器安装 docker-compose <a class="header-anchor" href="#服务器安装-docker-compose" aria-label="Permalink to &quot;服务器安装 docker-compose&quot;">​</a></h2><p>docker-compose 是一个用于定义和运行多容器 Docker 应用程序的工具，可以设置好多个容器，然后可以使用一个命令启动所有容器。</p><p>Linux 安装，控制台输入如下命令：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo curl -L &quot;https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)&quot; -o /usr/local/bin/docker-compose</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo curl -L &quot;https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)&quot; -o /usr/local/bin/docker-compose</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>安装完成之后需要申请执行权限，输入以下命令：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">sudo chmod +x /usr/local/bin/docker-compose</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">sudo chmod +x /usr/local/bin/docker-compose</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>最后控制台输入下面命令查看是否已经安装完成：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose -v</span></span>
<span class="line"><span style="color:#e1e4e8;"># 控制台显示：docker-compose version 1.29.2, build 5becea4c</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose -v</span></span>
<span class="line"><span style="color:#24292e;"># 控制台显示：docker-compose version 1.29.2, build 5becea4c</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><h2 id="服务器安装-git" tabindex="-1">服务器安装 Git <a class="header-anchor" href="#服务器安装-git" aria-label="Permalink to &quot;服务器安装 Git&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">yum install -y git</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">yum install -y git</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>安装完成之后控制台输入</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">git --version</span></span>
<span class="line"><span style="color:#e1e4e8;"># git version 1.8.3.1</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">git --version</span></span>
<span class="line"><span style="color:#24292e;"># git version 1.8.3.1</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>这样就代表 Git 安装成功啦</p><h2 id="初始化-git" tabindex="-1">初始化 git <a class="header-anchor" href="#初始化-git" aria-label="Permalink to &quot;初始化 git&quot;">​</a></h2><p>安装好 git 之后就要进行初始化操作。第一次使用 git 的时候我们需要给 git 配置用户名和邮箱，用户和邮箱可以使用 github 的，也可以使用 gitlab 仓库的账号</p><p>配置用户名</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">git config --global user.name &quot;用户名&quot;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">git config --global user.name &quot;用户名&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>配置邮箱</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">git config --global user.email &quot;邮箱地址&quot;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">git config --global user.email &quot;邮箱地址&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>配置好这个以后我们输入便可以看到我们所有的配置信息了，然后可以看到 user.name 和 user.email 配置得对不对</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">git config -l</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">git config -l</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="配置-ssh-密钥" tabindex="-1">配置 ssh 密钥 <a class="header-anchor" href="#配置-ssh-密钥" aria-label="Permalink to &quot;配置 ssh 密钥&quot;">​</a></h2><p>配置完密钥之后在 git 上推拉代码的时候就不需要再重复输入密码确认了，比较方便。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">ssh-keygen -t rsa -C &quot;邮箱地址&quot;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># Generating public/private rsa key pair.</span></span>
<span class="line"><span style="color:#e1e4e8;"># 接下来会弹出三个命令会问你存放位置，以及输入两次密码，依次操作即可</span></span>
<span class="line"><span style="color:#e1e4e8;"># Enter file in which to save the key (/root/.ssh/id_rsa):</span></span>
<span class="line"><span style="color:#e1e4e8;"># 输入密码</span></span>
<span class="line"><span style="color:#e1e4e8;"># Enter passphrase (empty for no passphrase):</span></span>
<span class="line"><span style="color:#e1e4e8;"># 确认密码</span></span>
<span class="line"><span style="color:#e1e4e8;"># Enter same passphrase again:</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">ssh-keygen -t rsa -C &quot;邮箱地址&quot;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># Generating public/private rsa key pair.</span></span>
<span class="line"><span style="color:#24292e;"># 接下来会弹出三个命令会问你存放位置，以及输入两次密码，依次操作即可</span></span>
<span class="line"><span style="color:#24292e;"># Enter file in which to save the key (/root/.ssh/id_rsa):</span></span>
<span class="line"><span style="color:#24292e;"># 输入密码</span></span>
<span class="line"><span style="color:#24292e;"># Enter passphrase (empty for no passphrase):</span></span>
<span class="line"><span style="color:#24292e;"># 确认密码</span></span>
<span class="line"><span style="color:#24292e;"># Enter same passphrase again:</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>配置成功后会显示，就是说你的密钥存放在了 /root/.ssh/id_rsa 中</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">Your identification has been saved in /root/.ssh/id_rsa.</span></span>
<span class="line"><span style="color:#e1e4e8;">Your public key has been saved in /root/.ssh/id_rsa.pub.</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">Your identification has been saved in /root/.ssh/id_rsa.</span></span>
<span class="line"><span style="color:#24292e;">Your public key has been saved in /root/.ssh/id_rsa.pub.</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>接下来将私钥添加到本机，输入命令</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">ssh-add ~/.ssh/id_rsa</span></span>
<span class="line"><span style="color:#e1e4e8;"># 接下来会让你输入密码，就是你前面输入的密码</span></span>
<span class="line"><span style="color:#e1e4e8;"># 成功后会显示 Identity added: /root/.ssh/id_rsa (/root/.ssh/id_rsa)</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">ssh-add ~/.ssh/id_rsa</span></span>
<span class="line"><span style="color:#24292e;"># 接下来会让你输入密码，就是你前面输入的密码</span></span>
<span class="line"><span style="color:#24292e;"># 成功后会显示 Identity added: /root/.ssh/id_rsa (/root/.ssh/id_rsa)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>然后就查看一下公钥，这个公钥需要复制到 git 里的 setting。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 查看公钥</span></span>
<span class="line"><span style="color:#e1e4e8;">cat ~/.ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#e1e4e8;"># 显示一大堆字符串，然后复制这堆字符串，按下面的操作进行</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 查看公钥</span></span>
<span class="line"><span style="color:#24292e;">cat ~/.ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#24292e;"># 显示一大堆字符串，然后复制这堆字符串，按下面的操作进行</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><ul><li>点击 github 头像，然后倒数第二个是 setting</li><li>左侧的一堆选项栏中，找到一个钥匙图标的 <code>SSH and GPG keys</code></li><li>然后在 SSH keys 这一个面板，点击右边绿色的 <code>New SSH key</code> 按钮</li><li>随便起个备注的名字，然后将刚刚复制的一大堆字符串密钥，粘贴到这儿，点击确定就完成了</li></ul><p>接下来在服务器控制台输入下面命令来验证是否配置成功</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">ssh -T git@github.com</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">ssh -T git@github.com</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>如果显示下面的命令就配置成功了，好了，git 的安装就可以告一段落了~~~</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">The authenticity of host &#39;github.com (20.205.243.166)&#39; can&#39;t be established.</span></span>
<span class="line"><span style="color:#e1e4e8;">ECDSA key fingerprint is xxxxxxxxxxxxxxxxxx</span></span>
<span class="line"><span style="color:#e1e4e8;">ECDSA key fingerprint is xxxxxxxxxxxxxxxxxx</span></span>
<span class="line"><span style="color:#e1e4e8;">Are you sure you want to continue connecting (yes/no)? yes</span></span>
<span class="line"><span style="color:#e1e4e8;">Warning: Permanently added &#39;github.com,20.205.243.166&#39; (ECDSA) to the list of known hosts.</span></span>
<span class="line"><span style="color:#e1e4e8;">Hi xxxxxxx(你的git名字)! You&#39;ve successfully authenticated, but GitHub does not provide shell access.</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">The authenticity of host &#39;github.com (20.205.243.166)&#39; can&#39;t be established.</span></span>
<span class="line"><span style="color:#24292e;">ECDSA key fingerprint is xxxxxxxxxxxxxxxxxx</span></span>
<span class="line"><span style="color:#24292e;">ECDSA key fingerprint is xxxxxxxxxxxxxxxxxx</span></span>
<span class="line"><span style="color:#24292e;">Are you sure you want to continue connecting (yes/no)? yes</span></span>
<span class="line"><span style="color:#24292e;">Warning: Permanently added &#39;github.com,20.205.243.166&#39; (ECDSA) to the list of known hosts.</span></span>
<span class="line"><span style="color:#24292e;">Hi xxxxxxx(你的git名字)! You&#39;ve successfully authenticated, but GitHub does not provide shell access.</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h2 id="准备好开发完毕的项目" tabindex="-1">准备好开发完毕的项目 <a class="header-anchor" href="#准备好开发完毕的项目" aria-label="Permalink to &quot;准备好开发完毕的项目&quot;">​</a></h2><p>我这里用的项目主要是 Node.js 编写的服务器，其中里面引用了 mongodb 和 redis，然后使用 nginx 作为网关然后配置反向代理。</p><p>我们的项目结构是这样子的，我们下面就拿这样的目录结构来做示范~~~</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">|-- epidemic-compose</span></span>
<span class="line"><span style="color:#e1e4e8;">   |-- docker-compose.yml # 编写 docker-compose 编排逻辑的</span></span>
<span class="line"><span style="color:#e1e4e8;">   |-- epidemic-server # node 服务器</span></span>
<span class="line"><span style="color:#e1e4e8;">   |-- mongo # 存放 mongo 初始化脚本和作为容器中 mongodb 数据的挂载目录</span></span>
<span class="line"><span style="color:#e1e4e8;">   |-- nginx # nginx 的配置</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">|-- epidemic-compose</span></span>
<span class="line"><span style="color:#24292e;">   |-- docker-compose.yml # 编写 docker-compose 编排逻辑的</span></span>
<span class="line"><span style="color:#24292e;">   |-- epidemic-server # node 服务器</span></span>
<span class="line"><span style="color:#24292e;">   |-- mongo # 存放 mongo 初始化脚本和作为容器中 mongodb 数据的挂载目录</span></span>
<span class="line"><span style="color:#24292e;">   |-- nginx # nginx 的配置</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>我们再来看看二级目录长啥样</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">|-- epidemic-compose</span></span>
<span class="line"><span style="color:#e1e4e8;">    |-- docker-compose.yml</span></span>
<span class="line"><span style="color:#e1e4e8;">    |-- epidemic-server</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- commitlint.config.js</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- Dockerfile       # 编写容器的配置</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- nest-cli.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- package.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- .env            # 放环境变量的地方</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- .dockerignore   # 里面忽略 node_modules</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- pnpm-lock.yaml</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- README.md</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- src              # 存放源码的地方</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   |-- tsconfig.build.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   \`-- tsconfig.json</span></span>
<span class="line"><span style="color:#e1e4e8;">    |-- mongo</span></span>
<span class="line"><span style="color:#e1e4e8;">    |--  -- mongo-volume   # 用来挂载 mongodb 容器中的数据库数据</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   \`-- init-mongo.js  # 用来创建 mongodb 初始账户的</span></span>
<span class="line"><span style="color:#e1e4e8;">    |-- nginx</span></span>
<span class="line"><span style="color:#e1e4e8;">    |   \`-- nginx.conf     # 编写 nginx 的配置</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">|-- epidemic-compose</span></span>
<span class="line"><span style="color:#24292e;">    |-- docker-compose.yml</span></span>
<span class="line"><span style="color:#24292e;">    |-- epidemic-server</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- commitlint.config.js</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- Dockerfile       # 编写容器的配置</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- nest-cli.json</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- package.json</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- .env            # 放环境变量的地方</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- .dockerignore   # 里面忽略 node_modules</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- pnpm-lock.yaml</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- README.md</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- src              # 存放源码的地方</span></span>
<span class="line"><span style="color:#24292e;">    |   |-- tsconfig.build.json</span></span>
<span class="line"><span style="color:#24292e;">    |   \`-- tsconfig.json</span></span>
<span class="line"><span style="color:#24292e;">    |-- mongo</span></span>
<span class="line"><span style="color:#24292e;">    |--  -- mongo-volume   # 用来挂载 mongodb 容器中的数据库数据</span></span>
<span class="line"><span style="color:#24292e;">    |   \`-- init-mongo.js  # 用来创建 mongodb 初始账户的</span></span>
<span class="line"><span style="color:#24292e;">    |-- nginx</span></span>
<span class="line"><span style="color:#24292e;">    |   \`-- nginx.conf     # 编写 nginx 的配置</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="编写-docker-配置文件" tabindex="-1">编写 Docker 配置文件 <a class="header-anchor" href="#编写-docker-配置文件" aria-label="Permalink to &quot;编写 Docker 配置文件&quot;">​</a></h2><p>我们先来看看 epidemic-server 目录里的 Dockerfile 如何编写，这个 Dockerfile 最终会将其打包成一个服务端容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 安装 Node 精简版</span></span>
<span class="line"><span style="color:#e1e4e8;">FROM node:16.14.2-alpine</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 设置维护者信息</span></span>
<span class="line"><span style="color:#e1e4e8;">LABEL maintainer=&quot;Dachui&quot;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 防止中文打印信息显示乱码</span></span>
<span class="line"><span style="color:#e1e4e8;">ENV LANG=&quot;C.UTF-8&quot;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 拷贝项目文件进行构建，拷贝到容器内的 app/server 目录下</span></span>
<span class="line"><span style="color:#e1e4e8;">WORKDIR /app/server</span></span>
<span class="line"><span style="color:#e1e4e8;"># 将项目中的 package.json 文件拷贝到容器中的 app/server</span></span>
<span class="line"><span style="color:#e1e4e8;">COPY ./package.json /app/server</span></span>
<span class="line"><span style="color:#e1e4e8;"># 拷贝 pnpm 的依赖锁文件</span></span>
<span class="line"><span style="color:#e1e4e8;">COPY pnpm-lock.yaml /app/server</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 项目中用到了 pnpm 包管理器</span></span>
<span class="line"><span style="color:#e1e4e8;">RUN npm install -g pnpm --registry=https://registry.npm.taobao.org</span></span>
<span class="line"><span style="color:#e1e4e8;"># 然后安装 pm2 用来做服务器的进程守护</span></span>
<span class="line"><span style="color:#e1e4e8;">RUN pnpm install -g pm2</span></span>
<span class="line"><span style="color:#e1e4e8;"># 安装项目依赖</span></span>
<span class="line"><span style="color:#e1e4e8;">RUN pnpm install</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 将当前目录代码复制到容器中</span></span>
<span class="line"><span style="color:#e1e4e8;">COPY . /app/server</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 打包代码</span></span>
<span class="line"><span style="color:#e1e4e8;">RUN pnpm run build</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 对外暴露3000端口</span></span>
<span class="line"><span style="color:#e1e4e8;">EXPOSE 3000</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 运行 pm2 启动打包之后的项目, pm2在容器中运行需要用 pm2-runtime 命令</span></span>
<span class="line"><span style="color:#e1e4e8;">CMD [ &quot;pm2-runtime&quot;, &quot;dist/main.js&quot; ]</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 安装 Node 精简版</span></span>
<span class="line"><span style="color:#24292e;">FROM node:16.14.2-alpine</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 设置维护者信息</span></span>
<span class="line"><span style="color:#24292e;">LABEL maintainer=&quot;Dachui&quot;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 防止中文打印信息显示乱码</span></span>
<span class="line"><span style="color:#24292e;">ENV LANG=&quot;C.UTF-8&quot;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 拷贝项目文件进行构建，拷贝到容器内的 app/server 目录下</span></span>
<span class="line"><span style="color:#24292e;">WORKDIR /app/server</span></span>
<span class="line"><span style="color:#24292e;"># 将项目中的 package.json 文件拷贝到容器中的 app/server</span></span>
<span class="line"><span style="color:#24292e;">COPY ./package.json /app/server</span></span>
<span class="line"><span style="color:#24292e;"># 拷贝 pnpm 的依赖锁文件</span></span>
<span class="line"><span style="color:#24292e;">COPY pnpm-lock.yaml /app/server</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 项目中用到了 pnpm 包管理器</span></span>
<span class="line"><span style="color:#24292e;">RUN npm install -g pnpm --registry=https://registry.npm.taobao.org</span></span>
<span class="line"><span style="color:#24292e;"># 然后安装 pm2 用来做服务器的进程守护</span></span>
<span class="line"><span style="color:#24292e;">RUN pnpm install -g pm2</span></span>
<span class="line"><span style="color:#24292e;"># 安装项目依赖</span></span>
<span class="line"><span style="color:#24292e;">RUN pnpm install</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 将当前目录代码复制到容器中</span></span>
<span class="line"><span style="color:#24292e;">COPY . /app/server</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 打包代码</span></span>
<span class="line"><span style="color:#24292e;">RUN pnpm run build</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 对外暴露3000端口</span></span>
<span class="line"><span style="color:#24292e;">EXPOSE 3000</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 运行 pm2 启动打包之后的项目, pm2在容器中运行需要用 pm2-runtime 命令</span></span>
<span class="line"><span style="color:#24292e;">CMD [ &quot;pm2-runtime&quot;, &quot;dist/main.js&quot; ]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br></div></div><p>接下来我们看看 <code>docker-compose.yml</code> 文件，docker compose 可以将多个容器进行编排，以在最终实现一键启动所有容器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">version: &#39;3&#39;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 自定义网络</span></span>
<span class="line"><span style="color:#e1e4e8;">networks:</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 网络名字</span></span>
<span class="line"><span style="color:#e1e4e8;">  mynet:</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 由网关驱动</span></span>
<span class="line"><span style="color:#e1e4e8;">    driver: bridge</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;"># 容器服务</span></span>
<span class="line"><span style="color:#e1e4e8;">services:</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 服务名称</span></span>
<span class="line"><span style="color:#e1e4e8;">  mongo:</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 安装镜像</span></span>
<span class="line"><span style="color:#e1e4e8;">    image: mongo:latest</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 容器名称</span></span>
<span class="line"><span style="color:#e1e4e8;">    container_name: mongo</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 挂掉之后重新自启</span></span>
<span class="line"><span style="color:#e1e4e8;">    restart: always</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 将容器内的对应目录挂载到宿主机上</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 比如容器中的 /data/db 里面的东西都会放到我们服务器中的 ~mongo/mongo-volume 目录</span></span>
<span class="line"><span style="color:#e1e4e8;">    volumes:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - ./mongo/mongo-volume:/data/db</span></span>
<span class="line"><span style="color:#e1e4e8;">      # init-mongo.js文件会在 mongodb 容器初始化完成之后执行，给数据库创建默认的角色</span></span>
<span class="line"><span style="color:#e1e4e8;">      - ./mongo/init-mongo.js:/docker-entrypoint-initdb.d/mongo-init.js:ro</span></span>
<span class="line"><span style="color:#e1e4e8;">    environment:</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 时区，设置为上海，就是东八区</span></span>
<span class="line"><span style="color:#e1e4e8;">      TZ: Asia/Shanghai</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 初始化 mongodb 的账户，这个账户会创建在 admin 下，就是超管权限</span></span>
<span class="line"><span style="color:#e1e4e8;">      MONGO_INITDB_ROOT_USERNAME: root</span></span>
<span class="line"><span style="color:#e1e4e8;">      MONGO_INITDB_ROOT_PASSWORD: password</span></span>
<span class="line"><span style="color:#e1e4e8;">      MONGO_INITDB_DATABASE: my-database</span></span>
<span class="line"><span style="color:#e1e4e8;">    ports:</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 将容器的27017端口映射到宿主机的27017端口</span></span>
<span class="line"><span style="color:#e1e4e8;">      - 27017:27017</span></span>
<span class="line"><span style="color:#e1e4e8;">    networks:</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 设置网络</span></span>
<span class="line"><span style="color:#e1e4e8;">      - mynet</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  redis:</span></span>
<span class="line"><span style="color:#e1e4e8;">    image: redis:latest</span></span>
<span class="line"><span style="color:#e1e4e8;">    container_name: redis</span></span>
<span class="line"><span style="color:#e1e4e8;">    restart: always</span></span>
<span class="line"><span style="color:#e1e4e8;">    environment:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#e1e4e8;">    ports:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - 6379:6379</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 这里的命令用来给 redis 创建默认的密码，在 node 里面我们用 ioredis 这个包和 redis 进行连接</span></span>
<span class="line"><span style="color:#e1e4e8;">    command:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - /bin/bash</span></span>
<span class="line"><span style="color:#e1e4e8;">      - -c</span></span>
<span class="line"><span style="color:#e1e4e8;">      - redis-server --appendonly yes --requirepass &quot;redispassword&quot;</span></span>
<span class="line"><span style="color:#e1e4e8;">    networks:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - mynet</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 服务器</span></span>
<span class="line"><span style="color:#e1e4e8;">  server:</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 使用 ./epidemic-server 目录下的 Dockerfile 文件进行构建容器，然后启动</span></span>
<span class="line"><span style="color:#e1e4e8;">    build:</span></span>
<span class="line"><span style="color:#e1e4e8;">      context: ./epidemic-server</span></span>
<span class="line"><span style="color:#e1e4e8;">    container_name: server</span></span>
<span class="line"><span style="color:#e1e4e8;">    ports:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - 3000:3000</span></span>
<span class="line"><span style="color:#e1e4e8;">    restart: always</span></span>
<span class="line"><span style="color:#e1e4e8;">    environment:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 这里表示需要先等 mongo 和 redis 两个容器服务启动好才会启动 server</span></span>
<span class="line"><span style="color:#e1e4e8;">    depends_on:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - mongo</span></span>
<span class="line"><span style="color:#e1e4e8;">      - redis</span></span>
<span class="line"><span style="color:#e1e4e8;">    networks:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - mynet</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  nginx:</span></span>
<span class="line"><span style="color:#e1e4e8;">    image: nginx:alpine</span></span>
<span class="line"><span style="color:#e1e4e8;">    container_name: nginx</span></span>
<span class="line"><span style="color:#e1e4e8;">    volumes:</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 容器里的 nginx 配置将当前路径下的 nginx 目录里的 nginx.conf</span></span>
<span class="line"><span style="color:#e1e4e8;">      - ./nginx/nginx.conf:/etc/nginx/nginx.conf</span></span>
<span class="line"><span style="color:#e1e4e8;">    ports:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - 80:80</span></span>
<span class="line"><span style="color:#e1e4e8;">      - 443:443</span></span>
<span class="line"><span style="color:#e1e4e8;">    restart: always</span></span>
<span class="line"><span style="color:#e1e4e8;">    environment:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#e1e4e8;">    networks:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - mynet</span></span>
<span class="line"><span style="color:#e1e4e8;">    depends_on:</span></span>
<span class="line"><span style="color:#e1e4e8;">      - server</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">version: &#39;3&#39;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 自定义网络</span></span>
<span class="line"><span style="color:#24292e;">networks:</span></span>
<span class="line"><span style="color:#24292e;">  # 网络名字</span></span>
<span class="line"><span style="color:#24292e;">  mynet:</span></span>
<span class="line"><span style="color:#24292e;">    # 由网关驱动</span></span>
<span class="line"><span style="color:#24292e;">    driver: bridge</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;"># 容器服务</span></span>
<span class="line"><span style="color:#24292e;">services:</span></span>
<span class="line"><span style="color:#24292e;">  # 服务名称</span></span>
<span class="line"><span style="color:#24292e;">  mongo:</span></span>
<span class="line"><span style="color:#24292e;">    # 安装镜像</span></span>
<span class="line"><span style="color:#24292e;">    image: mongo:latest</span></span>
<span class="line"><span style="color:#24292e;">    # 容器名称</span></span>
<span class="line"><span style="color:#24292e;">    container_name: mongo</span></span>
<span class="line"><span style="color:#24292e;">    # 挂掉之后重新自启</span></span>
<span class="line"><span style="color:#24292e;">    restart: always</span></span>
<span class="line"><span style="color:#24292e;">    # 将容器内的对应目录挂载到宿主机上</span></span>
<span class="line"><span style="color:#24292e;">    # 比如容器中的 /data/db 里面的东西都会放到我们服务器中的 ~mongo/mongo-volume 目录</span></span>
<span class="line"><span style="color:#24292e;">    volumes:</span></span>
<span class="line"><span style="color:#24292e;">      - ./mongo/mongo-volume:/data/db</span></span>
<span class="line"><span style="color:#24292e;">      # init-mongo.js文件会在 mongodb 容器初始化完成之后执行，给数据库创建默认的角色</span></span>
<span class="line"><span style="color:#24292e;">      - ./mongo/init-mongo.js:/docker-entrypoint-initdb.d/mongo-init.js:ro</span></span>
<span class="line"><span style="color:#24292e;">    environment:</span></span>
<span class="line"><span style="color:#24292e;">      # 时区，设置为上海，就是东八区</span></span>
<span class="line"><span style="color:#24292e;">      TZ: Asia/Shanghai</span></span>
<span class="line"><span style="color:#24292e;">      # 初始化 mongodb 的账户，这个账户会创建在 admin 下，就是超管权限</span></span>
<span class="line"><span style="color:#24292e;">      MONGO_INITDB_ROOT_USERNAME: root</span></span>
<span class="line"><span style="color:#24292e;">      MONGO_INITDB_ROOT_PASSWORD: password</span></span>
<span class="line"><span style="color:#24292e;">      MONGO_INITDB_DATABASE: my-database</span></span>
<span class="line"><span style="color:#24292e;">    ports:</span></span>
<span class="line"><span style="color:#24292e;">      # 将容器的27017端口映射到宿主机的27017端口</span></span>
<span class="line"><span style="color:#24292e;">      - 27017:27017</span></span>
<span class="line"><span style="color:#24292e;">    networks:</span></span>
<span class="line"><span style="color:#24292e;">      # 设置网络</span></span>
<span class="line"><span style="color:#24292e;">      - mynet</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  redis:</span></span>
<span class="line"><span style="color:#24292e;">    image: redis:latest</span></span>
<span class="line"><span style="color:#24292e;">    container_name: redis</span></span>
<span class="line"><span style="color:#24292e;">    restart: always</span></span>
<span class="line"><span style="color:#24292e;">    environment:</span></span>
<span class="line"><span style="color:#24292e;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#24292e;">    ports:</span></span>
<span class="line"><span style="color:#24292e;">      - 6379:6379</span></span>
<span class="line"><span style="color:#24292e;">    # 这里的命令用来给 redis 创建默认的密码，在 node 里面我们用 ioredis 这个包和 redis 进行连接</span></span>
<span class="line"><span style="color:#24292e;">    command:</span></span>
<span class="line"><span style="color:#24292e;">      - /bin/bash</span></span>
<span class="line"><span style="color:#24292e;">      - -c</span></span>
<span class="line"><span style="color:#24292e;">      - redis-server --appendonly yes --requirepass &quot;redispassword&quot;</span></span>
<span class="line"><span style="color:#24292e;">    networks:</span></span>
<span class="line"><span style="color:#24292e;">      - mynet</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  # 服务器</span></span>
<span class="line"><span style="color:#24292e;">  server:</span></span>
<span class="line"><span style="color:#24292e;">    # 使用 ./epidemic-server 目录下的 Dockerfile 文件进行构建容器，然后启动</span></span>
<span class="line"><span style="color:#24292e;">    build:</span></span>
<span class="line"><span style="color:#24292e;">      context: ./epidemic-server</span></span>
<span class="line"><span style="color:#24292e;">    container_name: server</span></span>
<span class="line"><span style="color:#24292e;">    ports:</span></span>
<span class="line"><span style="color:#24292e;">      - 3000:3000</span></span>
<span class="line"><span style="color:#24292e;">    restart: always</span></span>
<span class="line"><span style="color:#24292e;">    environment:</span></span>
<span class="line"><span style="color:#24292e;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#24292e;">    # 这里表示需要先等 mongo 和 redis 两个容器服务启动好才会启动 server</span></span>
<span class="line"><span style="color:#24292e;">    depends_on:</span></span>
<span class="line"><span style="color:#24292e;">      - mongo</span></span>
<span class="line"><span style="color:#24292e;">      - redis</span></span>
<span class="line"><span style="color:#24292e;">    networks:</span></span>
<span class="line"><span style="color:#24292e;">      - mynet</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  nginx:</span></span>
<span class="line"><span style="color:#24292e;">    image: nginx:alpine</span></span>
<span class="line"><span style="color:#24292e;">    container_name: nginx</span></span>
<span class="line"><span style="color:#24292e;">    volumes:</span></span>
<span class="line"><span style="color:#24292e;">      # 容器里的 nginx 配置将当前路径下的 nginx 目录里的 nginx.conf</span></span>
<span class="line"><span style="color:#24292e;">      - ./nginx/nginx.conf:/etc/nginx/nginx.conf</span></span>
<span class="line"><span style="color:#24292e;">    ports:</span></span>
<span class="line"><span style="color:#24292e;">      - 80:80</span></span>
<span class="line"><span style="color:#24292e;">      - 443:443</span></span>
<span class="line"><span style="color:#24292e;">    restart: always</span></span>
<span class="line"><span style="color:#24292e;">    environment:</span></span>
<span class="line"><span style="color:#24292e;">      - TZ=Asia/Shanghai</span></span>
<span class="line"><span style="color:#24292e;">    networks:</span></span>
<span class="line"><span style="color:#24292e;">      - mynet</span></span>
<span class="line"><span style="color:#24292e;">    depends_on:</span></span>
<span class="line"><span style="color:#24292e;">      - server</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br></div></div><p>接下来我们来看看 mongo 目录下的 <code>init-mongo.js</code> 文件</p><p>这个文件主要是在 mongo 容器生成的时候给 epidemic- server 数据库设置初始化密码用的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">// 需要和上面 docker-compose.yml 里的MONGO_INITDB_ROOT_USERNAME和 MONGO_INITDB_ROOT_PASSWORD 对应上</span></span>
<span class="line"><span style="color:#e1e4e8;">db.auth(&quot;root&quot;, &quot;password&quot;);</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">// 需要和上面的 MONGO_INITDB_DATABASE 对应上</span></span>
<span class="line"><span style="color:#e1e4e8;">db = db.getSiblingDB(&quot;my-database&quot;);</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">db.createUser({</span></span>
<span class="line"><span style="color:#e1e4e8;">  user: &quot;user1&quot;,</span></span>
<span class="line"><span style="color:#e1e4e8;">  pwd: &quot;password1&quot;,</span></span>
<span class="line"><span style="color:#e1e4e8;">  roles: [</span></span>
<span class="line"><span style="color:#e1e4e8;">    {</span></span>
<span class="line"><span style="color:#e1e4e8;">     // 赋予这个用户读写 my-databse 数据库的权限</span></span>
<span class="line"><span style="color:#e1e4e8;">      role: &quot;readWrite&quot;,</span></span>
<span class="line"><span style="color:#e1e4e8;">      db: &quot;my-database&quot;,</span></span>
<span class="line"><span style="color:#e1e4e8;">    },</span></span>
<span class="line"><span style="color:#e1e4e8;">  ],</span></span>
<span class="line"><span style="color:#e1e4e8;">});</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">// 需要和上面 docker-compose.yml 里的MONGO_INITDB_ROOT_USERNAME和 MONGO_INITDB_ROOT_PASSWORD 对应上</span></span>
<span class="line"><span style="color:#24292e;">db.auth(&quot;root&quot;, &quot;password&quot;);</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">// 需要和上面的 MONGO_INITDB_DATABASE 对应上</span></span>
<span class="line"><span style="color:#24292e;">db = db.getSiblingDB(&quot;my-database&quot;);</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">db.createUser({</span></span>
<span class="line"><span style="color:#24292e;">  user: &quot;user1&quot;,</span></span>
<span class="line"><span style="color:#24292e;">  pwd: &quot;password1&quot;,</span></span>
<span class="line"><span style="color:#24292e;">  roles: [</span></span>
<span class="line"><span style="color:#24292e;">    {</span></span>
<span class="line"><span style="color:#24292e;">     // 赋予这个用户读写 my-databse 数据库的权限</span></span>
<span class="line"><span style="color:#24292e;">      role: &quot;readWrite&quot;,</span></span>
<span class="line"><span style="color:#24292e;">      db: &quot;my-database&quot;,</span></span>
<span class="line"><span style="color:#24292e;">    },</span></span>
<span class="line"><span style="color:#24292e;">  ],</span></span>
<span class="line"><span style="color:#24292e;">});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>我们在 Node.js 里用 mongoose 是这样子连接数据库的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># @ 后面本身是填域名的，但是我们这里用的是 docker 容器间通信，所以要填服务名称，就是上面docker-compose里的services-&gt;mongo</span></span>
<span class="line"><span style="color:#e1e4e8;">mongodb://user1:password1@mongo/my-database</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># @ 后面本身是填域名的，但是我们这里用的是 docker 容器间通信，所以要填服务名称，就是上面docker-compose里的services-&gt;mongo</span></span>
<span class="line"><span style="color:#24292e;">mongodb://user1:password1@mongo/my-database</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>最后我们再来看看 nginx.conf 文件，这个文件是用来编写 nginx 配置服务的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 运行用户，默认即是nginx，可以不进行设置</span></span>
<span class="line"><span style="color:#e1e4e8;">user nginx;</span></span>
<span class="line"><span style="color:#e1e4e8;"># nginx进程数，建议设置为等于CPU总核心数。</span></span>
<span class="line"><span style="color:#e1e4e8;">worker_processes 1;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">events {</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)</span></span>
<span class="line"><span style="color:#e1e4e8;">  use epoll;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 每个进程允许最大并发数</span></span>
<span class="line"><span style="color:#e1e4e8;">  worker_connections 1024;</span></span>
<span class="line"><span style="color:#e1e4e8;">}</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">http {</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 开启高效传输模式</span></span>
<span class="line"><span style="color:#e1e4e8;">  sendfile on;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 减少网络报文段的数量</span></span>
<span class="line"><span style="color:#e1e4e8;">  tcp_nopush on;</span></span>
<span class="line"><span style="color:#e1e4e8;">  tcp_nodelay on;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 保持连接的时间，也叫超时时间，单位秒</span></span>
<span class="line"><span style="color:#e1e4e8;">  keepalive_timeout 30;</span></span>
<span class="line"><span style="color:#e1e4e8;">  types_hash_max_size 2048;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 文件扩展名与类型映射表</span></span>
<span class="line"><span style="color:#e1e4e8;">  include /etc/nginx/mime.types;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 加载其它的子配置文件</span></span>
<span class="line"><span style="color:#e1e4e8;">  include /etc/nginx/conf.d/*.conf;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 默认文件类型</span></span>
<span class="line"><span style="color:#e1e4e8;">  default_type application/octet-stream;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 默认off，是否开启 gzip 压缩</span></span>
<span class="line"><span style="color:#e1e4e8;">  gzip on;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 设置启用 gzip 的类型</span></span>
<span class="line"><span style="color:#e1e4e8;">  gzip_types text/plain text/css application/json application/x-javascript text/javascript;</span></span>
<span class="line"><span style="color:#e1e4e8;">  # gzip 压缩比，压缩级别是 1-9，1 压缩级别最低，9 最高，级别越高压缩率越大，压缩时间越长，建议 4-6</span></span>
<span class="line"><span style="color:#e1e4e8;">  gzip_comp_level 4;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  # 服务器地址，这里可以配置多个服务器地址，实现负载均衡</span></span>
<span class="line"><span style="color:#e1e4e8;">  upstream my_server {</span></span>
<span class="line"><span style="color:#e1e4e8;">    server 服务器地址(可以是ip也可以填域名):3000;</span></span>
<span class="line"><span style="color:#e1e4e8;">  }</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">  server {</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 监听启动80端口</span></span>
<span class="line"><span style="color:#e1e4e8;">    listen 80;</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 服务器地址，也可以填域名或ip地址</span></span>
<span class="line"><span style="color:#e1e4e8;">    server_name 服务器地址;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">    #location / {</span></span>
<span class="line"><span style="color:#e1e4e8;">    #  如果你有前端项目的话，这里也可以找你打包后前端项目</span></span>
<span class="line"><span style="color:#e1e4e8;">    #  root 前端打包后文件的地址;</span></span>
<span class="line"><span style="color:#e1e4e8;">    #  index index.html index.htm;</span></span>
<span class="line"><span style="color:#e1e4e8;">    #  try_files $uri $uri/ /index.html;</span></span>
<span class="line"><span style="color:#e1e4e8;">    #}</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 我编写 node服务的时候，把所有接口的前缀都加上了 /api</span></span>
<span class="line"><span style="color:#e1e4e8;">    # 当 nginx 匹配到请求 /api后缀的路径时就会把请求代理到 3000 端口的 node 服务</span></span>
<span class="line"><span style="color:#e1e4e8;">    location /api/ {</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 代理本机启动的 node 服务器，服务器启动在 3000 端口</span></span>
<span class="line"><span style="color:#e1e4e8;">      proxy_pass http://my_server/api/;</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">      # 获取用户真实 ip，否则 Node 服务中拿不到用户的 ip 地址</span></span>
<span class="line"><span style="color:#e1e4e8;">      proxy_set_header Host $host;</span></span>
<span class="line"><span style="color:#e1e4e8;">      proxy_set_header X-Real-IP $remote_addr;</span></span>
<span class="line"><span style="color:#e1e4e8;">      proxy_set_header X-Real-Port $remote_port;</span></span>
<span class="line"><span style="color:#e1e4e8;">      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</span></span>
<span class="line"><span style="color:#e1e4e8;">    }</span></span>
<span class="line"><span style="color:#e1e4e8;">  }</span></span>
<span class="line"><span style="color:#e1e4e8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 运行用户，默认即是nginx，可以不进行设置</span></span>
<span class="line"><span style="color:#24292e;">user nginx;</span></span>
<span class="line"><span style="color:#24292e;"># nginx进程数，建议设置为等于CPU总核心数。</span></span>
<span class="line"><span style="color:#24292e;">worker_processes 1;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">events {</span></span>
<span class="line"><span style="color:#24292e;">  # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)</span></span>
<span class="line"><span style="color:#24292e;">  use epoll;</span></span>
<span class="line"><span style="color:#24292e;">  # 每个进程允许最大并发数</span></span>
<span class="line"><span style="color:#24292e;">  worker_connections 1024;</span></span>
<span class="line"><span style="color:#24292e;">}</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">http {</span></span>
<span class="line"><span style="color:#24292e;">  # 开启高效传输模式</span></span>
<span class="line"><span style="color:#24292e;">  sendfile on;</span></span>
<span class="line"><span style="color:#24292e;">  # 减少网络报文段的数量</span></span>
<span class="line"><span style="color:#24292e;">  tcp_nopush on;</span></span>
<span class="line"><span style="color:#24292e;">  tcp_nodelay on;</span></span>
<span class="line"><span style="color:#24292e;">  # 保持连接的时间，也叫超时时间，单位秒</span></span>
<span class="line"><span style="color:#24292e;">  keepalive_timeout 30;</span></span>
<span class="line"><span style="color:#24292e;">  types_hash_max_size 2048;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  # 文件扩展名与类型映射表</span></span>
<span class="line"><span style="color:#24292e;">  include /etc/nginx/mime.types;</span></span>
<span class="line"><span style="color:#24292e;">  # 加载其它的子配置文件</span></span>
<span class="line"><span style="color:#24292e;">  include /etc/nginx/conf.d/*.conf;</span></span>
<span class="line"><span style="color:#24292e;">  # 默认文件类型</span></span>
<span class="line"><span style="color:#24292e;">  default_type application/octet-stream;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  # 默认off，是否开启 gzip 压缩</span></span>
<span class="line"><span style="color:#24292e;">  gzip on;</span></span>
<span class="line"><span style="color:#24292e;">  # 设置启用 gzip 的类型</span></span>
<span class="line"><span style="color:#24292e;">  gzip_types text/plain text/css application/json application/x-javascript text/javascript;</span></span>
<span class="line"><span style="color:#24292e;">  # gzip 压缩比，压缩级别是 1-9，1 压缩级别最低，9 最高，级别越高压缩率越大，压缩时间越长，建议 4-6</span></span>
<span class="line"><span style="color:#24292e;">  gzip_comp_level 4;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  # 服务器地址，这里可以配置多个服务器地址，实现负载均衡</span></span>
<span class="line"><span style="color:#24292e;">  upstream my_server {</span></span>
<span class="line"><span style="color:#24292e;">    server 服务器地址(可以是ip也可以填域名):3000;</span></span>
<span class="line"><span style="color:#24292e;">  }</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">  server {</span></span>
<span class="line"><span style="color:#24292e;">    # 监听启动80端口</span></span>
<span class="line"><span style="color:#24292e;">    listen 80;</span></span>
<span class="line"><span style="color:#24292e;">    # 服务器地址，也可以填域名或ip地址</span></span>
<span class="line"><span style="color:#24292e;">    server_name 服务器地址;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">    #location / {</span></span>
<span class="line"><span style="color:#24292e;">    #  如果你有前端项目的话，这里也可以找你打包后前端项目</span></span>
<span class="line"><span style="color:#24292e;">    #  root 前端打包后文件的地址;</span></span>
<span class="line"><span style="color:#24292e;">    #  index index.html index.htm;</span></span>
<span class="line"><span style="color:#24292e;">    #  try_files $uri $uri/ /index.html;</span></span>
<span class="line"><span style="color:#24292e;">    #}</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">    # 我编写 node服务的时候，把所有接口的前缀都加上了 /api</span></span>
<span class="line"><span style="color:#24292e;">    # 当 nginx 匹配到请求 /api后缀的路径时就会把请求代理到 3000 端口的 node 服务</span></span>
<span class="line"><span style="color:#24292e;">    location /api/ {</span></span>
<span class="line"><span style="color:#24292e;">      # 代理本机启动的 node 服务器，服务器启动在 3000 端口</span></span>
<span class="line"><span style="color:#24292e;">      proxy_pass http://my_server/api/;</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">      # 获取用户真实 ip，否则 Node 服务中拿不到用户的 ip 地址</span></span>
<span class="line"><span style="color:#24292e;">      proxy_set_header Host $host;</span></span>
<span class="line"><span style="color:#24292e;">      proxy_set_header X-Real-IP $remote_addr;</span></span>
<span class="line"><span style="color:#24292e;">      proxy_set_header X-Real-Port $remote_port;</span></span>
<span class="line"><span style="color:#24292e;">      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</span></span>
<span class="line"><span style="color:#24292e;">    }</span></span>
<span class="line"><span style="color:#24292e;">  }</span></span>
<span class="line"><span style="color:#24292e;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br></div></div><h2 id="项目部署" tabindex="-1">项目部署 <a class="header-anchor" href="#项目部署" aria-label="Permalink to &quot;项目部署&quot;">​</a></h2><p>正常来说将本地代码部署到远程服务器上有几种方式：</p><ol start="0"><li>在本地连接到远程服务器后直接将本地的代码通过文件传输命令行发送到服务器上，然后在服务器上进行所有操作</li><li>在本地把所有容器 build 好之后上传到 DockerHub 中（一般要设置为私有仓库），然后在服务器上拉取 DockerHub 的镜像</li><li>本地开发完之后上传代码到 Git，然后在服务器上通过 Git 拉取代码，然后进行部署</li></ol><p>我们这里使用的是第三种方法来进行代码管理 ：</p><p>本地代码开发完成之后，上传到 git，这一步不用说了吧，默认你会上传代码哈~~~然后在服务器上拉取 git 仓库中的代码，上传代码到仓库之后，要去克隆 ssh 的链接，而不是 https 的链接，类似下面这样的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">git clone git@github.com:用户名/仓库名.git</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">git clone git@github.com:用户名/仓库名.git</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>接下来在服务器中的 root 目录下新建一个 project 目录并进入到该目录，然后去拉取 git 中的代码</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">cd ~root &amp;&amp; mkdir project &amp;&amp; cd myproject</span></span>
<span class="line"><span style="color:#e1e4e8;">​</span></span>
<span class="line"><span style="color:#e1e4e8;">git clone git@github.com:用户名/仓库名.git</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">cd ~root &amp;&amp; mkdir project &amp;&amp; cd myproject</span></span>
<span class="line"><span style="color:#24292e;">​</span></span>
<span class="line"><span style="color:#24292e;">git clone git@github.com:用户名/仓库名.git</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>输入下面命令可以查看当前文件夹下所有的文件和目录</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">ls -a</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">ls -a</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>然后进入到仓库中，我们的仓库就叫做 <code>epidemic-compose</code>，然后就要 <code>cd epidemic-compose</code> 进入项目文件夹内，准备构建项目</p><p>然后运行下面的这个命令，等待安装完成~~~ 到这里其实项目就已经是可以正常访问了的~</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">docker-compose up -d --build</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">docker-compose up -d --build</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>最后的最后，我们的 node.js 服务是部署在 3000 端口的，然后我们使用了反向代理 proxy_pass，所以我们可以直接通过 80 端口去访问到我们的服务器，下面我们就看看效果</p><p><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba0caf772a264877b02aeff0a926f11e~tplv-k3u1fbpfcp-zoom-1.image" alt=""></p><p>大功告成了哈~</p><p>看吧，我们只要把项目开发完毕之后，再编写一下 docker 的配置文件，就可以快速从一个机器上把项目部署到另一个机器上 ，我这里开发的时候用的是 Windows 系统，然后用 docker 快速把项目部署到 Linux 系统的服务器上。不难吧~~~</p><h1 id="结语" tabindex="-1">结语 <a class="header-anchor" href="#结语" aria-label="Permalink to &quot;结语&quot;">​</a></h1><p>其实在最后一步的时候还可以加上自动化，比如每次我们从本地上传最新代码到 git 的时候就触发一个钩子函数，服务器上从仓库拉取最新代码然后重新启动容器，这样的话我们就能做到一套完整的自动化部署流程了。</p>`,197),o=[l];function c(r,i,t,d,b,u){return n(),a("div",null,o)}const h=s(p,[["render",c]]);export{y as __pageData,h as default};
