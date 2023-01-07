import DefaultTheme from 'vitepress/theme';

// @ts-ignore
import NotFound from './NotFound.vue';

import './theme.css';

export default {
  ...DefaultTheme,
  NotFound,
  enhanceApp({ app, router, siteData }) {},
};
