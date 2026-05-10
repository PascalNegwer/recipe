<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useRecipeSearch } from '../composables/useRecipeSearch'
import { useDropboxAPI } from '../composables/useDropboxAPI'
import FaIcon from '../components/FaIcon.vue'

const router = useRouter()
const store = useRecipeStore()
const searchQuery = ref('')
const { filteredRecipes } = useRecipeSearch(searchQuery)
const pageError = ref('')

</script>

<template>
  <div class="container">
    <div v-if="pageError" class="error-message">
      {{ pageError }}
    </div>

    <section class="form-section space-y-2">
      <div class="recipes-header">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full"
            placeholder="Suche"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn">✕</button>
        </div>
      </div>

      <div v-if="store.recipes.length === 0" class="empty-state">
        <p>Keine Rezepte gefunden. Erstelle jetzt dein erstes Rezept.</p>
      </div>

      <div v-else class="space-y-2">
        <RouterLink
          :to="{ name: 'RecipeDetail', params: { id: recipe.id } }"
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="rounded-md border-accent shadow-md border-l-4 p-2 w-full block"
        >
          <div class="text-l">{{ recipe.name }}</div>
          <div v-if="recipe.tags?.length" class="recipe-tags space-x-2">
            <span v-for="tag in recipe.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <div class="fixed bottom-0 left-0 p-4 w-full bg-footer">
      <RouterLink to="/recipes/new" class="btn btn-primary">
        <FaIcon icon="fa-plus"/>
        Neues Rezept
      </RouterLink>
    </div>
  </div>
</template>
