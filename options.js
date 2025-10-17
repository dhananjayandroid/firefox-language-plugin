// options.js - Settings page script for Language Plugin

// Save settings to browser.storage
function saveSettings(e) {
  e.preventDefault();
  
  const apiKey = document.getElementById('apiKey').value;
  const model = document.getElementById('model').value;
  const statusDiv = document.getElementById('status');
  
  // Validate inputs
  if (!apiKey || !model) {
    showStatus('Please fill in all fields', 'error');
    return;
  }
  
  // Save to browser storage
  browser.storage.sync.set({
    openRouterApiKey: apiKey,
    selectedModel: model
  }).then(() => {
    showStatus('Settings saved successfully!', 'success');
    // Clear the API key field for security (user can re-enter if needed)
    setTimeout(() => {
      document.getElementById('apiKey').value = '';
    }, 1500);
  }).catch((error) => {
    showStatus('Error saving settings: ' + error.message, 'error');
  });
}

// Fetch available models from OpenRouter.ai API
async function fetchModels(apiKey) {
  try {
    showStatus('Fetching available models...', 'info');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data; // OpenRouter API returns models in data.data array
  } catch (error) {
    console.error('Error fetching models:', error);
    showStatus('Error fetching models: ' + error.message, 'error');
    return [];
  }
}

// Populate model dropdown with fetched models
function populateModelDropdown(models) {
  const modelSelect = document.getElementById('model');
  
  // Clear existing options except the first placeholder
  while (modelSelect.children.length > 1) {
    modelSelect.removeChild(modelSelect.lastChild);
  }
  
  // Add new model options
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${model.id} - ${model.name || model.id}`;
    modelSelect.appendChild(option);
  });
  
  // Enable the dropdown
  modelSelect.disabled = false;
  showStatus('Models loaded successfully!', 'success');
}

// Handle API key input and fetch models
function handleApiKeyInput() {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  
  apiKeyInput.addEventListener('blur', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (apiKey && apiKey.length > 10) { // Basic validation for API key
      const models = await fetchModels(apiKey);
      if (models && models.length > 0) {
        populateModelDropdown(models);
      } else {
        showStatus('No models found or invalid API key', 'error');
        modelSelect.disabled = true;
      }
    } else {
      // Clear model dropdown if no valid API key
      const modelSelect = document.getElementById('model');
      while (modelSelect.children.length > 1) {
        modelSelect.removeChild(modelSelect.lastChild);
      }
      modelSelect.disabled = true;
    }
  });
}

// Load saved settings
function loadSettings() {
  browser.storage.sync.get(['openRouterApiKey', 'selectedModel'])
    .then(async (result) => {
      if (result.openRouterApiKey) {
        // Show masked API key or placeholder
        document.getElementById('apiKey').placeholder = 'API key saved (enter new to update)';
        
        // Fetch and populate models with saved API key
        const models = await fetchModels(result.openRouterApiKey);
        if (models && models.length > 0) {
          populateModelDropdown(models);
        }
      }
      if (result.selectedModel) {
        document.getElementById('model').value = result.selectedModel;
      }
    })
    .catch((error) => {
      console.error('Error loading settings:', error);
    });
}

// Display status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status show ' + type;
  
  // Auto-hide after 3 seconds for success/info messages
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  handleApiKeyInput();
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
});
