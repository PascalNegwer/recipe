import { ref } from 'vue'
import { Dropbox } from 'dropbox'

const ACCESS_TOKEN = ref('')
const CLIENT_ID = ref('')
let dropboxClient = null

const REDIRECT_URI = window.location.origin + import.meta.env.BASE_URL + 'oauth/callback'

const STORAGE_KEYS = {
  CLIENT_ID: 'dropbox_client_id',
  ACCESS_TOKEN: 'dropbox_access_token',
  TOKEN_EXPIRES_AT: 'dropbox_access_token_expires_at',
  REFRESH_TOKEN: 'dropbox_refresh_token',
  CODE_VERIFIER: 'dropbox_code_verifier'
}

const DROPBOX_API_BASE = 'https://api.dropboxapi.com/oauth2'
const DROPBOX_AUTH_BASE = 'https://www.dropbox.com/oauth2'

export function useDropboxAPI() {
  function initializeFromStorage() {
    const storedClientId = localStorage.getItem(STORAGE_KEYS.CLIENT_ID)
    if (storedClientId) {
      CLIENT_ID.value = storedClientId
    }
  }

  function setClientId(id) {
    if (!id.trim()) {
      throw new Error('Client ID cannot be empty')
    }
    CLIENT_ID.value = id
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, id)
  }

  function getClientId() {
    return CLIENT_ID.value
  }

  function clearClientId() {
    CLIENT_ID.value = ''
    localStorage.removeItem(STORAGE_KEYS.CLIENT_ID)
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

  function checkDropboxClient() {
    if (!dropboxClient) {
      throw new Error('Dropbox client not initialized. Please authenticate first.')
    }
  }

  function getErrorMessage(error) {
    return error.error?.error_summary || error.message
  }

  function toUrlSafeBase64(base64String) {
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // OAuth functions
  function generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return toUrlSafeBase64(btoa(String.fromCharCode.apply(null, array)))
  }

  async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    return toUrlSafeBase64(base64)
  }

  async function startOAuth() {
    if (!CLIENT_ID.value) {
      throw new Error('Client ID not set. Please configure your Dropbox App Key first.')
    }

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID.value,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: REDIRECT_URI,
      token_access_type: 'offline',
      scope: 'files.content.read files.content.write files.metadata.read',
      state: 'dropbox_oauth'
    })

    window.location.href = `${DROPBOX_AUTH_BASE}/authorize?${params.toString()}`
  }

  async function exchangeCodeForToken(code, codeVerifier) {
    const response = await fetch(`${DROPBOX_API_BASE}/token`, {
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

    return response.json()
  }

  async function handleOAuthCallback(code) {
    const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER)
    if (!codeVerifier) {
      throw new Error('No code verifier found')
    }

    const data = await exchangeCodeForToken(code, codeVerifier)
    const { access_token: accessToken, expires_in: expiresIn, refresh_token: refreshToken } = data

    sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER)
    setAccessToken(accessToken)
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, Date.now() + expiresIn * 1000)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)

    return accessToken
  }

  async function refreshToken() {
    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!refreshTokenValue) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${DROPBOX_API_BASE}/token`, {
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
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, Date.now() + expiresIn * 1000)

    return accessToken
  }

  async function initializeAuth() {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const accessTokenExpiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)

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
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
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

  function createRecipeObject(file, recipeData) {
    return {
      id: file.id,
      name: recipeData?.name || file.name.replace('.json', ''),
      path: file.path_display,
      modifiedTime: file.server_modified,
      ingredients: recipeData?.ingredients || '',
      instructions: recipeData?.instructions || '',
      tags: recipeData?.tags || [],
      created: recipeData?.created || file.server_modified
    }
  }

  async function parseRecipeFromFile(file) {
    try {
      const recipeData = await getRecipe(file.path_display)
      return createRecipeObject(file, recipeData)
    } catch (error) {
      console.warn(`Failed to load recipe ${file.name}:`, error)
      return createRecipeObject(file, null)
    }
  }

  async function listRecipes() {
    checkDropboxClient()

    try {
      await ensureRecipesFolder()

      const response = await dropboxClient.filesListFolder({ path: '/recipes' })
      const jsonFiles = response.result.entries.filter(
        entry => entry.name.endsWith('.json') && entry['.tag'] === 'file'
      )

      return await Promise.all(jsonFiles.map(parseRecipeFromFile))
    } catch (error) {
      throw new Error(`Failed to list recipes: ${getErrorMessage(error)}`)
    }
  }

  async function createRecipe(recipe) {
    checkDropboxClient()

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
      throw new Error(`Failed to create recipe: ${getErrorMessage(error)}`)
    }
  }

  async function getRecipe(path) {
    checkDropboxClient()

    try {
      const response = await dropboxClient.filesDownload({ path })
      const text = await response.result.fileBlob.text()
      return JSON.parse(text)
    } catch (error) {
      throw new Error(`Failed to get recipe: ${getErrorMessage(error)}`)
    }
  }

  async function updateRecipe(path, recipeData) {
    checkDropboxClient()

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
      throw new Error(`Failed to update recipe: ${getErrorMessage(error)}`)
    }
  }

  async function deleteRecipe(path) {
    checkDropboxClient()

    try {
      await dropboxClient.filesDeleteV2({ path })
      return true
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${getErrorMessage(error)}`)
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
