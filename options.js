// options.js - Settings page script for Language Plugin

// Default models list (used when API key is not available or fetch fails)
const DEFAULT_MODELS = [
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'anthropic/claude-2', name: 'Claude 2' },
  { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B' },
  { id: 'google/palm-2-chat-bison', name: 'PaLM 2' }
];

// Save settings to browser.storage
function saveSettings(e) {
  e.preventDefault();
  
  const apiKey = document.getElementById('apiKey').value;
  const model = document.getElementById('model').value;
  
  // Validate inputs
  if (!apiKey || !model) {
    showStatus('Please fill in all fields', 'error');
    return;
  }
  
  // Save to browser storage - save both separately
  browser.storage.sync.set({
    openRouterApiKey: apiKey,
    selectedModel: model
  }).then(() => {
    showStatus('Settings saved successfully!', 'success');
    // DO NOT clear the API key field - keep it visible for user confirmation
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
    showStatus('Could not fetch models from API. Using default list.', 'info');
    return null; // Return null to indicate fetch failed
  }
}

// Populate model dropdown with models
function populateModelDropdown(models) {
  const modelSelect = document.getElementById('model');
  
  // Clear existing options except the first placeholder
  while (modelSelect.children.length > 1) {
    modelSelect.removeChild(modelSelect.lastChild);
  }
  
  // Add model options
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${model.id}${model.name ? ' - ' + model.name : ''}`;
    modelSelect.appendChild(option);
  });
  
  // Always enable the dropdown
  modelSelect.disabled = false;
}

// Handle API key input and fetch models
function handleApiKeyInput() {
  const apiKeyInput = document.getElementById('apiKey');
  const fetchButton = document.createElement('button');
  fetchButton.textContent = 'Fetch Models';
  fetchButton.type = 'button';
  fetchButton.id = 'fetchModelsBtn';
  
  // Add fetch button after API key input if not already present
  if (!document.getElementById('fetchModelsBtn')) {
    apiKeyInput.parentElement.appendChild(fetchButton);
  }
  
  // Handle fetch models button click
  document.getElementById('fetchModelsBtn').addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (apiKey && apiKey.length > 10) { // Basic validation for API key
      const models = await fetchModels(apiKey);
      if (models && models.length > 0) {
        populateModelDropdown(models);
        showStatus('Models loaded from API!', 'success');
      } else {
        // Use default models if fetch fails
        populateModelDropdown(DEFAULT_MODELS);
      }
    } else {
      showStatus('Please enter a valid API key', 'error');
    }
  });
}

// Load saved settings
function loadSettings() {
  // First, populate with default models so dropdown is always usable
  populateModelDropdown(DEFAULT_MODELS);
  
  browser.storage.sync.get(['openRouterApiKey', 'selectedModel'])
    .then(async (result) => {
      if (result.openRouterApiKey) {
        // Pre-fill the API key (not masked, but actually filled)
        document.getElementById('apiKey').value = result.openRouterApiKey;
        
        // Try to fetch and populate models with saved API key
        const models = await fetchModels(result.openRouterApiKey);
        if (models && models.length > 0) {
          populateModelDropdown(models);
        }
        // If fetch fails, default models are already populated
      }
      if (result.selectedModel) {
        // Set the selected model value
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
