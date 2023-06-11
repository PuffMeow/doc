## 初始化

安装脚手架

```
npm i -g @nestjs/cli
```

创建项目

```
nest new ordering-app
```

## 创建子项目

```
nest generate app orders
```

将项目转成 monorepo 结构的。

然后移除掉 apps/ordering-app 目录以及 nest-cli.json 中的 projects.ordering-app 结构

然后修改 nest-cli.json 中的所有 ordering-app 成 orders

然后再创建两个子项目

```
nest g app billing
```

```
nest g app auth
```

创建一个公用的library

```
nest g library common
```

