// Context menu creation
console.log('[BACKGROUND] Creating context menus...');

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

console.log('[BACKGROUND] Context menus created');

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "improve-text" || 
      info.menuItemId === "correct-grammar") {
    
    console.log('[BACKGROUND] Context menu clicked:', info.menuItemId);
    
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
    console.log('[BACKGROUND] Received processText request from content script');
    console.log('[BACKGROUND] Processing option:', request.option);
    console.log('[BACKGROUND] Text length:', request.text.length);
    
    processWithOpenRouter(request.text, request.option)
      .then(result => {
        console.log('[BACKGROUND] Successfully processed text');
        sendResponse({ success: true, text: result });
      })
      .catch(error => {
        console.error('[BACKGROUND] Error processing text:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Function to process text with OpenRouter AI
async function processWithOpenRouter(text, option) {
  try {
    console.log('[BACKGROUND] Loading settings from storage...');
    
    // Use the correct storage keys that match options.js
    const settings = await browser.storage.sync.get(['openRouterApiKey', 'selectedModel']);
    
    console.log('[BACKGROUND] Settings loaded:');
    console.log('[BACKGROUND] - API key exists:', !!settings.openRouterApiKey);
    console.log('[BACKGROUND] - API key length:', settings.openRouterApiKey?.length || 0);
    console.log('[BACKGROUND] - API key (first 10 chars):', settings.openRouterApiKey?.substring(0, 10) + '...' || 'N/A');
    console.log('[BACKGROUND] - Selected model:', settings.selectedModel || 'Not set');
    
    if (!settings.openRouterApiKey) {
      console.error('[BACKGROUND] API key not found in storage!');
      throw new Error('API key not configured. Please set it in extension settings.');
    }
    
    const model = settings.selectedModel || 'openai/gpt-3.5-turbo';
    console.log('[BACKGROUND] Using model:', model);
    
    // Define creative prompts based on the option
    const prompts = {
      'improve-text': `Rewrite the following text to be clearer, more professional, and concise. Enhance readability and impact while preserving the original meaning. Output only the improved text without any explanations, quotes, or additional commentary:\n\n${text}`,
      'correct-grammar': `Correct the spelling, grammar, punctuation, and clarity of the following text. Fix any errors and improve sentence structure while maintaining the original tone and meaning. Output only the corrected version without any explanations, quotes, or additional commentary:\n\n${text}`
    };
    
    const prompt = prompts[option];
    if (!prompt) {
      console.error('[BACKGROUND] Invalid option:', option);
      throw new Error('Invalid option selected.');
    }
    
    console.log('[BACKGROUND] Making API request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/dhananjayandroid/firefox-language-plugin',
        'X-Title': 'Firefox Language Plugin'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional writing assistant. When given text to improve or correct, output only the refined text itself with no additional commentary, explanations, or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    console.log('[BACKGROUND] API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[BACKGROUND] API request failed:', response.status, response.statusText);
      console.error('[BACKGROUND] Error data:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }
    
    const data = await response.json();
    console.log('[BACKGROUND] API response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[BACKGROUND] Invalid response structure:', data);
      throw new Error('Invalid response from API.');
    }
    
    let improvedText = data.choices[0].message.content.trim();
    console.log('[BACKGROUND] Generated text length:', improvedText.length);
    
    // Remove surrounding quotes if present
    if ((improvedText.startsWith('"') && improvedText.endsWith('"')) ||
        (improvedText.startsWith("'") && improvedText.endsWith("'"))) {
      improvedText = improvedText.slice(1, -1);
      console.log('[BACKGROUND] Removed surrounding quotes from response');
    }
    
    return improvedText;
    
  } catch (error) {
    console.error('[BACKGROUND] OpenRouter API Error:', error);
    throw error;
  }
}

console.log('[BACKGROUND] Background script initialized');
