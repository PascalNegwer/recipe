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
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;
}

.app-nav a {
  color: #667eea;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid transparent;
  padding: 8px 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.app-nav a.router-link-active,
.app-nav a:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
}

h2 {
  color: #555;
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

/* Auth Section */
.auth-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 10px;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-section h2 {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  margin-top: 0;
}

.auth-section p {
  font-size: 0.95em;
  line-height: 1.6;
  margin-bottom: 10px;
}

.auth-section ol {
  margin-left: 20px;
  line-height: 1.8;
  margin-bottom: 20px;
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
}

.auth-section button {
  width: 100%;
  padding: 12px;
  background: #ffd700;
  color: #333;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-section button:hover {
  background: #ffed4e;
}

.auth-section code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  word-break: break-all;
}

.auth-section .reset-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #95a5a6;
  color: white;
  font-size: 0.95em;
}

.auth-section .reset-btn:hover {
  background: #7f8c8d;
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
  background: #ff6b6b;
  color: white;
}

.logout-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.header button:not(.logout-btn) {
  background: #667eea;
  color: white;
}

.header button:not(.logout-btn):hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.cache-btn {
  background: #ff9800 !important;
}

.cache-btn:hover {
  background: #f57c00 !important;
}

.header button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cache-status {
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9em;
}

/* Error Message */
.error-message {
  background: #ffe6e6;
  color: #d32f2f;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
}

/* Form Section */
.form-section {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1em;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.85em;
  font-style: italic;
}

.form-section button {
  background: #27ae60;
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
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
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
  background: #95a5a6 !important;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d !important;
}

/* Recipes Section */
.recipes-section {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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
  color: #555;
  font-size: 1.5em;
  border-bottom: 2px solid #ddd;
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
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  background: #ff6b6b;
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
  background: #ff5252;
  transform: scale(1.1);
}

.clear-search-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9em;
  margin-top: 10px;
}

.clear-search-link:hover {
  color: #5568d3;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 1.1em;
}

.recipes-list {
  display: grid;
  gap: 15px;
}

.recipe-card {
  background: white;
  padding: 20px;
  border-radius: 5px;
  border-left: 4px solid #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.recipe-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.recipe-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.recipe-tags {
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #667eea;
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
  background: #5568d3;
  transform: translateY(-1px);
}

.recipe-date {
  margin: 5px 0 0 0;
  color: #999;
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
  background: #667eea;
  color: white;
}

.btn-load:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-delete {
  background: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background: #ff5252;
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