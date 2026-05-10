<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { matchedRouteKey, useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useDropboxAPI } from '../composables/useDropboxAPI'
import { QuillEditor } from '@vueup/vue-quill';
import FaIcon from '../components/FaIcon.vue';

const props = defineProps({
  id: String,
})

const route = useRoute()
const router = useRouter()
const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()

const recipe = ref(null)
const pageError = ref('')
const isLoading = ref(false)

async function loadRecipe() {
  pageError.value = ''

  if (!props.id || props.id === 'new ') {
    recipe.value = {
      portions: 1,
    }

    return
  }

  try {
    recipe.value = await store.loadRecipe(props.id)
  } catch (err) {
    pageError.value = err.message || 'Could not load recipe details.'
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
  
  await loadRecipe()  
})

async function deleteRecipe() {
  if (!confirm('Soll dieses Rezept wirklich gelöscht werden?')) {
    return
  }

  await store.deleteRecipe(recipe.value.id).then(() => router.replace({ name: 'RecipeList' }))
}

async function saveRecipe() {
  pageError.value = ''

  if (!recipe.value.name) {
    pageError.value = 'Der Name des Rezeptes darf nicht leer sein.'
    return
  }

  if (typeof recipe.value.tags === 'string') {
    recipe.value.tags = recipe.value.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

  isLoading.value = true

  try {
    if (!recipe.value.id) {
      recipe.value = await store.addRecipe(recipe.value)
    } else {
      recipe.value = await store.updateRecipe(recipe.value)
    }

    router.push({ name: 'RecipeDetail', params: { id: recipe.value.id }})
  } catch (err) {
    console.error(err)
    pageError.value = err.message || 'Could not save the recipe.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="recipe && !isLoading" class="container space-y-4">
    <div class="flex justify-between">
      <RouterLink to="/recipes" class="btn btn-primary">
        <FaIcon icon="fa-arrow-left"/>
      </RouterLink>
      <div class="flex space-x-2">
        <button v-if="id" class="btn btn-danger" @click="deleteRecipe(recipe)" title="Löschen">
          <FaIcon icon="fa-trash"/>
        </button>
      </div>
    </div>

    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <form
      @submit.prevent="saveRecipe"
      class="space-y-4"
    >
      <div>
        <label for="name">Name</label>
        <input id="name" class="w-full" v-model.trim="recipe.name" />
      </div>

      <div>
        <label for="portions">Für wie viele Portionen ist das Rezept ausgelegt?</label>
        <div class="flex gap-4">
          <button type="button" @click="recipe.portions = Math.max(recipe.portions - 1, 1)" class="btn btn-primary">
            <FaIcon icon="fa-minus"/>
          </button>
          <input
            id="portions"
            v-model.numer="recipe.portions"
            type="number"
            step="1"
            min="1"
            max="999"
            required
            class="flex-1"
          />
          <button type="button" @click="recipe.portions = Math.min(recipe.portions + 1, 999)" class="btn btn-primary">
            <FaIcon icon="fa-plus"/>
          </button>
        </div>
      </div>

      <label>Zutaten</label>
      <div
        v-for="(ingredient, index) in recipe.ingredients"
        :key="index"
        class="grid grid-cols-12 gap-4"
      >
        <input 
          v-model.trim="ingredient.name" 
          placeholder="zB Mehl" 
          class="col-span-12"
        />

        <div class="col-span-12 grid grid-cols-12 gap-4">
          <input 
            type="number" 
            v-model.number="ingredient.qty" 
            placeholder="1" 
            class="col-span-3"
          />
  
          <select
            v-model="ingredient.unit"
            class="col-span-6"
          >
            <option value="" disabled>-</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="piece">Stück</option>
            <option value="pinch">Priese</option>
            <option value="clove">Zehe</option>
            <option value="teaspoon">Teelöffel</option>
            <option value="tablespoon">Esslöffel</option>
          </select>
  
          <button 
            type="button"
            @click="recipe.ingredients.splice(index, 1)" 
            class="btn btn-danger col-span-3"
          >
            <FaIcon icon="fa-trash-can"/>
          </button>
        </div>

        <hr/>
      </div>
      <button type="button" class="w-full btn btn-primary" @click="recipe.ingredients.push({})">
        <FaIcon icon="fa-plus-circle"/> Zutat hinzufügen
      </button>

      <div class="form-group">
        <label for="instructions">Notizen</label>
        <QuillEditor v-model:content="recipe.instructions" contentType="html" theme="snow" />
      </div>

      <div class="form-group">
        <label for="tags">Tags (Mehrere mit Komma getrennt, z.B.: Brot, Kuchen, Pasta)</label>
        <input type="text" id="tags" class="w-full" v-model.text="recipe.tags" />
      </div>

      <div class="form-actions">
        <button class="btn btn-primary w-full" type="submit">
          <FaIcon icon="fa-save"/> Speichern
        </button>
      </div>
    </form>
  </div>
  <div v-else class="flex justify-center items-center h-80">
    <div class="loader"></div>
  </div>
</template>
