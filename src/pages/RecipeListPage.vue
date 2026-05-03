<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useRecipeSearch } from '../composables/useRecipeSearch'
import { useDropboxAPI } from '../composables/useDropboxAPI'

const router = useRouter()
const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()
const searchQuery = ref('')
const { filteredRecipes } = useRecipeSearch(searchQuery)
const pageError = ref('')

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

function goToNewRecipe() {
  router.push({ name: 'RecipeNew' })
}

function viewRecipe(recipe) {
  router.push({ name: 'RecipeDetail', params: { mode: 'view' }, query: { path: recipe.path } })
}

function editRecipe(recipe) {
  router.push({ name: 'RecipeDetail', params: { mode: 'edit' }, query: { path: recipe.path } })
}

async function syncRecipes() {
  await store.syncWithDropbox(true)
}

function clearCache() {
  if (confirm('Soll der lokale Cache wirklich gelöscht werden um die Rezepte neu von Dropbox zu synchronisieren?')) {
    store.clearCache()
    syncRecipes()
  }
}

function goToSetup() {
  router.push({ name: 'Setup' })
}
</script>

<template>
  <div class="container">
    <div class="header">
      <img src="/logo.png" alt="Logo" width="100px" height="100px"/>
      <button @click="goToNewRecipe">+ Neu</button>
      <button @click="syncRecipes" :disabled="store.isSyncing">
        {{ store.isSyncing ? '⧖ Syncing...' : '⟳ Sync Dropbox' }}
      </button>
      <button @click="clearCache" class="cache-btn">🗑 Cache Löschen</button>
      <button @click="goToSetup" class="logout-btn">⚙ Setup</button>
    </div>

    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <section class="form-section">
      <div class="recipes-header">
        <h2>Alle Rezepte</h2>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Suche"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn">✕</button>
        </div>
      </div>

      <div v-if="store.recipes.length === 0" class="empty-state">
        <p>Keine Rezepte gefunden. Erstelle jetzt dein erstes Rezept.</p>
      </div>

      <div v-else class="recipes-list">
        <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card" @click="viewRecipe(recipe)">
          <div class="recipe-info">
            <div class="text-l">{{ recipe.name }}</div>
            <div v-if="recipe.tags?.length" class="recipe-tags">
              <span v-for="tag in recipe.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
