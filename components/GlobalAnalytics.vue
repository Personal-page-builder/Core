<template>
  <div v-if="googleAnalyticsId">
    <!-- Google Analytics 4 -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id={{ googleAnalyticsId }}"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{{ googleAnalyticsId }}', {
        debug_mode: {{ googleAnalyticsDebug ? 'true' : 'false' }},
        page_title: document.title,
        page_location: window.location.href
      });
    </script>
  </div>

  <!-- Яндекс.Метрика -->
  <div v-if="yandexMetrikaId">
    <!-- Yandex Metrika -->
    <script type="text/javascript">
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym({{ yandexMetrikaId }}, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: {{ yandexMetrikaWebvisor ? 'true' : 'false' }},
        hash: {{ yandexMetrikaHash ? 'true' : 'false' }}
      });
    </script>
    <noscript>
      <div>
        <img src="https://mc.yandex.ru/watch/{{ yandexMetrikaId }}" style="position:absolute; left:-9999px;" alt="" />
      </div>
    </noscript>
  </div>
</template>

<script setup lang="ts">
// Расширяем типы для глобальных функций аналитики
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    ym: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

// Получаем значения из переменных окружения
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID
const googleAnalyticsDebug = process.env.GOOGLE_ANALYTICS_DEBUG === 'true'
const yandexMetrikaId = process.env.YANDEX_METRIKA_ID
const yandexMetrikaWebvisor = process.env.YANDEX_METRIKA_WEBVISOR === 'true'
const yandexMetrikaHash = process.env.YANDEX_METRIKA_HASH === 'true'
</script>

<style scoped>
/* Скрываем noscript элемент */
div > div {
  display: none;
}
</style> 