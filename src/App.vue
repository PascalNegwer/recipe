<script setup>
import { ref, onMounted } from 'vue'
import { useRecipeStore } from './stores/recipes'
import { useDropboxAPI } from './composables/useDropboxAPI'
import { useRecipeSearch } from './composables/useRecipeSearch'

const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()
const searchQuery = ref('')
const { filteredRecipes } = useRecipeSearch(searchQuery)
const appOrigin = window.location.href + import.meta.env.BASE_URL

// Auth state
const isSignedIn = ref(false)
const showClientIdInput = ref(true)
const clientIdInput = ref('')

// Form state
const recipeName = ref('')
const ingredients = ref('')
const instructions = ref('')
const tags = ref('')

const editingRecipe = ref(null)

onMounted(async () => {
  dropboxAPI.initializeFromStorage()
  
  if (dropboxAPI.getClientId()) {
    showClientIdInput.value = false
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  
  if (code && state === 'dropbox_oauth') {
    try {
      await dropboxAPI.handleOAuthCallback(code)
      isSignedIn.value = true
      window.history.replaceState({}, document.title, window.location.pathname)
      await store.initializeStore()
    } catch (err) {
      alert(`OAuth failed: ${err.message}`)
      console.error('OAuth error:', err)
    }
  } else {
    const authSuccess = await dropboxAPI.initializeAuth()
    isSignedIn.value = authSuccess
    await store.initializeStore()
  }
})

function setClientId() {
  if (!clientIdInput.value.trim()) {
    alert('Please enter your Dropbox App Key')
    return
  }
  
  try {
    dropboxAPI.setClientId(clientIdInput.value)
    showClientIdInput.value = false
    clientIdInput.value = ''
  } catch (err) {
    alert(`Error: ${err.message}`)
  }
}

async function startOAuth() {
  try {
    await dropboxAPI.startOAuth()
  } catch (err) {
    alert(`Failed to start OAuth: ${err.message}`)
    console.error('OAuth start error:', err)
  }
}

function logout() {
  isSignedIn.value = false
  localStorage.removeItem('dropbox_acess_token')
  store.clearCache()
}

function resetClientId() {
  dropboxAPI.clearClientId()
  showClientIdInput.value = true
  isSignedIn.value = false
  localStorage.removeItem('dropbox_acess_token')
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

async function saveRecipe() {
  if (!recipeName.value.trim()) {
    alert('Recipe name is required')
    return
  }

  const recipeTags = tags.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  let result
  if (editingRecipe.value) {
    result = await store.updateRecipe(editingRecipe.value.path, {
      name: recipeName.value,
      ingredients: ingredients.value,
      instructions: instructions.value,
      tags: recipeTags
    })
  } else {
    result = await store.addRecipe(
      recipeName.value,
      ingredients.value,
      instructions.value,
      recipeTags
    )
  }

  if (result) {
    resetForm()
    alert(editingRecipe.value ? 'Recipe updated successfully!' : 'Recipe saved successfully!')
  }
}

function resetForm() {
  recipeName.value = ''
  ingredients.value = ''
  instructions.value = ''
  tags.value = ''
  editingRecipe.value = null
}

async function loadRecipe(file) {
  const recipe = await store.loadRecipe(file.path)
  
  if (recipe) {
    recipeName.value = recipe.name
    ingredients.value = recipe.ingredients
    instructions.value = recipe.instructions
    tags.value = recipe.tags ? recipe.tags.join(', ') : ''
    editingRecipe.value = file
  }
}

async function deleteRecipeItem(fileId) {
  if (confirm('Are you sure you want to delete this recipe?')) {
    await store.deleteRecipe(fileId)
  }
}

function cancelEdit() {
  resetForm()
}
</script>

<template>
  <div class="container">
    <h1>🍳 Recipe Manager with Dropbox</h1>
    
    <!-- Client ID Setup -->
    <div v-if="showClientIdInput" class="auth-section">
      <h2>Setup Dropbox App Key</h2>
      <p>To use this app, you need to provide your Dropbox App Key.</p>
      <ol>
        <li>Visit <a href="https://www.dropbox.com/developers/apps" target="_blank">Dropbox Developers</a></li>
        <li>Create a new app (Scoped App, Full Dropbox)</li>
        <li>Set redirect URI to: <code>{{ appOrigin }}oauth/callback</code></li>
        <li>In Permissions tab, enable: files.content.read, files.content.write, files.metadata.read</li>
        <li>Copy your App Key from the Settings tab</li>
      </ol>
      <div style="margin-top: 20px;">
        <input 
          v-model="clientIdInput" 
          type="text" 
          placeholder="Paste your Dropbox App Key here"
          @keyup.enter="setClientId"
        >
        <button @click="setClientId">Save App Key</button>
      </div>
    </div>
    
    <!-- Authentication -->
    <div v-else-if="!isSignedIn" class="auth-section">
      <h2>Connect to Dropbox</h2>
      <p>Click the button below to authorize this app with your Dropbox account.</p>
      <div style="margin-top: 20px;">
        <button @click="startOAuth">Connect to Dropbox</button>
        <button @click="resetClientId" class="reset-btn">Change App Key</button>
      </div>
    </div>
    
    <!-- Main App -->
    <div v-else class="main-content">
      <div class="header">
        <button @click="logout" class="logout-btn">Logout</button>
        <button @click="syncRecipes" :disabled="store.isSyncing">
          {{ store.isSyncing ? '⏳ Syncing...' : '🔄 Sync with Dropbox' }}
        </button>
        <button @click="clearCache" class="cache-btn">🗑️ Clear Cache</button>
        <span v-if="store.isCacheValid" class="cache-status">✓ Using cached data</span>
      </div>
      
      <!-- Error Display -->
      <div v-if="store.error" class="error-message">
        ⚠️ {{ store.error }}
      </div>
      
      <!-- Add Recipe Form -->
      <section class="form-section">
        <h2>{{ editingRecipe ? '✏️ Edit Recipe' : '➕ Add Recipe' }}</h2>
        <form @submit.prevent="saveRecipe">
          <div class="form-group">
            <label for="name">Recipe Name:</label>
            <input 
              id="name"
              v-model="recipeName" 
              required 
              placeholder="e.g., Chocolate Chip Cookies"
            >
          </div>
          <div class="form-group">
            <label for="ingredients">Ingredients:</label>
            <textarea 
              id="ingredients"
              v-model="ingredients" 
              rows="6"
              placeholder="List ingredients here..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="instructions">Instructions:</label>
            <textarea 
              id="instructions"
              v-model="instructions" 
              rows="6"
              placeholder="Step-by-step instructions..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="tags">Tags (comma-separated):</label>
            <input 
              id="tags"
              v-model="tags" 
              type="text"
              placeholder="e.g., vegetarian, quick, italian, dessert"
            >
            <small class="form-help">Separate multiple tags with commas</small>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="store.isLoading">
              {{ store.isLoading ? '⏳ Saving...' : (editingRecipe ? '💾 Update Recipe' : '💾 Save Recipe') }}
            </button>
            <button v-if="editingRecipe" type="button" @click="cancelEdit" class="cancel-btn">
              ❌ Cancel Edit
            </button>
          </div>
        </form>
      </section>
      
      <!-- Recipes List -->
      <section class="recipes-section">
        <div class="recipes-header">
          <h2>📚 Your Recipes ({{ filteredRecipes.length }}{{ searchQuery ? ` of ${store.recipes.length}` : '' }})</h2>
          <div class="search-container">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="🔍 Search recipes..."
              class="search-input"
            >
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          </div>
        </div>
        <div v-if="store.recipes.length === 0" class="empty-state">
          <p>No recipes yet. Create one above! 👇</p>
        </div>
        <div v-else-if="filteredRecipes.length === 0 && searchQuery" class="empty-state">
          <p>No recipes match "{{ searchQuery }}"</p>
          <button @click="searchQuery = ''" class="clear-search-link">Clear search</button>
        </div>
        <div v-else class="recipes-list">
          <div 
            v-for="recipe in filteredRecipes" 
            :key="recipe.id"
            class="recipe-card"
          >
            <div class="recipe-info">
              <h3>{{ recipe.name }}</h3>
              <div v-if="recipe.tags && recipe.tags.length > 0" class="recipe-tags">
                <span 
                  v-for="tag in recipe.tags" 
                  :key="tag"
                  class="tag"
                  @click="searchQuery = tag"
                >
                  #{{ tag }}
                </span>
              </div>
              <p class="recipe-date">Modified: {{ new Date(recipe.modifiedTime).toLocaleDateString() }}</p>
            </div>
            <div class="recipe-actions">
              <button @click="loadRecipe(recipe)" class="btn-load">Load</button>
              <button @click="deleteRecipeItem(recipe.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
}

h2 {
  color: #555;
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

/* Auth Section */
.auth-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 10px;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-section h2 {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  margin-top: 0;
}

.auth-section p {
  font-size: 0.95em;
  line-height: 1.6;
  margin-bottom: 10px;
}

.auth-section ol {
  margin-left: 20px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.auth-section a {
  color: #ffd700;
  text-decoration: none;
  font-weight: bold;
}

.auth-section a:hover {
  text-decoration: underline;
}

.auth-section input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
}

.auth-section button {
  width: 100%;
  padding: 12px;
  background: #ffd700;
  color: #333;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-section button:hover {
  background: #ffed4e;
}

.auth-section code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  word-break: break-all;
}

.auth-section .reset-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #95a5a6;
  color: white;
  font-size: 0.95em;
}

.auth-section .reset-btn:hover {
  background: #7f8c8d;
}

/* Main Content */
.main-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.header button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.logout-btn {
  background: #ff6b6b;
  color: white;
}

.logout-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.header button:not(.logout-btn) {
  background: #667eea;
  color: white;
}

.header button:not(.logout-btn):hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.cache-btn {
  background: #ff9800 !important;
}

.cache-btn:hover {
  background: #f57c00 !important;
}

.header button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cache-status {
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9em;
}

/* Error Message */
.error-message {
  background: #ffe6e6;
  color: #d32f2f;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
}

/* Form Section */
.form-section {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1em;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.85em;
  font-style: italic;
}

.form-section button {
  background: #27ae60;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.form-section button:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.form-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.form-actions button {
  flex: 1;
  min-width: 120px;
}

.cancel-btn {
  background: #95a5a6 !important;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d !important;
}

/* Recipes Section */
.recipes-section {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.recipes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.recipes-header h2 {
  margin: 0;
  color: #555;
  font-size: 1.5em;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  flex: 1;
  min-width: 200px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 250px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-search-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

.clear-search-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9em;
  margin-top: 10px;
}

.clear-search-link:hover {
  color: #5568d3;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 1.1em;
}

.recipes-list {
  display: grid;
  gap: 15px;
}

.recipe-card {
  background: white;
  padding: 20px;
  border-radius: 5px;
  border-left: 4px solid #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.recipe-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.recipe-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.recipe-tags {
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tag:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.recipe-date {
  margin: 5px 0 0 0;
  color: #999;
  font-size: 0.85em;
}

.recipe-actions {
  display: flex;
  gap: 10px;
}

.btn-load,
.btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

.btn-load {
  background: #667eea;
  color: white;
}

.btn-load:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-delete {
  background: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.2em;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header button {
    width: 100%;
  }

  .recipes-header {
    flex-direction: column;
    align-items: stretch;
  }

  .recipes-header h2 {
    min-width: unset;
    text-align: center;
  }

  .search-container {
    min-width: unset;
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .recipe-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .recipe-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .btn-load,
  .btn-delete {
    flex: 1;
  }
}
</style>