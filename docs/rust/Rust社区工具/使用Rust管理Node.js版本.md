## 使用 Rust 切换 Node.js 版本

这篇文章主要介绍一个使用 Rust 进行编写的一体化版本管理工具 Rtx，比如使用它来管理 Node.js 版本，它很简单易用，使用了它，就可以抛弃掉 nvm 了。

它拥有下面这些特性：

- 它类似于 asdf 这个版本管理工具，完全兼容 asdf 的插件系统
- 模糊匹配和使用别名——安装时只需要指定 “v20” 或 “lts” 版本就够了。Rtx 将计算出正确的版本，而不需要指定精确的版本。
- 兼容非常多的语言，只需要使用这一个工具去代替 gvm、 nvm、 rbenv 和 pyenv 这些工具就够了。
- 速度非常快——因为它使用 Rust 编写，并且优化了性能，比 asdf 要快 20 倍以上。

那么 asdf 是啥?

> asdf 是一个命令行工具，可以在每个项目上管理多个语言运行时的版本。就像 gvm、 nvm、 rbenv 和 pyenv 等这些版本管理工具的一体化集合，你只需要安装对应语言的插件即可，也就是说有了 它，就不需要安装别的一堆工具了。

那么 Rtx 也如 asdf 一样，可以直接作为替代品来使用，并且更强大。

虽然但是，它目前不支持 Windows 系统，但是官方已经在考虑支持中了。Linux 和 MacOS 的用户可以使用起来了，接下来我们就来说说如何安装和使用它吧

## 安装

使用 curl 安装(推荐):

```bash
curl https://rtx.jdx.dev/install.sh | sh
```

使用 npm 安装：

```bash
npm install -g rtx-cli
```

使用 Rust cargo 来安装

```bash
cargo install cargo-binstall
cargo binstall rtx-cli
```

## 注册命令钩子

安装完成之后需要在 shell 中注册命令钩子

Bash:

```bash
echo 'eval "$(rtx activate bash)"' >> ~/.bashrc
```

Zsh:

```bash
echo 'eval "$(rtx activate zsh)"' >> "${ZDOTDIR-$HOME}/.zshrc"
```

安装完成之后，可以查看到版本号说明安装成功了

```bash
rtx -v
```

## 安装 Node.js

安装 node 20 的长期支持版本并设置为全局默认

```bash
rtx use --global node@20
```

安装完成之后在控制台输入下面命令能打印出对应的版本即可

```bash
node -v
```

## 常用命令

```
rtx install node@20.0.0  安装指定版本号
rtx install node@20      模糊匹配安装
rtx use node@20          在当前项目中使用 node 20.x 版本
rtx use -g node@20       在全局使用 node 20.x 版本

rtx use node@latest      在当前项目使用最新版 node
rtx use -g node@system   使用系统的 node 作为全局版本
```

## 其它

上面只是提到了 node.js，除了 node.js 之外，比如 Java/Golang 等语言，只需要安装上它们对应的插件，然后就能够对其进行版本管理了。其它的还有一些配置化，定制化的能力就等需要使用到的时候再去探索好了。更多的能力大家也可以去参考下官方。

## 总结

这篇文章主要讲了这个工具的基础使用，但是对于我们日常来说其实也足够了，假如你现在同时在使用 Go/Node.js 或其它的多个语言，那么这个工具其实还是很不错的，可以让你省掉很多安装对应语言版本管理工具的流程。
