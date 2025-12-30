// Code Editor for Bridd Jump
// Handles code editing, sessionStorage, and special keyboard shortcuts

(function() {
  'use strict';

  let codeEditor = null;
  let findReplacePanel = null;
  let findInput = null;
  let replaceInput = null;
  let matchCaseCheckbox = null;
  let findCountLabel = null;
  let currentFindIndex = 0;
  let findMatches = [];
  let isCodeEditorActive = false;

  // Initialize code editor
  function initCodeEditor() {
    const modal = document.getElementById('codeEditorModal');
    if (!modal) return;

    codeEditor = document.getElementById('codeEditor');
    findReplacePanel = document.getElementById('findReplacePanel');
    findInput = document.getElementById('findInput');
    replaceInput = document.getElementById('replaceInput');
    matchCaseCheckbox = document.getElementById('matchCaseCheckbox');
    findCountLabel = document.getElementById('findCountLabel');

    if (!codeEditor) {
      console.error('Code editor element not found');
      return;
    }

    // Setup event listeners (don't load code yet - wait for open)
    setupEventListeners();
  }

  // Load code from game.js file or sessionStorage
  async function loadCode() {
    if (!codeEditor) {
      console.error('Code editor not initialized');
      return;
    }

    const storageKey = `briddCode_${getVersionPath()}`;
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
      codeEditor.value = stored;
      return;
    }

    // Try to load from game.js (try multiple possible paths)
    const possiblePaths = ['game.js', './game.js', '../game.js'];
    
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path, { cache: 'no-cache' });
        if (response.ok) {
          const code = await response.text();
          if (code && code.trim().length > 0 && !code.includes('<!DOCTYPE')) {
            codeEditor.value = code;
            console.log('Loaded code from', path);
            return;
          }
        }
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    console.log('Could not load game.js from any path');

    // Fallback: try to extract from inline script
    const inlineCode = extractInlineCode();
    if (inlineCode && inlineCode !== '// No code found') {
      codeEditor.value = inlineCode;
      return;
    }

    // Last resort: show helpful error message
    codeEditor.value = `// Code not found.\n// This version may not have a game.js file, or it may be embedded inline.\n// Try editing the code in the browser's developer tools.\n//\n// If you see this message, the code editor is working but couldn't locate the source code.\n// You can still type code here and it will be saved to sessionStorage.`;
  }

  // Extract code from inline script tag (for versions without game.js)
  function extractInlineCode() {
    const scripts = document.querySelectorAll('script:not([src])');
    let largestScript = null;
    let largestLength = 0;
    
    for (let script of scripts) {
      const text = script.textContent || script.innerText;
      // Skip if it's the editCode.js initialization, very short, or contains editCode references
      if (text.length > largestLength && 
          text.length > 100 && 
          !text.includes('initCodeEditor') &&
          !text.includes('editCode.js') &&
          !text.includes('openCodeEditor')) {
        largestScript = text.trim();
        largestLength = text.length;
      }
    }
    
    return largestScript || '// No code found';
  }

  // Get current version path for storage key
  function getVersionPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(V[\d.]+)\//);
    return match ? match[1] : 'root';
  }

  // Save code to sessionStorage
  function saveCode() {
    const storageKey = `briddCode_${getVersionPath()}`;
    sessionStorage.setItem(storageKey, codeEditor.value);
  }

  // Setup all event listeners
  function setupEventListeners() {
    // Save on input (debounced)
    let saveTimeout;
    codeEditor.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveCode, 500);
    });

    // Tab key handling
    codeEditor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        insertTextAtCursor('  '); // 2 spaces
      }
    });

    // Ctrl+A / Cmd+A - Select all in code editor only
    codeEditor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        codeEditor.select();
      }
    });

    // Ctrl+F / Cmd+F - Show Find & Replace
    codeEditor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        showFindReplace();
        findInput.focus();
        findInput.select();
      }
    });

    // Find input events
    findInput.addEventListener('input', () => {
      performFind();
      // Keep focus on find input - prevent jumping to editor
      setTimeout(() => {
        if (document.activeElement !== findInput && findInput) {
          findInput.focus();
        }
      }, 0);
    });
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          findPrevious();
        } else {
          findNext();
        }
        // Return focus to find input after navigation
        setTimeout(() => findInput.focus(), 0);
      } else if (e.key === 'Escape') {
        hideFindReplace();
      }
    });

    // Replace buttons
    document.getElementById('replaceBtn').addEventListener('click', replaceCurrent);
    document.getElementById('replaceAllBtn').addEventListener('click', replaceAll);

    // Close find & replace button
    const closeFindBtn = document.getElementById('closeFindReplace');
    if (closeFindBtn) {
      closeFindBtn.addEventListener('click', hideFindReplace);
    }

    // Close button
    document.getElementById('closeCodeEditor').addEventListener('click', closeCodeEditor);
    document.getElementById('applyCodeBtn').addEventListener('click', applyCode);
  }

  // Insert text at cursor position
  function insertTextAtCursor(text) {
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;
    const value = codeEditor.value;
    
    codeEditor.value = value.substring(0, start) + text + value.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + text.length;
    codeEditor.focus();
    saveCode();
  }

  // Show Find & Replace panel
  function showFindReplace() {
    findReplacePanel.style.display = 'block';
    findInput.focus();
    performFind();
  }

  // Hide Find & Replace panel
  function hideFindReplace() {
    findReplacePanel.style.display = 'none';
    findMatches = [];
    currentFindIndex = 0;
  }

  // Perform find operation
  function performFind() {
    const searchText = findInput.value;
    if (!searchText) {
      findMatches = [];
      updateFindCount();
      return;
    }

    const text = codeEditor.value;
    const matchCase = matchCaseCheckbox.checked;
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(escapeRegex(searchText), flags);
    
    findMatches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      findMatches.push({
        index: match.index,
        length: match[0].length
      });
    }

    currentFindIndex = 0;
    updateFindCount();
    // Preserve focus if user is typing in find input
    const preserveFocus = document.activeElement === findInput;
    highlightCurrentMatch(preserveFocus);
  }

  // Escape special regex characters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Update find count label
  function updateFindCount() {
    if (findMatches.length === 0) {
      findCountLabel.textContent = '0/0';
    } else {
      findCountLabel.textContent = `${currentFindIndex + 1}/${findMatches.length}`;
    }
  }

  // Highlight current match
  function highlightCurrentMatch(preserveFindFocus = false) {
    if (findMatches.length === 0) return;

    const match = findMatches[currentFindIndex];
    
    // If user is typing in find input, don't steal focus
    if (preserveFindFocus && document.activeElement === findInput) {
      // Set selection without focusing editor - use a different approach
      const scrollPos = codeEditor.scrollTop;
      const selectionStart = codeEditor.selectionStart;
      const selectionEnd = codeEditor.selectionEnd;
      
      // Set selection range (this might briefly focus, but we'll restore)
      codeEditor.setSelectionRange(match.index, match.index + match.length);
      
      // Scroll into view
      const lineHeight = 20;
      const linesBefore = codeEditor.value.substring(0, match.index).split('\n').length - 1;
      codeEditor.scrollTop = (linesBefore - 5) * lineHeight;
      
      // Immediately return focus to find input
      requestAnimationFrame(() => {
        if (findInput && document.activeElement !== findInput) {
          findInput.focus();
        }
      });
    } else {
      // Normal behavior - focus editor to show selection
      codeEditor.focus();
      codeEditor.setSelectionRange(match.index, match.index + match.length);
      
      // Scroll into view
      const lineHeight = 20;
      const linesBefore = codeEditor.value.substring(0, match.index).split('\n').length - 1;
      codeEditor.scrollTop = (linesBefore - 5) * lineHeight;
    }
  }

  // Find next match
  function findNext() {
    if (findMatches.length === 0) {
      performFind();
      return;
    }
    currentFindIndex = (currentFindIndex + 1) % findMatches.length;
    updateFindCount();
    // When navigating with Enter, don't preserve focus (user wants to see match)
    highlightCurrentMatch(false);
  }

  // Find previous match
  function findPrevious() {
    if (findMatches.length === 0) {
      performFind();
      return;
    }
    currentFindIndex = (currentFindIndex - 1 + findMatches.length) % findMatches.length;
    updateFindCount();
    // When navigating with Enter, don't preserve focus (user wants to see match)
    highlightCurrentMatch(false);
  }

  // Replace current match
  function replaceCurrent() {
    if (findMatches.length === 0 || currentFindIndex >= findMatches.length) return;

    const match = findMatches[currentFindIndex];
    const replaceText = replaceInput.value;
    const value = codeEditor.value;
    
    codeEditor.value = value.substring(0, match.index) + replaceText + value.substring(match.index + match.length);
    
    // Adjust remaining match indices
    const lengthDiff = replaceText.length - match.length;
    for (let i = currentFindIndex + 1; i < findMatches.length; i++) {
      findMatches[i].index += lengthDiff;
    }

    findMatches.splice(currentFindIndex, 1);
    if (currentFindIndex >= findMatches.length && findMatches.length > 0) {
      currentFindIndex = 0;
    }
    
    updateFindCount();
    if (findMatches.length > 0) {
      highlightCurrentMatch();
    }
    saveCode();
  }

  // Replace all matches
  function replaceAll() {
    const searchText = findInput.value;
    const replaceText = replaceInput.value;
    if (!searchText) return;

    const matchCase = matchCaseCheckbox.checked;
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(escapeRegex(searchText), flags);
    
    codeEditor.value = codeEditor.value.replace(regex, replaceText);
    findMatches = [];
    currentFindIndex = 0;
    updateFindCount();
    saveCode();
  }

  // Open code editor
  async function openCodeEditor() {
    const modal = document.getElementById('codeEditorModal');
    if (!modal) {
      console.error('Code editor modal not found');
      return;
    }

    // Ensure codeEditor is initialized
    if (!codeEditor) {
      codeEditor = document.getElementById('codeEditor');
      if (!codeEditor) {
        console.error('Code editor textarea not found');
        return;
      }
    }
    
    isCodeEditorActive = true;
    modal.style.display = 'flex';
    
    // Load code asynchronously
    await loadCode();
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (codeEditor) {
        codeEditor.focus();
      }
    }, 100);
  }

  // Close code editor
  function closeCodeEditor() {
    const modal = document.getElementById('codeEditorModal');
    if (!modal) return;
    
    isCodeEditorActive = false;
    modal.style.display = 'none';
    hideFindReplace();
  }

  // Apply code (save and reload)
  function applyCode() {
    const code = codeEditor.value;
    const storageKey = `briddCode_${getVersionPath()}`;
    sessionStorage.setItem(storageKey, code);
    
    // Reload the page - the interceptGameJs function will load from sessionStorage
    const reload = confirm('Code saved to sessionStorage!\n\nReload page to apply changes?');
    if (reload) {
      location.reload();
    } else {
      alert('Code saved. Please refresh the page to see changes.');
    }
  }

  // Intercept game.js loading to use sessionStorage code if available
  function interceptGameJs() {
    const storageKey = `briddCode_${getVersionPath()}`;
    const storedCode = sessionStorage.getItem(storageKey);
    
    if (storedCode) {
      // Replace script tags synchronously before they execute
      const replaceScripts = () => {
        const scripts = document.querySelectorAll('script[src*="game.js"]:not([data-source])');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = storedCode;
          newScript.setAttribute('data-source', 'sessionStorage');
          script.parentNode.insertBefore(newScript, script);
          script.remove();
        });
      };
      
      // Replace immediately if scripts exist
      replaceScripts();
      
      // Also watch for scripts added later
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceScripts);
      }
      
      // Use MutationObserver as backup
      const observer = new MutationObserver(replaceScripts);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  // Expose open function globally
  window.openCodeEditor = openCodeEditor;

  // Intercept game.js on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      interceptGameJs();
      initCodeEditor();
    });
  } else {
    interceptGameJs();
    initCodeEditor();
  }
})();

