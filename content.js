// Listen for messages from background script
console.log('[CONTENT] Content script loaded');

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "improve-text" || 
      request.action === "correct-grammar") {
    
    console.log('[CONTENT] Received action from context menu:', request.action);
    console.log('[CONTENT] Selected text length:', request.selectedText?.length || 0);
    
    // Get the selected text and its position
    const selection = window.getSelection();
    const selectedText = request.selectedText;
    
    if (!selection.rangeCount) {
      console.log('[CONTENT] No text range selected');
      return;
    }
    
    // Store the range for later replacement
    const range = selection.getRangeAt(0);
    console.log('[CONTENT] Sending text to background script for processing...');
    
    // Send text to background script for processing
    browser.runtime.sendMessage({
      action: "processText",
      text: selectedText,
      option: request.action
    }).then(response => {
      console.log('[CONTENT] Received response from background script');
      console.log('[CONTENT] Response success:', response.success);
      
      if (response.success) {
        console.log('[CONTENT] Processed text length:', response.text?.length || 0);
        // Replace the selected text with the processed text
        replaceSelectedText(range, response.text);
      } else {
        console.error('[CONTENT] Error processing text:', response.error);
        alert('Error: ' + response.error);
      }
    }).catch(error => {
      console.error('[CONTENT] Communication error:', error);
      alert('Failed to process text. Please try again.');
    });
  }
});

// Function to replace selected text
function replaceSelectedText(range, newText) {
  try {
    console.log('[CONTENT] Replacing selected text...');
    
    // Delete the current content
    range.deleteContents();
    
    // Insert the new text
    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);
    
    console.log('[CONTENT] Text replaced successfully');
    
    // Clear selection
    window.getSelection().removeAllRanges();
    
    // Select the newly inserted text for visual feedback
    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    window.getSelection().addRange(newRange);
    
    // Clear selection after a brief moment
    setTimeout(() => {
      window.getSelection().removeAllRanges();
      console.log('[CONTENT] Text replacement complete');
    }, 500);
  } catch (error) {
    console.error('[CONTENT] Error replacing text:', error);
    alert('Failed to replace text. The page may not allow text editing.');
  }
}
