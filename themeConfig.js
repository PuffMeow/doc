module.exports = {
  sidebar: {
    "/frontend/": [
      {
        text: "JavaScript",
        collapsible: true,
        items: [
          { text: "JS基础", link: "/frontend/javascript/" },
          { text: "Canvas", link: "/frontend/javascript/canvas" },
        ],
      },
      {
        text: "TypeScript",
        collapsible: true,
        items: [{ text: "装饰器", link: "/frontend/typescript/decorator" }],
      },
      {
        text: "React",
        collapsible: true,
        items: [{ text: "React", link: "/frontend/react/" }],
      },
      {
        text: "WebAssembly",
        collapsible: true,
        items: [{ text: "基础入门", link: "/frontend/wasm/" }],
      },
    ],
    "/backend/": [
      {
        collapsible: true,
        text: "MySQL数据库",
        items: [
          { text: "基础", link: "/backend/mysql/base" },
          { text: "进阶", link: "/backend/mysql/advanced" },
        ],
      },
      {
        collapsible: true,
        text: "中间件",
        items: [{ text: "Redis", link: "/backend/middleware/redis" }],
      },
    ],
    "/rust/": [
      {
        collapsible: true,
        text: "Rust实战",
        items: [{ text: "从一个ToDo应用入门", link: "/rust/practical/todo" }],
      },
    ],
    "/algorithm/": [
      {
        collapsible: true,
        text: "算法",
        items: [{ text: "树", link: "/algorithm/tree/" }],
      },
    ],
  },
  nav: [
    { text: "前端体系", link: "/frontend/" },
    { text: "服务端", link: "/backend/" },
    { text: "Rust", link: "/rust/" },
    { text: "算法学习", link: "/algorithm/" },
  ],
};
