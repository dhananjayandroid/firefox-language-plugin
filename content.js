// Listen for messages from background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "improve-text" || 
      request.action === "correct-grammar" || 
      request.action === "reword-text") {
    
    // Get the selected text and its position
    const selection = window.getSelection();
    const selectedText = request.selectedText;
    
    if (!selection.rangeCount) {
      return;
    }
    
    // Store the range for later replacement
    const range = selection.getRangeAt(0);
    
    // Send text to background script for processing
    browser.runtime.sendMessage({
      action: "processText",
      text: selectedText,
      option: request.action
    }).then(response => {
      if (response.success) {
        // Replace the selected text with the processed text
        replaceSelectedText(range, response.text);
      } else {
        console.error('Error processing text:', response.error);
        alert('Error: ' + response.error);
      }
    }).catch(error => {
      console.error('Communication error:', error);
      alert('Failed to process text. Please try again.');
    });
  }
});

// Function to replace selected text
function replaceSelectedText(range, newText) {
  try {
    // Delete the current content
    range.deleteContents();
    
    // Insert the new text
    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    
    // Select the newly inserted text for visual feedback
    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    window.getSelection().addRange(newRange);
    
    // Clear selection after a brief moment
    setTimeout(() => {
      window.getSelection().removeAllRanges();
    }, 500);
  } catch (error) {
    console.error('Error replacing text:', error);
    alert('Failed to replace text. The page may not allow text editing.');
  }
}
