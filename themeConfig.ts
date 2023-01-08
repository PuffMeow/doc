import { getSideBarConfig } from './utils';

export default {
  sidebar: {
    '/frontend/': getSideBarConfig('frontend'),
    '/backend/': getSideBarConfig('backend'),
    '/rust/': getSideBarConfig('rust'),
    '/algorithm/': getSideBarConfig('algorithm'),
  },
  nav: [
    { text: '前端', link: '/frontend/' },
    { text: '服务端', link: '/backend/' },
    { text: 'Rust', link: '/rust/' },
    { text: '算法学习', link: '/algorithm/' },
  ],
};
