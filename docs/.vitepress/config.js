export default {
  lastUpdated: true,
  lastUpdatedText: "更新时间",
  editLink: {
    pattern: "https://github.com/vuejs/vitepress/edit/main/docs/:path",
    text: "编辑此页",
  },
  themeConfig: {
    siteTitle: "与你同在的学习空间",
    footer: {
      message: "每天进步一丢丢",
      copyright: "Copyright © 2023 BesideWithYou",
    },
    logo: "https://i.niupic.com/images/2023/01/06/aeYt.png",
    nav: [
      { text: "前端体系", link: "/frontend/" },
      { text: "服务端", link: "/backend/" },
      { text: "Rust", link: "/rust/" },
      { text: "算法学习", link: "/algorithm/" },
    ],
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
          items: [{ text: "TS", link: "/frontend/typescript/" }],
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
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/BesideWithYou",
      },
    ],
  },
};
