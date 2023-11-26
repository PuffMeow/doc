import { defineConfig } from 'vitepress';
import navConfig from '../../navConfig';

// 配置地址:https://vitepress.vuejs.org/guide/configuration
export default defineConfig({
  title: 'PuffMeow',
  description: 'PuffMeow',
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
    [
      'script',
      {},
      `
      if(!location.hostname.includes("localhost")) {
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?4acff6ef41814431b9fd47af4b091072";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
      }
    `,
    ],
  ],
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    ...navConfig,
    outline: 'deep',
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },
    lastUpdatedText: '更新时间',
    siteTitle: '学习使我快乐',
    footer: {
      message: '每天进步一丢丢',
      copyright: `Copyright © ${new Date().getFullYear()} PuffMeow`,
    },
    docFooter: {
      prev: '👈瞧瞧上一篇',
      next: '瞅瞅下一篇👉',
    },
    logo: 'https://i.niupic.com/images/2023/01/06/aeYt.png',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/PuffMeow/doc',
      },
    ],
  },
});
