<template>
  <header class="site-header">
    <div class="shell header-inner">
      <a href="/" class="brand" aria-label="jary 图床首页">
        <span class="brand-mark"><ImageIcon aria-hidden="true" /></span>
        <span>jary 图床</span>
      </a>
      <nav class="navigation" aria-label="页内导航">
        <a href="#upload">上传图片</a>
        <a href="#history">上传记录</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ImageIcon } from '@radix-icons/vue'
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--site-border);
  background: #fff;
}

.header-inner {
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--site-ink);
  font-size: 17px;
  font-weight: 750;
  white-space: nowrap;
}

.brand-mark {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(145deg, #7771ec, #4e47c6);
  color: #fff;
  box-shadow: 0 2px 6px #574dc333;
}

.brand-mark svg {
  width: 19px;
  height: 19px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--site-muted);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.navigation a {
  padding: 7px 11px;
  border-radius: 7px;
}

.navigation a:hover {
  background: #f1f0fb;
  color: var(--site-accent);
}

@media (max-width: 425px) {
  .header-inner { min-height: 55px; }
  .navigation { gap: 2px; font-size: 12px; }
  .navigation a { padding: 7px 6px; }
}
</style>
