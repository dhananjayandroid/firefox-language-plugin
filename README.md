# Firefox Language Plugin

A Firefox extension that enhances your writing by rewording or improving selected text using OpenRouter.ai API. Works like Grammarly to provide grammar correction and text improvement directly in your browser.

https://addons.mozilla.org/en-US/firefox/addon/language-improver/

## Features

- **Context Menu Integration**: Right-click on selected text to access language improvement options
- **Grammar Correction**: Fix grammar, punctuation, and spelling errors instantly
- **Text Improvement**: Enhance clarity, tone, and style of your writing
- **OpenRouter.ai Integration**: Leverages powerful AI models through OpenRouter.ai API
- **Customizable Model Selection**: Choose your preferred AI model for processing
- **In-Place Text Replacement**: Automatically replaces selected text with improved version
- **Privacy-Focused**: Only processes text you explicitly select

## Installation

### Option 1: Install from Firefox Add-ons (Coming Soon)

1. Visit the Firefox Add-ons page (link will be added once published)
2. Click "Add to Firefox"
3. Confirm the installation when prompted

### Option 2: Load as Temporary Extension (For Development/Testing)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/dhananjayandroid/firefox-language-plugin.git
   ```

2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

3. Click "Load Temporary Add-on"

4. Navigate to the extension directory and select the `manifest.json` file

5. The extension will now be loaded and active until you restart Firefox

### Option 3: Install as Permanent Development Extension

1. Package the extension as a `.xpi` file or use `web-ext` tool:
   ```bash
   npm install -g web-ext
   cd firefox-language-plugin
   web-ext build
   ```

2. In Firefox, go to `about:config` and set `xpinstall.signatures.required` to `false` (Developer Edition/Nightly only)

3. Install the generated `.xpi` file

## Setup

### Configure OpenRouter.ai API Key and Model

1. **Get your OpenRouter.ai API Key**:
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up or log in to your account
   - Navigate to your account settings/API keys section
   - Generate a new API key and copy it

2. **Configure the Extension**:
   - Click the extension icon in your Firefox toolbar
   - Or go to `about:addons`, find "Firefox Language Plugin", and click "Preferences"
   - Enter your OpenRouter.ai API key in the "API Key" field

3. **Select Your Preferred Model**:
   - In the extension settings, choose from available models:
     - `openai/gpt-4` - Best quality, higher cost
     - `openai/gpt-3.5-turbo` - Fast and cost-effective
     - `anthropic/claude-3-opus` - Excellent for creative writing
     - `anthropic/claude-3-sonnet` - Balanced performance
     - `google/gemini-pro` - Good for technical content
     - Or any other model supported by OpenRouter.ai

4. **Save Settings**: Click "Save" to store your configuration

## Usage

### Using the Improve Function

1. **Select Text**: Highlight any text on a webpage that you want to improve

2. **Right-Click**: Open the context menu on the selected text

3. **Choose "Improve Text"**: Select this option from the context menu

4. **Wait for Processing**: The extension will:
   - Send your text to OpenRouter.ai with the improve prompt
   - Receive the enhanced version
   - Automatically replace the selected text with the improved version

5. **Review Changes**: Check the updated text and make any final adjustments if needed

### Using the Grammar Correction Function

1. **Select Text**: Highlight any text on a webpage that needs grammar checking

2. **Right-Click**: Open the context menu on the selected text

3. **Choose "Correct Grammar"**: Select this option from the context menu

4. **Wait for Processing**: The extension will:
   - Send your text to OpenRouter.ai with the grammar correction prompt
   - Receive the corrected version
   - Automatically replace the selected text with the grammatically correct version

5. **Review Changes**: Verify the corrections applied to your text

## Sample Prompts

The extension uses carefully crafted prompts to ensure optimal results:

### Improve Text Prompt

```
You are a professional writing assistant. Improve the following text by enhancing clarity, style, tone, and readability. Make it more engaging and professional while preserving the original meaning and intent. Return ONLY the improved text without any explanations, introductions, or additional commentary.

Text to improve:
{selected_text}

Improved text:
```

**What it does:**
- Enhances vocabulary and word choice
- Improves sentence structure and flow
- Makes text more concise and impactful
- Adjusts tone for professionalism
- Maintains the original message and context

### Grammar Correction Prompt

```
You are an expert grammar checker. Correct all grammar, spelling, punctuation, and syntax errors in the following text. Maintain the original meaning, style, and tone. Return ONLY the corrected text without any explanations, notes, or additional commentary.

Text to correct:
{selected_text}

Corrected text:
```

**What it does:**
- Fixes spelling mistakes
- Corrects grammatical errors
- Adjusts punctuation placement
- Fixes verb tense consistency
- Corrects subject-verb agreement
- Maintains original writing style

## Troubleshooting FAQ

### Q: The context menu options don't appear when I right-click on selected text

**A:** Try the following:
- Ensure the extension is properly installed and enabled in `about:addons`
- Reload the webpage (Ctrl+R or Cmd+R)
- Check if you have other extensions that might conflict with context menus
- Verify you've selected text before right-clicking

### Q: I get an "API Key Invalid" or "Authentication Failed" error

**A:** 
- Double-check that you've entered the correct API key in settings
- Ensure there are no extra spaces before or after the API key
- Verify your OpenRouter.ai account is active and has available credits
- Try generating a new API key from OpenRouter.ai dashboard

### Q: The text replacement doesn't work or nothing happens

**A:**
- Check your browser console for error messages (F12 → Console tab)
- Verify the selected text is in an editable field (textarea, input, contenteditable)
- Some websites use complex editors that may block automatic text replacement
- Ensure you have a stable internet connection
- Try selecting text in a simple text field first to verify functionality

### Q: The extension is slow or takes too long to respond

**A:**
- OpenRouter.ai processing time depends on the selected model and text length
- Consider switching to a faster model like `gpt-3.5-turbo` in settings
- Check your internet connection speed
- For very long text selections, processing may take 10-20 seconds

### Q: The improved/corrected text doesn't match my expectations

**A:**
- Try a different AI model in the extension settings
- Models have different strengths: Claude for creative, GPT-4 for accuracy, etc.
- Consider the context and style of your original text
- You can always undo changes (Ctrl+Z) and try again

### Q: Does this extension work on all websites?

**A:**
- The extension works on most standard text fields and contenteditable areas
- Some websites with custom editors (Google Docs, Office 365) may have limitations
- Read-only text cannot be replaced but you can copy the improved version manually
- Extension requires internet connection to function

### Q: How much does it cost to use OpenRouter.ai?

**A:**
- OpenRouter.ai charges based on token usage (per API call)
- Costs vary by model: GPT-3.5-turbo is cheapest, GPT-4 is more expensive
- Check [OpenRouter.ai pricing](https://openrouter.ai/docs#models) for current rates
- Most grammar corrections cost less than $0.01 per request

### Q: Is my data secure? What happens to my text?

**A:**
- Text is only sent to OpenRouter.ai when you explicitly use the extension
- Data is transmitted over secure HTTPS connections
- OpenRouter.ai's privacy policy applies to processed text
- No text is stored locally by this extension
- Review OpenRouter.ai's data handling policies for details

### Q: Can I customize the prompts used by the extension?

**A:**
- Currently, prompts are built into the extension code
- To customize prompts, you'll need to modify `background.js`
- Look for the prompt templates in the API call functions
- Future versions may include customizable prompts in settings

### Q: The extension icon doesn't appear in my toolbar

**A:**
- Check if the extension is enabled in `about:addons`
- Look for the icon in the extension overflow menu (puzzle piece icon)
- Pin the extension to your toolbar by right-clicking and selecting "Pin to Toolbar"

## Technical Details

- **Manifest Version**: V2/V3 (check `manifest.json`)
- **Permissions Required**: `activeTab`, `contextMenus`, `storage`
- **API Used**: OpenRouter.ai REST API
- **Supported Firefox Version**: 109.0 or higher

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source. Please check the repository for license details.

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/dhananjayandroid/firefox-language-plugin/issues).

## Credits

- Built with ❤️ for better writing
- Powered by [OpenRouter.ai](https://openrouter.ai/)
- Inspired by tools like Grammarly
