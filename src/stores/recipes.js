import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDropboxAPI } from '../composables/useDropboxAPI'

const CACHE_KEY = 'recipes_cache'
const CACHE_VERSION = 2
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const FULL_SYNC_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

export const useRecipeStore = defineStore('recipes', () => {
  const dropbox = useDropboxAPI()

  const recipes = ref([])
  const lastSyncTime = ref(null)
  const lastFullSyncTime = ref(null)
  const isSyncing = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  const isCacheValid = computed(() => {
    if (!lastSyncTime.value) return false
    return Date.now() - lastSyncTime.value < CACHE_DURATION
  })

  // Save recipes to localStorage
  function saveToLocalStorage() {
    try {
      const cacheData = {
        data: recipes.value,
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (err) {
      console.warn('Failed to save to localStorage:', err)
    }
  }

  // Load recipes from localStorage
  function loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return false

      const cacheData = JSON.parse(cached)
      
      // Invalidate cache if version changed
      if (cacheData.version !== CACHE_VERSION) {
        localStorage.removeItem(CACHE_KEY)
        return false
      }

      recipes.value = cacheData.data
      lastSyncTime.value = cacheData.timestamp
      return true
    } catch (err) {
      console.warn('Failed to load from localStorage:', err)
      return false
    }
  }

  // Initialize store - load from cache and sync if authenticated
  async function initializeStore() {
    loadFromLocalStorage()

    // Only sync if authenticated (auth handled elsewhere)
    if (dropbox.isAuthenticated()) {
      await syncWithDropbox()
    }
  }

  // Check if full sync is needed
  function isFullSyncNeeded() {
    if (!lastFullSyncTime.value) return true
    return Date.now() - lastFullSyncTime.value > FULL_SYNC_INTERVAL
  }

  // Sync all recipes from Dropbox (once per day or forced)
  async function syncWithDropbox(force = false) {
    // Skip if sync not needed and not forced
    if (!force && !isFullSyncNeeded() && recipes.value.length > 0) {
      return recipes.value
    }

    if (isSyncing.value) return recipes.value

    isSyncing.value = true
    error.value = null

    try {
      const files = await dropbox.listRecipes()
      recipes.value = files
      lastSyncTime.value = Date.now()
      lastFullSyncTime.value = Date.now()
      saveToLocalStorage()
      return files
    } catch (err) {
      error.value = `Failed to sync recipes: ${err.message}`
      console.error('Sync error:', err)
      return recipes.value
    } finally {
      isSyncing.value = false
    }
  }

  // Sync a single recipe from Dropbox (for immediate updates)
  async function syncSingleRecipe(path) {
    isLoading.value = true
    error.value = null

    try {
      const recipeData = await dropbox.getRecipe(path)
      
      // Find and update in local array
      const index = recipes.value.findIndex(r => r.path === path)
      if (index >= 0) {
        recipes.value[index] = { ...recipes.value[index], ...recipeData }
        saveToLocalStorage()
      }
      
      return recipeData
    } catch (err) {
      error.value = `Failed to sync recipe: ${err.message}`
      console.error('Sync error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Save a new recipe to Dropbox
  async function addRecipe(recipeName, ingredients, instructions, tags = []) {
    if (!recipeName.trim()) {
      error.value = 'Recipe name is required'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const recipe = {
        name: recipeName,
        ingredients,
        instructions,
        tags: tags.filter(tag => tag.trim().length > 0),
        created: new Date().toISOString()
      }

      const fileId = await dropbox.createRecipe(recipe)
      
      // Invalidate cache and sync all recipes (new file added)
      lastSyncTime.value = null
      lastFullSyncTime.value = null
      await syncWithDropbox(true)
      
      return fileId
    } catch (err) {
      error.value = `Failed to save recipe: ${err.message}`
      console.error('Save error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Load a specific recipe (and sync it)
  async function loadRecipe(fileId) {
    isLoading.value = true
    error.value = null

    try {
      const recipe = await dropbox.getRecipe(fileId)
      
      // Update in local array
      const index = recipes.value.findIndex(r => r.path === fileId)
      if (index >= 0) {
        recipes.value[index] = { ...recipes.value[index], ...recipe }
        saveToLocalStorage()
      }
      
      return recipe
    } catch (err) {
      error.value = `Failed to load recipe: ${err.message}`
      console.error('Load error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update an existing recipe
  async function updateRecipe(path, recipeData) {
    if (!dropbox) {
      throw new Error('Dropbox not initialized')
    }

    isLoading.value = true
    error.value = null

    try {
      // Get existing recipe data to preserve created date
      const existingRecipe = await dropbox.getRecipe(path)
      
      // Merge with updated data
      const updatedRecipe = {
        ...existingRecipe,
        ...recipeData,
        created: existingRecipe.created,
        modified: new Date().toISOString()
      }

      // Update the file in Dropbox
      const result = await dropbox.updateRecipe(path, updatedRecipe)
      
      // Sync only this recipe immediately
      await syncSingleRecipe(path)
      
      return result
    } catch (err) {
      error.value = `Failed to update recipe: ${err.message}`
      console.error('Update error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Delete a recipe
  async function deleteRecipe(fileId) {
    isLoading.value = true
    error.value = null

    try {
      await dropbox.deleteRecipe(fileId)
      
      // Remove from local state
      recipes.value = recipes.value.filter(r => r.id !== fileId)
      
      // Invalidate cache and full sync (file list changed)
      lastSyncTime.value = null
      lastFullSyncTime.value = null
      
      // Save updated state
      saveToLocalStorage()
      
      return true
    } catch (err) {
      error.value = `Failed to delete recipe: ${err.message}`
      console.error('Delete error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Clear all local cache
  function clearCache() {
    recipes.value = []
    lastSyncTime.value = null
    lastFullSyncTime.value = null
    localStorage.removeItem(CACHE_KEY)
  }

  return {
    // State
    recipes,
    lastSyncTime,
    lastFullSyncTime,
    isSyncing,
    isLoading,
    error,
    
    // Computed
    isCacheValid,
    
    // Methods
    initializeStore,
    syncWithDropbox,
    syncSingleRecipe,
    isFullSyncNeeded,
    addRecipe,
    updateRecipe,
    loadRecipe,
    deleteRecipe,
    clearCache,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
