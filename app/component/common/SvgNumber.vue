<template>
  <svg
    :class="svgClass"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      v-if="showCircle"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
    />
    <text
      x="12"
      y="16"
      text-anchor="middle"
      :class="textClass"
      fill="currentColor"
    >
      {{ number }}
    </text>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  number: number | string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCircle?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCircle: false,
  customClass: ''
})

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

const svgClass = computed(() => [
  sizeClasses[props.size],
  'flex-shrink-0',
  props.customClass
].filter(Boolean).join(' '))

const textClass = computed(() => [
  textSizes[props.size],
  'font-medium'
].join(' '))
</script> 