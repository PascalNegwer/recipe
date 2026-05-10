<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useDropboxAPI } from '../composables/useDropboxAPI'
import FaIcon from '../components/FaIcon.vue'

const props = defineProps({
  id: String,
})

const router = useRouter()
const store = useRecipeStore()
const dropboxAPI = useDropboxAPI()

const recipe = ref(null)
const pageError = ref('')

async function loadRecipe() {
  pageError.value = ''

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
</script>

<template>
  <div v-if="recipe" class="container space-y-4">
    <div class="flex justify-between">
      <RouterLink to="/recipes" class="btn btn-primary">
        <FaIcon icon="fa-arrow-left"/>
      </RouterLink>
      <div class="flex space-x-2">
        <RouterLink 
          :to="{ name: 'RecipeEdit', params: { id: recipe.id } }"
          class="btn btn-primary"
        >
          <FaIcon icon="fa-pencil"/>
        </RouterLink>
        <button class="btn btn-primary" @click="deleteRecipe(recipe)" title="Löschen">
          <FaIcon icon="fa-trash"/>
        </button>
      </div>
    </div>

    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <div class="flex justify-between">
      <h2>{{ recipe.name }}</h2>
      <div>Für {{ recipe.portions }} Portionen</div>
    </div>

    <table class="w-full">
      <tbody>
        <tr v-for="(ingredient, index) in recipe.ingredients" :key="index">
          <td>{{ingredient.name}}</td>
          <td class="w-[50px] text-right pr-2">{{ingredient.qty}}</td>
          <td class="w-[50px]">{{ingredient.unit}}</td>
        </tr>
      </tbody>
    </table>

    <div>
      <h2>Notizen</h2>
      <div class="text-wrap" v-html="recipe.instructions"></div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-80">
    <div class="loader"></div>
  </div>
</template>
