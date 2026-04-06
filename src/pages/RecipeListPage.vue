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

async function deleteRecipe(recipe) {
  if (!confirm('Delete this recipe permanently?')) {
    return
  }

  await store.deleteRecipe(recipe.path)
}

async function syncRecipes() {
  await store.syncWithDropbox(true)
}

function clearCache() {
  if (confirm('Clear local cache and reload recipes from Dropbox?')) {
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
    <h1>Recipe Library</h1>

    <div class="header">
      <button @click="goToNewRecipe">➕ New Recipe</button>
      <button @click="syncRecipes" :disabled="store.isSyncing">
        {{ store.isSyncing ? '⏳ Syncing...' : '🔄 Sync Dropbox' }}
      </button>
      <button @click="clearCache" class="cache-btn">🗑️ Clear Cache</button>
      <button @click="goToSetup" class="logout-btn">⚙️ Setup</button>
    </div>

    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <section class="form-section">
      <div class="recipes-header">
        <h2>All Recipes</h2>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search recipes by name or tag"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn">✕</button>
        </div>
      </div>

      <div v-if="store.recipes.length === 0" class="empty-state">
        <p>No recipes found. Create one to get started.</p>
      </div>

      <div v-else class="recipes-list">
        <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-info">
            <h3>{{ recipe.name }}</h3>
            <div v-if="recipe.tags?.length" class="recipe-tags">
              <span v-for="tag in recipe.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
            <p class="recipe-date">Modified: {{ new Date(recipe.modifiedTime).toLocaleString() }}</p>
          </div>
          <div class="recipe-actions">
            <button @click="viewRecipe(recipe)" class="btn-load">View</button>
            <button @click="editRecipe(recipe)" class="btn-load">Edit</button>
            <button @click="deleteRecipe(recipe)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
