<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDropboxAPI } from '../composables/useDropboxAPI'

const route = useRoute()
const router = useRouter()
const dropboxAPI = useDropboxAPI()
const statusMessage = ref('Completing Dropbox authorization...')
const errorMessage = ref('')

onMounted(async () => {
  dropboxAPI.initializeFromStorage()

  const code = route.query.code
  const state = route.query.state

  if (!code || state !== 'dropbox_oauth') {
    errorMessage.value = 'Invalid OAuth callback parameters.'
    statusMessage.value = ''
    return
  }

  try {
    await dropboxAPI.handleOAuthCallback(code)
    router.replace({ name: 'RecipeList' })
  } catch (err) {
    statusMessage.value = ''
    errorMessage.value = err.message || 'Dropbox authorization failed.'
  }
})
</script>

<template>
  <div class="container">
    <h1>Dropbox Authorization</h1>

    <section class="form-section">
      <p v-if="statusMessage">{{ statusMessage }}</p>
      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>
      <p v-if="errorMessage">
        Please return to the <router-link to="/setup">setup page</router-link> and try again.
      </p>
    </section>
  </div>
</template>
