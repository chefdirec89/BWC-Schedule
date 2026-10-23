<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: notFound.value ? 'Not found, Bandung World Cinema 2026' : 'Something broke, Bandung World Cinema 2026' })
</script>

<template>
  <NuxtLayout>
    <div class="wrap pt-10 pb-24">
      <h1 class="text-display-s text-paper lg:text-display">
        {{ notFound ? 'No film at this address' : 'This page did not load' }}
      </h1>
      <p class="mt-4 max-w-[60ch] text-lg font-semibold">
        {{ notFound
          ? 'The link may point to a film that is not in the 2026 lineup.'
          : 'Something went wrong on our side. Your plan is safe in this browser.' }}
      </p>
      <div class="row__actions mt-6">
        <button type="button" class="btn" @click="clearError({ redirect: '/films' })">
          See all films
        </button>
        <button type="button" class="textlink" @click="clearError({ redirect: '/' })">
          Back to the schedule
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>
