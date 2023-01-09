import themeConfig from '../../themeConfig';

// 配置地址:https://vitepress.vuejs.org/guide/configuration
export default {
  title: 'PuffMiaow',
  description: 'PuffMiaow',
  base: '/doc/',
  lastUpdated: true,
  head: [
    [
      'link',
      {
        rel: 'shortcut icon',
        href: 'https://i.niupic.com/images/2023/01/06/aeYt.png',
        type: 'image/x-icon',
      },
    ],
  ],
  markdown: {
    lineNumbers: true,
  },
  editLink: {
    pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
    text: '编辑此页',
  },
  themeConfig: {
    ...themeConfig,
    lastUpdatedText: '更新时间',
    siteTitle: '喵喵爱学习',
    footer: {
      message: '每天进步一丢丢',
      copyright: 'Copyright © 2023 PuffMiaow',
    },
    logo: 'https://i.niupic.com/images/2023/01/06/aeYt.png',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/PuffMiaow/doc',
      },
    ],
  },
};