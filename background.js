// Context menu creation
browser.contextMenus.create({
  id: "improve-text",
  title: "Improve Text",
  contexts: ["selection"]
});

browser.contextMenus.create({
  id: "correct-grammar",
  title: "Correct Grammar",
  contexts: ["selection"]
});

browser.contextMenus.create({
  id: "reword-text",
  title: "Reword Text",
  contexts: ["selection"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "improve-text" || 
      info.menuItemId === "correct-grammar" || 
      info.menuItemId === "reword-text") {
    
    // Send message to content script
    browser.tabs.sendMessage(tab.id, {
      action: info.menuItemId,
      selectedText: info.selectionText
    });
  }
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processText") {
    processWithOpenRouter(request.text, request.option)
      .then(result => sendResponse({ success: true, text: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Function to process text with OpenRouter AI
async function processWithOpenRouter(text, option) {
  const settings = await browser.storage.sync.get(['apiKey', 'model']);
  
  if (!settings.apiKey) {
    throw new Error('API key not configured. Please set it in extension settings.');
  }

  const model = settings.model || 'openai/gpt-3.5-turbo';
  
  // Define prompts based on the option
  const prompts = {
    'improve-text': `Improve the following text by making it more clear, concise, and professional. Only return the improved text without any explanations or additional commentary:\n\n${text}`,
    'correct-grammar': `Correct any grammar, spelling, and punctuation errors in the following text. Only return the corrected text without any explanations or additional commentary:\n\n${text}`,
    'reword-text': `Rewrite the following text using different words while maintaining the same meaning. Only return the reworded text without any explanations or additional commentary:\n\n${text}`
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompts[option]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
