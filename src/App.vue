<script setup>
import { onMounted, ref } from 'vue'
import { useDropboxAPI } from './composables/useDropboxAPI'
import { useRecipeStore } from './stores/recipes'

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
  <div class="grid grid-cols-3 mt-4 mb-2 container">
    <div></div>
    <div class="justify-self-center">
      <h1 class="self-center">{{ $route.meta.nameDe }}</h1>
    </div>

    <div class="justify-self-end content-center">
      <button
        @click="open = !open"
        class="p-2 pl-4"
      >
        {{ open ? 'X' : '[|||]' }}
      </button>
    </div>
  </div>

  <div class="relative h-full">
    <nav
      v-if="open" class="absolute z-10 inset-0 bg-darker" 
      @click="open = false"
    >
      <RouterLink
        class="block cursor-pointer no-underline text-light m-4"
        to="/recipes"
      >
        Rezepte
      </RouterLink>
      <RouterLink
        class="block cursor-pointer no-underline text-light m-4"
        to="/setup"
      >
        Setup
      </RouterLink>
      <button
        class="block cursor-pointer no-underline text-light m-4"
        @click="syncRecipes" :disabled="store.isSyncing"
      >
        {{ store.isSyncing ? '⧖ Syncing...' : '⟳ Sync Dropbox' }}
      </button>
      <button
        class="block cursor-pointer no-underline text-light m-4"
        @click="clearCache"
      >
        🗑 Cache Löschen
      </button>
    </nav>
    <router-view />
  </div>
</template>
