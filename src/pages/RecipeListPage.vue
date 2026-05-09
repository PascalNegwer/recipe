<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipes'
import { useRecipeSearch } from '../composables/useRecipeSearch'
import { useDropboxAPI } from '../composables/useDropboxAPI'

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

    <section class="form-section">
      <div class="recipes-header">
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
        <RouterLink
          :to="{ name: 'RecipeDetail', params: { id: recipe.id } }"
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="recipe-card"
        >
          <div class="text-l">{{ recipe.name }}</div>
          <div v-if="recipe.tags?.length" class="recipe-tags">
            <span v-for="tag in recipe.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
