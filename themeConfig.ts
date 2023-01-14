import { getSideBarConfig } from './utils';

export default {
  sidebar: {
    '/frontend/': getSideBarConfig('frontend'),
    '/backend/': getSideBarConfig('backend'),
    '/rust/': getSideBarConfig('rust'),
    '/algorithm/': getSideBarConfig('algorithm'),
    '/network/': getSideBarConfig('network'),
    '/system/': getSideBarConfig('system'),
    '/tools/': getSideBarConfig('tools'),
  },
  nav: [
    { text: '前端', link: '/frontend/' },
    { text: '服务端', link: '/backend/' },
    { text: 'Rust', link: '/rust/' },
    {
      text: '计算机基础',
      items: [
        { text: '数据结构/算法', link: '/algorithm/' },
        { text: '计算机网络', link: '/network/' },
        { text: '操作系统', link: '/system/' },
        { text: '开发工具', link: '/tools/' },
      ],
    },
  ],
};
