<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="ground">
    <a class="skip" href="#main">Skip to content</a>
    <SiteMasthead :full="route.path === '/'" />
    <SiteBand />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
