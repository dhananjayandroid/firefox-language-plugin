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

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "improve-text" || 
      info.menuItemId === "correct-grammar") {
    
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
  try {
    const settings = await browser.storage.sync.get(['apiKey', 'model']);
    
    if (!settings.apiKey) {
      throw new Error('API key not configured. Please set it in extension settings.');
    }
    
    const model = settings.model || 'openai/gpt-3.5-turbo';
    
    // Define creative prompts based on the option
    const prompts = {
      'improve-text': `Rewrite the following text to be clearer, more professional, and concise. Enhance readability and impact while preserving the original meaning. Output only the improved text without any explanations, quotes, or additional commentary:\n\n${text}`,
      'correct-grammar': `Correct the spelling, grammar, punctuation, and clarity of the following text. Fix any errors and improve sentence structure while maintaining the original tone and meaning. Output only the corrected version without any explanations, quotes, or additional commentary:\n\n${text}`
    };
    
    const prompt = prompts[option];
    if (!prompt) {
      throw new Error('Invalid option selected.');
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from API.');
    }
    
    let improvedText = data.choices[0].message.content.trim();
    
    // Remove surrounding quotes if present
    if ((improvedText.startsWith('"') && improvedText.endsWith('"')) ||
        (improvedText.startsWith("'") && improvedText.endsWith("'"))) {
      improvedText = improvedText.slice(1, -1);
    }
    
    return improvedText;
    
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
}
