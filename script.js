// Initialize Highlight.js
document.addEventListener('DOMContentLoaded', function () {
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

  // Copy button functionality
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', () => {
    const codeBlock = document.querySelector('#resultBox code');
    const textToCopy = codeBlock.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Disalin!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Salin';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Profile image hover effect
  const profileImg = document.querySelector('.profile-img');
  if (profileImg) {
    profileImg.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.1)';
    });

    profileImg.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
  }
});

async function convertAndHelpAI() {
  const input = document.getElementById('urlInput').value.trim();
  const resultBox = document.querySelector("#resultBox code");
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const copyBtn = document.getElementById("copyBtn");

  if (!input) return alert("Masukkan kode ESM yang valid.");

  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  actionBtn.disabled = true;
  resultBox.textContent = "⏳ Mengonversi kode...";
  copyBtn.style.display = 'none';

  try {
    let notice = "🧩 Deteksi kode ESM! Mengonversi ke format CommonJS...\n\n";
    let convertedText = input
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

    resultBox.textContent = `${notice}✅ Hasil Konversi:\n${convertedText}\n\n🧠 Meminta penjelasan dari AI...`;
    hljs.highlightElement(resultBox);

    const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: convertedText })
    });

    const aiData = await aiRes.json();
    const aiText = aiData.answer || aiData.result || "⚠️ Tidak ada balasan dari AI.";

    resultBox.textContent = `${notice}✅ Hasil Konversi:\n${convertedText}\n\n🧠 GPT-3 Menjelaskan:\n${aiText}`;
    hljs.highlightElement(resultBox);
    copyBtn.style.display = 'block';
  } catch (err) {
    resultBox.textContent = "❌ Gagal memproses: " + err.message;
    hljs.highlightElement(resultBox);
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    actionBtn.disabled = false;
  }
}
