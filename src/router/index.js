import { createRouter, createWebHistory } from 'vue-router'
import { useDropboxAPI } from '../composables/useDropboxAPI'
import SetupPage from '../pages/SetupPage.vue'
import RecipeListPage from '../pages/RecipeListPage.vue'
import RecipeDetailPage from '../pages/RecipeDetailPage.vue'
import OAuthCallbackPage from '../pages/OAuthCallbackPage.vue'
import RecipeEditPage from '../pages/RecipeEditPage.vue'
import NotesPage from '../pages/NotesPage.vue'

const dropboxAPI = useDropboxAPI()
dropboxAPI.initializeFromStorage()

const routes = [
  { path: '/', redirect: '/recipes' },
  { path: '/setup', name: 'Setup', component: SetupPage, meta: {nameDe: 'Setup'} },
  { 
    path: '/recipes',
    meta: {nameDe: 'Rezepte'},
    children: [
      { path: '', name: 'RecipeList', component: RecipeListPage },
      { path: 'new', name: 'RecipeNew', component: RecipeEditPage },
      { path: ':id', name: 'RecipeDetail', component: RecipeDetailPage, props: true },
      { path: ':id/edit', name: 'RecipeEdit', component: RecipeEditPage, props: true },
    ] 
  },
  { path: '/notes', name: 'Notes', component: NotesPage, meta: {nameDe: 'Notizen'} },
  { path: '/oauth/callback', name: 'OAuthCallback', component: OAuthCallbackPage },
  { path: '/:pathMatch(.*)*', redirect: '/recipes' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'Setup' || to.name === 'OAuthCallback') {
    return next()
  }

  if (!dropboxAPI.getClientId()) {
    return next({ name: 'Setup' })
  }

  return next()
})

export default router
