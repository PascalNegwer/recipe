<script setup>
import { onMounted, ref } from 'vue'
import { useDropboxAPI } from './composables/useDropboxAPI'
import { useRecipeStore } from './stores/recipes'
import FaIcon from './components/FaIcon.vue'

const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()
const open = ref(false)

onMounted(async () => {
  dropboxAPI.initializeFromStorage()

  if (!dropboxAPI.getClientId()) {
    return router.replace({ name: 'Setup' })
  }

  const authenticated = await dropboxAPI.initializeAuth()
  if (!authenticated) {
    pageError.value = 'You are not yet connected to Dropbox. Please authorize the app from the setup page.'
  }

  await store.initializeStore()
})

async function syncRecipes() {
  await store.syncWithDropbox(true)
}

function clearCache() {
  if (confirm('Soll der lokale Cache wirklich gelöscht werden um die Daten neu von Dropbox zu synchronisieren?')) {
    store.clearCache()
    syncRecipes()
  }
}
</script>

<template>
  <div class="fixed z-10 w-full bg-header">
    <div class="grid grid-cols-3 pt-4 pb-2 container">
      <div></div>
      <div class="justify-self-center">
        <h1 class="self-center">{{ $route.meta.nameDe }}</h1>
      </div>
  
      <div class="justify-self-end content-center">
        <button
          @click="open = !open"
          class="p-2 pl-4"
        >
          <span v-if="open">
            <FaIcon icon="fa-x"/>
          </span>
          <span v-else>
            <FaIcon icon="fa-bars"/>
          </span>
        </button>
      </div>
    </div>
    <nav
      v-if="open" class="h-[100vh] bg-darker" 
      @click="open = false"
    >
      <RouterLink
        class="block cursor-pointer no-underline text-light p-4"
        to="/recipes"
      >
        Rezepte
      </RouterLink>
      <RouterLink
        class="block cursor-pointer no-underline text-light p-4"
        to="/setup"
      >
        Setup
      </RouterLink>
      <button
        class="block cursor-pointer no-underline text-light p-4"
        @click.stop="syncRecipes" :disabled="store.isSyncing"
      >
        <span v-if="store.isSyncing">
          <FaIcon icon="fa-hourglass"/>
          Synchronisiert...
        </span>
        <span v-else>
          <FaIcon icon="fa-rotate"/>
          Sync Dropbox
        </span>
      </button>
      <button
        class="block cursor-pointer no-underline text-light p-4"
        @click.stop="clearCache"
      >
        <FaIcon icon="fa-trash"/> Cache Löschen
      </button>
    </nav>
  </div>

  <div class="pt-[56px]">
    <router-view />
  </div>
</template>
