## 简介

这篇文章主要介绍如何在 Windows 环境下美化命令行环境的，默认 Windows 使用的一般是 Powershell 或者 cmd ，但是他们不支持大部分在 UNIX 系统(MacOS、Linux 等系统)下的命令。对于一个在公司使用 MacOS， 在家使用 Windows 的人十分不适应，所以就琢磨了一下如何在 Windows 下去安装 zsh 和 oh-my-zsh 来美化命令行开发环境（使用 Git-bash 来支持，非虚拟机环境）。

对比一下美化前和美化后的一个基本对比：

- 支持语法高亮
- 支持 Git 分支的查看
- 支持历史命令自动补全
- 支持快速跳转到历史路径

美化之前：

![image-20231130000218888](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130000218888.png)

美化之后：

![image-20231130000324186](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130000324186.png)

美化之后此时我们可以看到当前 Git 所在分支，并且可以看到 ls 命令也比之前要简洁，还有没有命令补全之前我们需要一个个去输入完整的命令，有了命令补全之后，输入一个字母就能联想，此时按方向右键就能够快速去补全，很方便。

> 我们要做的是将 Git Bash 默认的 bash-shell 修改为 zsh。
>
> Shell 是操作系统和用户对话的一个媒介。它接收用户或其他应用程序的命令，然后把这些命令转化成系统内核能理解的语言，传给内核，内核是真正干活的，干完之后再把结果返回用户或应用程序。

接下来让我们来看下如何配置吧

## 环境安装

### Git

首先你需要确保你的 Windows 电脑上安装了 Git 环境，并且拥有 Git Bash。

这一步可以到官网下载：https://gitforwindows.org/

> Git for Windows 提供了一个 BASH 仿真环境，用于从命令行运行 Git。UNIX 用户使用起来会感到很亲切。

安装 Git for Windows 的时候注意勾选`Add a Git Bash Profile to Windows Terminal` 即可，最后安装好了即可，这一步操作比较简单。

### ZSH

到这个网站去下载 ZSH 的包

https://packages.msys2.org/package/zsh?repo=msys&variant=x86_64

![image-20231130003042280](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130003042280.png)

然后在 Windows 上使用这个软件去解压缩 zst 格式的文件，这里下载：https://peazip.github.io/

![image-20231130003137464](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130003137464.png)

解压后的文件中包含 `etc` 和 `usr` 和其它的一些文件。将解压出来的所有文件，复制到 git-bash 安装的根目录

然后这时候其实就已经安装好了 zsh，重启一下 git-bash 终端。

这时候在 git-bash 中输入 `zsh` 会出现下面的配置界面，直接按 0 不配置即可。

![image-20231130004640851](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130004640851.png)

如果你想要在 git-bash 启动的时候自动采用 zsh，需要在 git-bash 中输入 `vim ~/.bashrc`（不会使用 vim 的话就用 vscode 打开，使用 `code ~/.bashrc`) ，加入这几行代码

```
if [ -t 1 ]; then
  exec zsh
fi
```

然后输入命令

```
source ~/.bashrc
```

这时候就差不多完成了，最后控制台输入 `zsh --version` 检查一下

![image-20231130003821915](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130003821915.png)

接下来安装 oh-my-zsh

> oh-my-zsh 是一个社区驱动的 zsh 框架，它旨在为 zsh 提供大量实用的功能、插件、主题等

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

安装完成之后你的终端上会出现这个大大的 LOGO

![image-20231130004519626](https://cdn.jsdelivr.net/gh/PuffMeow/PictureSave/doc/image-20231130004519626.png)

安装完 oh-my-zsh 之后就可以安装和配置一些插件了

### 插件安装

#### 自动补全

首先安装自动命令补全插件

```
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

接下来去进行配置，打开 `vim ~/.zshrc`，修改 plugins

```
plugins=(git zsh-autosuggestions)
```

在终端输入以下命令更新`.zshrc`配置文件

```text
source ~/.zshrc
```

#### 语法高亮

```
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

然后和上面一样的步骤

去进行配置，打开 `vim ~/.zshrc`，修改 plugins

```
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

在终端输入以下命令更新`.zshrc`配置文件

```text
source ~/.zshrc
```

#### 快速跳转

其实常用的插件是 autojump，但是在 Windows 上安装这玩意太复杂了，就使用 zsh 自带的 z 插件就好了，

plugins 里面加入 z

```
plugins=(git zsh-autosuggestions zsh-syntax-highlighting z)
```

在终端输入以下命令更新`.zshrc`配置文件

```
source ~/.zshrc
```

这个命令的作用是快速跳转到某个曾经到过的目录，比如我曾经访问过 ~/home/frontend/demo 路径，当此时我在 ~ 路径下，我可以直接输入 `z demo` 跳转过去

到这里其实一个够用的终端就已经差不多搞完了，如果还想继续优化的话，可以再探索一下其它的插件。

## 小结

其实 Windows 下开发还是不如 Unix 类系统那么方便，毕竟很多开发工具对 Windows 的支持都不怎么好，配置的过程中一堆一堆的问题。另外如果还想让 Windows 下开发环境更舒服一些，也可以装一下 Windows Terminal，或者也可以试试 WSL 虚拟机，使用虚拟机 Linux 系统，但是就是虚拟机和宿主机的数据不互通，这个搞起来会麻烦一些。

总的来说，想要搞开发，要么一步到位上 MacOS，要么就装双系统，加一个 Linux 系统。或者也可以像我这么折腾一下凑合着用。。。
