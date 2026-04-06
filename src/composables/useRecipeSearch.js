import { computed } from 'vue'
import { useRecipeStore } from '../stores/recipes'

export function useRecipeSearch(searchQuery) {
  const store = useRecipeStore()

  const filteredRecipes = computed(() => {
    if (!searchQuery.value.trim()) {
      return store.recipes
    }
    
    const query = searchQuery.value.toLowerCase().trim()
    return store.recipes.filter(recipe => {
      // Search in recipe name
      const nameMatch = recipe.name.toLowerCase().includes(query)
      
      // Search in tags
      const tagsMatch = recipe.tags && recipe.tags.some(tag => 
        tag.toLowerCase().includes(query)
      )
      
      return nameMatch || tagsMatch
    })
  })

  return {
    filteredRecipes
  }
}
