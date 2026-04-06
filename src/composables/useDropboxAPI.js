import { ref } from 'vue'
import { Dropbox } from 'dropbox'

const ACCESS_TOKEN = ref('')
const CLIENT_ID = ref('')
let dropboxClient = null

const REDIRECT_URI = window.location.origin + import.meta.env.BASE_URL + 'oauth/callback'

export function useDropboxAPI() {
  function initializeFromStorage() {
    const storedClientId = localStorage.getItem('dropbox_client_id')
    if (storedClientId) {
      CLIENT_ID.value = storedClientId
    }
  }

  function setClientId(id) {
    if (!id.trim()) {
      throw new Error('Client ID cannot be empty')
    }
    CLIENT_ID.value = id
    localStorage.setItem('dropbox_client_id', id)
  }

  function getClientId() {
    return CLIENT_ID.value
  }

  function clearClientId() {
    CLIENT_ID.value = ''
    localStorage.removeItem('dropbox_client_id')
  }
  function initializeClient(token) {
    ACCESS_TOKEN.value = token
    dropboxClient = new Dropbox({
      accessToken: token,
      fetch: window.fetch.bind(window)
    })
  }

  function setAccessToken(token) {
    initializeClient(token)
  }

  function getAccessToken() {
    return ACCESS_TOKEN.value
  }

  function isAuthenticated() {
    return !!ACCESS_TOKEN.value && !!dropboxClient
  }

  function authenticateWithDropbox(token) {
    setAccessToken(token)
  }

  // OAuth functions
  function generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  async function startOAuth() {
    if (!CLIENT_ID.value) {
      throw new Error('Client ID not set. Please configure your Dropbox App Key first.')
    }
    
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    sessionStorage.setItem('dropbox_code_verifier', codeVerifier)
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID.value,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: REDIRECT_URI,
      token_access_type : 'offline',
      scope: 'files.content.read files.content.write files.metadata.read',
      state: 'dropbox_oauth'
    })
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`
    window.location.href = authUrl
  }

  async function handleOAuthCallback(code) {
    const codeVerifier = sessionStorage.getItem('dropbox_code_verifier')
    if (!codeVerifier) {
      throw new Error('No code verifier found')
    }
    
    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: CLIENT_ID.value,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }
    
    const data = await response.json()
    const accessToken = data.access_token
    const expiresIn = data.expires_in
    const refreshToken = data.refresh_token
    
    sessionStorage.removeItem('dropbox_code_verifier')
    
    setAccessToken(accessToken)
    localStorage.setItem('dropbox_acess_token', accessToken)
    localStorage.setItem('dropbox_acess_token_expires_at', Date.now() + expiresIn * 1000)
    localStorage.setItem('dropbox_refresh_token', refreshToken)
    
    return accessToken
  }

  async function refreshToken() {
    const refreshTokenValue = localStorage.getItem('dropbox_refresh_token')
    if (!refreshTokenValue) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshTokenValue,
        client_id: CLIENT_ID.value
      })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    const accessToken = data.access_token
    const expiresIn = data.expires_in

    setAccessToken(accessToken)
    localStorage.setItem('dropbox_acess_token', accessToken)
    localStorage.setItem('dropbox_acess_token_expires_at', Date.now() + expiresIn * 1000)

    return accessToken
  }

  async function initializeAuth() {
    const accessToken = localStorage.getItem('dropbox_acess_token')
    const accessTokenExpiresAt = localStorage.getItem('dropbox_acess_token_expires_at')

    if (!accessToken || !accessTokenExpiresAt) {
      return false
    }

    const isExpired = Date.now() >= parseInt(accessTokenExpiresAt)
    if (!isExpired) {
      setAccessToken(accessToken)
      return true
    }

    try {
      await refreshToken()
      return true
    } catch (refreshError) {
      console.warn('Token refresh failed:', refreshError)
      localStorage.removeItem('dropbox_acess_token')
      localStorage.removeItem('dropbox_acess_token_expires_at')
      localStorage.removeItem('dropbox_refresh_token')
      return false
    }
  }

  async function ensureRecipesFolder() {
    try {
      await dropboxClient.filesCreateFolderV2({ path: '/recipes' })
    } catch (error) {
      if (!error.error?.error_summary?.includes('path/conflict/folder')) {
        console.warn('Folder creation attempt:', error)
      }
    }
  }

  async function parseRecipeFromFile(file) {
    try {
      const recipeData = await getRecipe(file.path_display)
      return {
        id: file.id,
        name: recipeData.name || file.name.replace('.json', ''),
        path: file.path_display,
        modifiedTime: file.server_modified,
        ingredients: recipeData.ingredients || '',
        instructions: recipeData.instructions || '',
        tags: recipeData.tags || [],
        created: recipeData.created || file.server_modified
      }
    } catch (error) {
      console.warn(`Failed to load recipe ${file.name}:`, error)
      return {
        id: file.id,
        name: file.name.replace('.json', ''),
        path: file.path_display,
        modifiedTime: file.server_modified,
        ingredients: '',
        instructions: '',
        tags: [],
        created: file.server_modified
      }
    }
  }

  async function listRecipes() {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }

    try {
      await ensureRecipesFolder()

      const response = await dropboxClient.filesListFolder({ path: '/recipes' })
      const jsonFiles = response.result.entries.filter(
        entry => entry.name.endsWith('.json') && entry['.tag'] === 'file'
      )

      const recipes = await Promise.all(jsonFiles.map(parseRecipeFromFile))
      return recipes
    } catch (error) {
      throw new Error(`Failed to list recipes: ${error.error?.error_summary || error.message}`)
    }
  }

  async function createRecipe(recipe) {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }

    const filename = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`
    const path = `/recipes/${filename}`

    try {
      const response = await dropboxClient.filesUpload({
        path,
        contents: JSON.stringify(recipe, null, 2),
        mode: { '.tag': 'add' },
        autorename: true,
        mute: false
      })
      return response.result.id
    } catch (error) {
      throw new Error(`Failed to create recipe: ${error.error?.error_summary || error.message}`)
    }
  }

  async function getRecipe(path) {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }

    try {
      const response = await dropboxClient.filesDownload({ path })
      const text = await response.result.fileBlob.text()
      return JSON.parse(text)
    } catch (error) {
      throw new Error(`Failed to get recipe: ${error.error?.error_summary || error.message}`)
    }
  }

  async function updateRecipe(path, recipeData) {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }

    try {
      const response = await dropboxClient.filesUpload({
        path,
        contents: JSON.stringify(recipeData, null, 2),
        mode: { '.tag': 'overwrite' },
        autorename: false,
        mute: false
      })
      return response.result.id
    } catch (error) {
      throw new Error(`Failed to update recipe: ${error.error?.error_summary || error.message}`)
    }
  }

  async function deleteRecipe(path) {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }

    try {
      await dropboxClient.filesDeleteV2({ path })
      return true
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error.error?.error_summary || error.message}`)
    }
  }

  return {
    setAccessToken,
    getAccessToken,
    isAuthenticated,
    listRecipes,
    createRecipe,
    getRecipe,
    updateRecipe,
    deleteRecipe,
    authenticateWithDropbox,
    startOAuth,
    handleOAuthCallback,
    refreshToken,
    initializeAuth,
    setClientId,
    getClientId,
    clearClientId,
    initializeFromStorage
  }
}
