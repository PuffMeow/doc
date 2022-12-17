import { defineConfig } from 'dumi';

export default defineConfig({
  base: '/doc/',
  publicPath: '/doc/',
  hash: true,
  themeConfig: {
    name: 'Study',
    nav: [
      { title: '前端', link: '/front-end' },
      { title: 'Rust', link: '/rust' },
      { title: '服务端', link: '/back-end' },
      { title: '数据结构', link: '/data-struct' },
    ],
    footer: '@2022-BesideWithYou',
  },
});
