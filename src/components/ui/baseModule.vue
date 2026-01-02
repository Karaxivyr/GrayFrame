<template>
  <section
    class="mod"
    :class="[
      {
        'mod--v': orientation === 'vertical',
        'mod--h': orientation === 'horizontal',
      },
      { 'mod--readonly': readonly },
    ]"
  >
    <header class="mod__header">
      <div class="mod__title">
        <slot name="icon" />
        <span>{{ title }}</span>
        <span v-if="subtitle" class="mod__meta">{{ subtitle }}</span>
      </div>

      <!-- Hide actions section entirely when readonly -->
      <div v-if="!readonly" class="mod__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="mod__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="mod__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    orientation?: "vertical" | "horizontal";
    readonly?: boolean;
  }>(),
  {
    orientation: "vertical",
    readonly: false,
  }
);
</script>
