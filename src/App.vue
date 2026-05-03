<script setup>
import { useDropboxAPI } from './composables/useDropboxAPI'

const dropboxAPI = useDropboxAPI()
dropboxAPI.initializeFromStorage()
</script>

<template>
  <router-view />
</template>
