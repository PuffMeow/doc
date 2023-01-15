import DefaultTheme from 'vitepress/theme';
import { EnhanceAppContext } from 'vitepress';

// @ts-ignore
import NotFound from './NotFound.vue';
// @ts-ignore
import Test from './Test.vue';

import './theme.css';

export default {
  ...DefaultTheme,
  NotFound,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
    // 用于挂载组件到全局 md 中的测试组件
    ctx.app.component('Test', Test);

    ctx.router.onAfterRouteChanged = (to: string) => {
      // 不记录本地的埋点数据
      if (
        typeof window !== 'undefined' &&
        !location.host.includes('localhost')
      ) {
        (window as any)?._hmt &&
          (window as any)?._hmt.push(['_trackPageview', to]);
      }
    };
  },
};
