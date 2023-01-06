const { nav, sidebar } = require("../../themeConfig");

export default {
  base: "/doc/",
  lastUpdated: true,
  lastUpdatedText: "更新时间",
  markdown: {
    lineNumbers: true,
  },
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
    nav,
    sidebar,
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/BesideWithYou",
      },
    ],
  },
};
