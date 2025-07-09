// Initialize Highlight.js
document.addEventListener('DOMContentLoaded', function() {
  hljs.highlightAll();
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  const savedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Copy button functionality (updated for multiple results)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('copy-btn') {
      const resultContent = e.target.closest('.result-item').querySelector('.result-content');
      const textToCopy = resultContent.textContent;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = e.target.innerHTML;
        e.target.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          e.target.innerHTML = originalText;
        }, 2000);
      });
    }
  });

  // Auto-resize textarea
  const textarea = document.getElementById('urlInput');
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
});

// Process multiple URLs
async function processMultipleUrls() {
  const input = document.getElementById('urlInput').value.trim();
  const resultsContainer = document.getElementById('resultsContainer') || createResultsContainer();
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");

  if (!input) return alert("Please enter valid ESM code(s)");
  
  // Show loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  actionBtn.disabled = true;
  resultsContainer.innerHTML = '<div class="result-item"><div class="result-content">Processing...</div></div>';

  try {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Split by lines and process each
    const codeBlocks = input.split('\n').filter(block => block.trim());
    
    for (const [index, code] of codeBlocks.entries()) {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      
      const header = document.createElement('div');
      header.className = 'result-header';
      header.innerHTML = `
        <span>Result #${index + 1}</span>
        <button class="copy-btn"><i class="far fa-copy"></i> Copy</button>
      `;
      
      const content = document.createElement('div');
      content.className = 'result-content';
      content.textContent = "Processing...";
      
      resultItem.appendChild(header);
      resultItem.appendChild(content);
      resultsContainer.appendChild(resultItem);
      
      // Process each code block
      await processSingleCode(code, content);
    }
  } catch (err) {
    const errorItem = document.createElement('div');
    errorItem.className = 'result-item';
    errorItem.innerHTML = `
      <div class="result-header">Error</div>
      <div class="result-content">${err.message}</div>
    `;
    resultsContainer.appendChild(errorItem);
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    actionBtn.disabled = false;
    hljs.highlightAll();
  }
}

function createResultsContainer() {
  const container = document.createElement('div');
  container.id = 'resultsContainer';
  container.className = 'scrollable-results';
  document.querySelector('.result-container').appendChild(container);
  return container;
}

async function processSingleCode(code, element) {
  try {
    // Check for ESM syntax
    const isESM = code.includes("import") || code.includes("export");
    if (!isESM) {
      throw new Error("Not ESM code");
    }

    // Conversion process
    let converted = code
      .replace(/import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"];?/g,
        "const $1 = require('$2');")
      .replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?/g,
        "const { $1 } = require('$2');")
      .replace(/export\s+default\s+/g, 'module.exports = ')
      .replace(/export\s+\{([^}]+)\};?/g, (_, p1) => {
        return p1.split(',').map(e => {
          const name = e.trim();
          return `module.exports.${name} = ${name};`;
        }).join('\n');
      });

    element.textContent = converted;
    
    // Get AI explanation (optional)
    const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: converted })
    });
    
    const aiData = await aiRes.json();
    const aiText = aiData.answer || aiData.result || "No AI explanation available";
    
    element.textContent = `${converted}\n\n/* AI Explanation */\n${aiText}`;
    
  } catch (err) {
    element.textContent = `Error processing code:\n${err.message}\n\nOriginal code:\n${code}`;
  }
}
