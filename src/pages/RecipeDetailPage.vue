<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useDropboxAPI } from '../composables/useDropboxAPI'

const route = useRoute()
const router = useRouter()
const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()

const mode = computed(() => route.params.mode || 'new')
const recipePath = computed(() => route.query.path || '')
const recipeName = ref('')
const ingredients = ref('')
const instructions = ref('')
const tags = ref('')
const pageError = ref('')
const isLoading = ref(false)

const title = computed(() => {
  if (mode.value === 'new') return '➕ Create Recipe'
  if (mode.value === 'edit') return '✏️ Edit Recipe'
  return '📖 View Recipe'
})

const isViewMode = computed(() => mode.value === 'view')

function resetFields() {
  recipeName.value = ''
  ingredients.value = ''
  instructions.value = ''
  tags.value = ''
  pageError.value = ''
}

async function loadCurrentRecipe() {
  if (mode.value === 'new') {
    resetFields()
    return
  }

  if (!recipePath.value) {
    return router.replace({ name: 'RecipeList' })
  }

  isLoading.value = true
  pageError.value = ''

  try {
    const recipe = await store.loadRecipe(recipePath.value)
    if (recipe) {
      recipeName.value = recipe.name
      ingredients.value = recipe.ingredients || ''
      instructions.value = recipe.instructions || ''
      tags.value = recipe.tags?.join(', ') || ''
    }
  } catch (err) {
    pageError.value = err.message || 'Could not load recipe details.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  dropboxAPI.initializeFromStorage()

  if (!dropboxAPI.getClientId()) {
    return router.replace({ name: 'Setup' })
  }

  const authenticated = await dropboxAPI.initializeAuth()
  if (!authenticated) {
    pageError.value = 'Please authorize Dropbox from the setup page before using recipes.'
  }

  await store.initializeStore()
  await loadCurrentRecipe()
})

watch([mode, recipePath], async () => {
  if (!store.recipes.length) {
    return
  }

  await loadCurrentRecipe()
})

async function saveRecipe() {
  pageError.value = ''

  if (!recipeName.value.trim()) {
    pageError.value = 'Recipe name is required.'
    return
  }

  const tagList = tags.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  isLoading.value = true

  try {
    if (mode.value === 'new') {
      await store.addRecipe(recipeName.value, ingredients.value, instructions.value, tagList)
    } else if (mode.value === 'edit') {
      await store.updateRecipe(recipePath.value, {
        name: recipeName.value,
        ingredients: ingredients.value,
        instructions: instructions.value,
        tags: tagList
      })
    }

    router.push({ name: 'RecipeList' })
  } catch (err) {
    pageError.value = err.message || 'Could not save the recipe.'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push({ name: 'RecipeList' })
}

function switchToEdit() {
  router.push({ name: 'RecipeDetail', params: { mode: 'edit' }, query: { path: recipePath.value } })
}
</script>

<template>
  <div class="container">
    <h1>{{ title }}</h1>

    <div class="header">
      <button @click="goBack">← Back to recipes</button>
      <button v-if="mode === 'view'" @click="switchToEdit">✏️ Edit Recipe</button>
    </div>

    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <section class="form-section" v-if="mode === 'new' || mode === 'edit' || mode === 'view'">
      <form @submit.prevent="saveRecipe">
        <div class="form-group">
          <label for="name">Recipe Name</label>
          <input id="name" v-model="recipeName" :disabled="isViewMode" />
        </div>

        <div class="form-group">
          <label for="ingredients">Ingredients</label>
          <textarea id="ingredients" v-model="ingredients" rows="6" :disabled="isViewMode"></textarea>
        </div>

        <div class="form-group">
          <label for="instructions">Instructions</label>
          <textarea id="instructions" v-model="instructions" rows="6" :disabled="isViewMode"></textarea>
        </div>

        <div class="form-group">
          <label for="tags">Tags (comma-separated)</label>
          <input id="tags" v-model="tags" :disabled="isViewMode" />
        </div>

        <div class="form-actions" v-if="!isViewMode">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? '⏳ Saving...' : (mode === 'new' ? '💾 Create Recipe' : '💾 Update Recipe') }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
