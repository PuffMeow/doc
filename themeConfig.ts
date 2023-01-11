import { getSideBarConfig } from './utils';

export default {
  sidebar: {
    '/frontend/': getSideBarConfig('frontend'),
    '/backend/': getSideBarConfig('backend'),
    '/rust/': getSideBarConfig('rust'),
    '/algorithm/': getSideBarConfig('algorithm'),
    '/computer_base/': getSideBarConfig('computer_base'),
  },
  nav: [
    { text: '前端', link: '/frontend/' },
    { text: '服务端', link: '/backend/' },
    { text: 'Rust', link: '/rust/' },
    { text: '算法学习', link: '/algorithm/' },
    { text: '计算机基础', link: '/computer_base/' },
  ],
};
