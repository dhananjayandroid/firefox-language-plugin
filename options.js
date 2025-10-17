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

// Load saved settings
function loadSettings() {
  browser.storage.sync.get(['openRouterApiKey', 'selectedModel'])
    .then((result) => {
      if (result.openRouterApiKey) {
        // Show masked API key or placeholder
        document.getElementById('apiKey').placeholder = 'API key saved (enter new to update)';
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
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
});
