import { createRouter, createWebHistory } from 'vue-router'
import { useDropboxAPI } from '../composables/useDropboxAPI'
import SetupPage from '../pages/SetupPage.vue'
import RecipeListPage from '../pages/RecipeListPage.vue'
import RecipeDetailPage from '../pages/RecipeDetailPage.vue'
import OAuthCallbackPage from '../pages/OAuthCallbackPage.vue'

const dropboxAPI = useDropboxAPI()
dropboxAPI.initializeFromStorage()

const routes = [
  { path: '/', redirect: '/recipes' },
  { path: '/setup', name: 'Setup', component: SetupPage },
  { path: '/recipes', name: 'RecipeList', component: RecipeListPage },
  { path: '/recipes/new', name: 'RecipeNew', component: RecipeDetailPage },
  {
    path: '/recipes/:mode',
    name: 'RecipeDetail',
    component: RecipeDetailPage,
    props: true,
    beforeEnter: (to, from, next) => {
      const allowedModes = ['view', 'edit']
      if (!allowedModes.includes(to.params.mode)) {
        return next({ name: 'RecipeList' })
      }
      return next()
    }
  },
  { path: '/oauth/callback', name: 'OAuthCallback', component: OAuthCallbackPage },
  { path: '/:pathMatch(.*)*', redirect: '/recipes' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
    console.log('Navigating to:', to.name)
  if (to.name === 'Setup' || to.name === 'OAuthCallback') {
    return next()
  }

  if (!dropboxAPI.getClientId()) {
    return next({ name: 'Setup' })
  }

  return next()
})

export default router
