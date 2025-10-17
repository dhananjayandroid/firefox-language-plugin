// Listen for messages from background script
console.log('[CONTENT] Content script loaded');
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "improve-text" || 
      request.action === "correct-grammar") {
    
    console.log('[CONTENT] Received action from context menu:', request.action);
    console.log('[CONTENT] Selected text length:', request.selectedText?.length || 0);
    console.log('[CONTENT] *** EXACT SELECTED TEXT SENT TO BACKGROUND ***');
    console.log('[CONTENT] Selected text:', request.selectedText);
    console.log('[CONTENT] *** END OF SELECTED TEXT ***');
    
    // Get the selected text and its position
    const selection = window.getSelection();
    const selectedText = request.selectedText;
    
    if (!selection.rangeCount) {
      console.log('[CONTENT] No text range selected');
      return;
    }
    
    // Store the range or element for later replacement
    let range;
    let replacementMethod = null;
    let targetElement = null;
    
    try {
      range = selection.getRangeAt(0);
      replacementMethod = 'range';
      console.log('[CONTENT] Successfully obtained range at index 0');
      console.log('[CONTENT] Using replacement method: range-based selection');
    } catch (error) {
      console.log('[CONTENT] Failed to get selection range, trying fallback methods...');
      console.log('[CONTENT] Error details:', error.message);
      
      // Fallback: Try to use activeElement (input, textarea, or contenteditable)
      const activeElement = document.activeElement;
      console.log('[CONTENT] Active element tag:', activeElement?.tagName);
      console.log('[CONTENT] Active element type:', activeElement?.type);
      console.log('[CONTENT] Is contentEditable:', activeElement?.isContentEditable);
      
      if (activeElement && 
          (activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA')) {
        targetElement = activeElement;
        replacementMethod = 'input';
        console.log('[CONTENT] Using replacement method: input/textarea element');
      } else if (activeElement && activeElement.isContentEditable) {
        targetElement = activeElement;
        replacementMethod = 'contenteditable';
        console.log('[CONTENT] Using replacement method: contenteditable element');
      } else {
        console.error('[CONTENT] *** REPLACEMENT FAILED ***');
        console.error('[CONTENT] Reason: No valid selection method found');
        console.error('[CONTENT] - Range selection failed:', error.message);
        console.error('[CONTENT] - Active element is not editable');
        console.error('[CONTENT] - Active element tag:', activeElement?.tagName || 'none');
        alert('Unable to replace text. Please ensure text is selected in an editable field.');
        return;
      }
    }
    
    console.log('[CONTENT] Sending text to background script for processing...');
    
    // Send text to background script for processing
    browser.runtime.sendMessage({
      action: "processText",
      text: selectedText,
      option: request.action
    })
    .then(response => {
      console.log('[CONTENT] Received response from background script');
      console.log('[CONTENT] Response success:', response.success);
      
      if (response.success) {
        console.log('[CONTENT] Processed text length:', response.text?.length || 0);
        console.log('[CONTENT] *** FULL TEXT RECEIVED FROM SERVER ***');
        console.log('[CONTENT] Response text:', response.text);
        console.log('[CONTENT] *** END OF SERVER RESPONSE ***');
        
        // Replace the selected text with the processed text using the appropriate method
        replaceSelectedText(range, targetElement, replacementMethod, response.text, selectedText);
      } else {
        console.error('[CONTENT] Error processing text:', response.error);
        alert('Error: ' + response.error);
      }
    })
    .catch(error => {
      console.error('[CONTENT] Communication error:', error);
      alert('Failed to process text. Please try again.');
    });
  }
});

// Function to replace selected text
function replaceSelectedText(range, targetElement, method, newText, originalText) {
  try {
    console.log('[CONTENT] Replacing selected text using method:', method);
    console.log('[CONTENT] Original text length:', originalText?.length || 0);
    console.log('[CONTENT] New text length:', newText?.length || 0);
    
    if (method === 'range') {
      // Use range-based replacement for regular selections
      console.log('[CONTENT] Applying range-based replacement...');
      
      // Delete the current content
      range.deleteContents();
      
      // Insert the new text
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      
      console.log('[CONTENT] Text replaced successfully via range');
      
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
      
    } else if (method === 'input') {
      // Use value replacement for input/textarea elements
      console.log('[CONTENT] Applying input/textarea replacement...');
      
      const startPos = targetElement.selectionStart;
      const endPos = targetElement.selectionEnd;
      const currentValue = targetElement.value;
      
      console.log('[CONTENT] Selection start:', startPos);
      console.log('[CONTENT] Selection end:', endPos);
      
      // Replace the selected portion
      targetElement.value = currentValue.substring(0, startPos) + 
                           newText + 
                           currentValue.substring(endPos);
      
      // Set cursor position after the new text
      const newCursorPos = startPos + newText.length;
      targetElement.selectionStart = newCursorPos;
      targetElement.selectionEnd = newCursorPos;
      
      // Trigger input event for frameworks that listen to it
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
      targetElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('[CONTENT] Text replaced successfully via input element');
      console.log('[CONTENT] New cursor position:', newCursorPos);
      
    } else if (method === 'contenteditable') {
      // Use execCommand or fallback for contenteditable elements
      console.log('[CONTENT] Applying contenteditable replacement...');
      
      // Try using execCommand first (works in many cases)
      if (document.execCommand) {
        targetElement.focus();
        const success = document.execCommand('insertText', false, newText);
        
        if (success) {
          console.log('[CONTENT] Text replaced successfully via execCommand');
        } else {
          console.log('[CONTENT] execCommand failed, trying direct manipulation...');
          
          // Fallback: try to use selection API on contenteditable
          const sel = window.getSelection();
          if (sel.rangeCount > 0) {
            const editRange = sel.getRangeAt(0);
            editRange.deleteContents();
            editRange.insertNode(document.createTextNode(newText));
            console.log('[CONTENT] Text replaced successfully via selection API');
          } else {
            throw new Error('No selection range available for contenteditable');
          }
        }
      } else {
        throw new Error('execCommand not available');
      }
    } else {
      throw new Error('Unknown replacement method: ' + method);
    }
    
    console.log('[CONTENT] *** REPLACEMENT SUCCESSFUL ***');
    
  } catch (error) {
    console.error('[CONTENT] *** REPLACEMENT FAILED ***');
    console.error('[CONTENT] Error replacing text:', error.message);
    console.error('[CONTENT] Replacement method was:', method);
    console.error('[CONTENT] Reason:', error.stack);
    alert('Failed to replace text. The page may not allow text editing. Error: ' + error.message);
  }
}
