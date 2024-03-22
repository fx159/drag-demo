<script setup lang='ts'>
import { Button as VButton } from 'vant'
</script>

<template>
  <VButton v-bind="$attrs" type="primary" size="small">
    <slot>123</slot>
  </VButton>
</template>
