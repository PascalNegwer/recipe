<script setup>
import { ref, onMounted } from 'vue'
import { useDropboxAPI } from '../composables/useDropboxAPI'

const dropboxAPI = useDropboxAPI()
const clientIdInput = ref('')
const currentClientId = ref('')
const isSignedIn = ref(false)
const errorMessage = ref('')
const appOrigin = window.location.origin + import.meta.env.BASE_URL

onMounted(async () => {
  dropboxAPI.initializeFromStorage()
  currentClientId.value = dropboxAPI.getClientId() || ''
})

function saveClientId() {
  errorMessage.value = ''

  if (!clientIdInput.value.trim()) {
    errorMessage.value = 'Please enter your Dropbox App Key.'
    return
  }

  try {
    dropboxAPI.setClientId(clientIdInput.value.trim())
    currentClientId.value = dropboxAPI.getClientId()
    clientIdInput.value = ''
  } catch (err) {
    errorMessage.value = err.message || 'Could not save the Dropbox App Key.'
  }
}

async function connectDropbox() {
  if (!currentClientId.value) {
    errorMessage.value = 'Please add a Dropbox App Key before authorizing.'
    return
  }

  errorMessage.value = ''

  try {
    await dropboxAPI.startOAuth()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to start Dropbox authorization.'
  }
}

function resetClientId() {
  dropboxAPI.clearClientId()
  currentClientId.value = ''
  isSignedIn.value = false
  localStorage.removeItem('dropbox_acess_token')
  localStorage.removeItem('dropbox_acess_token_expires_at')
  localStorage.removeItem('dropbox_refresh_token')
}
</script>

<template>
  <div class="container">
    <h1>Dropbox Setup</h1>

    <section class="auth-section">
      <h2>Step 1: Configure your Dropbox App Key</h2>
      <p>
        To use the recipe manager, add your Dropbox App Key and then authorize the app.
      </p>
      <ol>
        <li>Open <a href="https://www.dropbox.com/developers/apps" target="_blank">Dropbox Developers</a>.</li>
        <li>Create a new app with <strong>Scoped App</strong> and <strong>Full Dropbox</strong> access.</li>
        <li>Set the redirect URI to:</li>
        <code>{{ appOrigin }}oauth/callback</code>
        <li>Enable these scopes: <strong>files.content.read</strong>, <strong>files.content.write</strong>, <strong>files.metadata.read</strong>.</li>
      </ol>

      <div class="form-group">
        <label for="client-id">Dropbox App Key</label>
        <input
          id="client-id"
          type="text"
          v-model="clientIdInput"
          placeholder="Paste your Dropbox App Key here"
          @keyup.enter="saveClientId"
        />
      </div>
      <button @click="saveClientId">Save Dropbox App Key</button>

      <div v-if="currentClientId" class="saved-info">
        <p>
          <strong>Dropbox App Key saved.</strong>
        </p>
        <button @click="connectDropbox">Authorize Dropbox</button>
        <button @click="resetClientId" class="cancel-btn">Reset App Key</button>
      </div>

      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>
    </section>
  </div>
</template>
