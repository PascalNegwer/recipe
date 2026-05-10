<script setup>
const props = defineProps({ 
    icon: String
});
</script>

<template>
  <i :class="['fa-solid', props.icon]"></i>
</template>