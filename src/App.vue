<script setup>
import { useDropboxAPI } from './composables/useDropboxAPI'

const dropboxAPI = useDropboxAPI()
dropboxAPI.initializeFromStorage()
</script>

<template>
  <div class="container">
    <router-view />
  </div>
</template>

<style>
:root {
  --primary: #5a9acc;
  --primary-dark: #4a7fb5;
  --accent: #7cb9e8;
  --success: #4cab9a;
  --danger: #c9605b;
  --warning: #d9956f;
  --bg-dark: #3d4f62;
  --bg-darker: #2d3e4f;
  --text-light: #e8eef5;
  --text-muted: #b0c0d0;
}

html {
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
  min-height: 100vh;
}

body {
  background: transparent;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-light);
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;
}

.app-nav a {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
  border: 2px solid transparent;
  padding: 8px 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.app-nav a.router-link-active,
.app-nav a:hover {
  border-color: transparent;
  background: rgba(90, 154, 172, 0.2);
}

h1 {
  color: var(--text-light);
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

h2 {
  color: var(--accent);
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(124, 185, 232, 0.3);
  padding-bottom: 10px;
}

/* Auth Section */
.auth-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 40px;
  border-radius: 10px;
  color: var(--text-light);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.auth-section h2 {
  color: var(--text-light);
  border-color: rgba(255, 255, 255, 0.2);
  margin-top: 0;
}

.auth-section p {
  font-size: 0.95em;
  line-height: 1.6;
  margin-bottom: 10px;
  color: rgba(232, 238, 245, 0.9);
}

.auth-section ol {
  margin-left: 20px;
  line-height: 1.8;
  margin-bottom: 20px;
  color: rgba(232, 238, 245, 0.9);
}

.auth-section a {
  color: #ffd700;
  text-decoration: none;
  font-weight: bold;
}

.auth-section a:hover {
  text-decoration: underline;
}

.auth-section input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.auth-section button {
  width: 100%;
  padding: 12px;
  background: #c9a96e;
  color: #2d3e4f;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-section button:hover {
  background: #d4b583;
}

.auth-section code {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  word-break: break-all;
}

.auth-section .reset-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #6b7880;
  color: var(--text-light);
  font-size: 0.95em;
}

.auth-section .reset-btn:hover {
  background: #7a8890;
}

/* Main Content */
.main-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.header button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.logout-btn {
  background: #6b5b5a;
  color: var(--text-light);
}

.logout-btn:hover {
  background: #78696a;
  transform: translateY(-2px);
}

.header button:not(.logout-btn) {
  background: #5a7a8f;
  color: white;
}

.header button:not(.logout-btn):hover:not(:disabled) {
  background: #667a8a;
  transform: translateY(-2px);
}

.cache-btn {
  background: #7a6e5f !important;
}

.cache-btn:hover {
  background: #8a7e6f !important;
}

.header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cache-status {
  color: var(--success);
  font-weight: 600;
  font-size: 0.9em;
}

/* Error Message */
.error-message {
  background: rgba(201, 96, 91, 0.2);
  color: #ff9d9a;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  border-left: 4px solid var(--danger);
}

/* Form Section */
.form-section {
  background: rgba(45, 62, 79, 0.6);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid rgba(124, 185, 232, 0.2);
  backdrop-filter: blur(5px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--accent);
  font-size: 0.95em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(124, 185, 232, 0.3);
  border-radius: 5px;
  font-family: inherit;
  font-size: 1em;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(90, 154, 172, 0.2);
}

.form-help {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.85em;
  font-style: italic;
}

.form-section button {
  background: #5a7a8f;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.form-section button:hover:not(:disabled) {
  background: #667a8a;
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.form-actions button {
  flex: 1;
  min-width: 120px;
}

.cancel-btn {
  background: #6b7880 !important;
  color: white;
}

.cancel-btn:hover {
  background: #7a8890 !important;
  color: white;
}

/* Recipes Section */
.recipes-section {
  background: rgba(45, 62, 79, 0.6);
  padding: 25px;
  border-radius: 8px;
  border: 1px solid rgba(124, 185, 232, 0.2);
  backdrop-filter: blur(5px);
}

.recipes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.recipes-header h2 {
  margin: 0;
  color: var(--accent);
  font-size: 1.5em;
  border-bottom: 2px solid rgba(124, 185, 232, 0.3);
  padding-bottom: 10px;
  flex: 1;
  min-width: 200px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 250px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid rgba(124, 185, 232, 0.3);
  border-radius: 25px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(90, 154, 172, 0.2);
}

.clear-search-btn {
  background: #6b5b5a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-search-btn:hover {
  background: #78696a;
  transform: scale(1.1);
}

.clear-search-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9em;
  margin-top: 10px;
}

.clear-search-link:hover {
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 1.1em;
}

.recipes-list {
  display: grid;
  gap: 15px;
}

.recipe-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 5px;
  border-left: 4px solid var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.recipe-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.recipe-info h3 {
  margin: 0;
  color: var(--text-light);
  font-size: 1.2em;
}

.recipe-tags {
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: var(--primary);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tag:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.recipe-date {
  margin: 5px 0 0 0;
  color: var(--text-muted);
  font-size: 0.85em;
}

.recipe-actions {
  display: flex;
  gap: 10px;
}

.btn-load,
.btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

.btn-load {
  background: #5a7a8f;
  color: white;
}

.btn-load:hover {
  background: #667a8a;
  transform: translateY(-1px);
}

.btn-delete {
  background: #6b5b5a;
  color: white;
}

.btn-delete:hover {
  background: #78696a;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.2em;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header button {
    width: 100%;
  }

  .recipes-header {
    flex-direction: column;
    align-items: stretch;
  }

  .recipes-header h2 {
    min-width: unset;
    text-align: center;
  }

  .search-container {
    min-width: unset;
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .recipe-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .recipe-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .btn-load,
  .btn-delete {
    flex: 1;
  }
}
</style>