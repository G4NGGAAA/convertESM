// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or use preferred color scheme
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
  const resultBox = document.getElementById('resultBox');
  navigator.clipboard.writeText(resultBox.textContent)
    .then(() => {
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Disalin!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Salin';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
});

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', function() {
  // Add click animations to all buttons
  const buttons = document.querySelectorAll('button, .social-btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Add temporary active class
      this.classList.add('active');
      setTimeout(() => {
        this.classList.remove('active');
      }, 300);
      
      // For social buttons, track the click
      if (this.id === 'whatsappBtn' || this.id === 'channelBtn' || this.id === 'githubBtn') {
        console.log(`Navigating to ${this.href}`);
        // You could add analytics here
      }
    });
  });

  // Profile image hover effect
  const profileImg = document.querySelector('.profile-img');
  if (profileImg) {
    profileImg.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    profileImg.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  }
});

async function convertAndHelpAI() {
  const url = document.getElementById('urlInput').value.trim();
  const resultBox = document.getElementById("resultBox");
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const copyBtn = document.getElementById("copyBtn");

  if (!url) return alert("Masukkan URL yang valid.");
  
  // Show loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  actionBtn.disabled = true;
  resultBox.textContent = "⏳ Mengambil data dari API...";
  copyBtn.style.display = 'none';

  try {
    // Step 1: Fetch scraping data
    const scrapeRes = await fetch(`https://api.siputzx.my.id/api/download/igdl?url=${encodeURIComponent(url)}`);
    const scrapeData = await scrapeRes.json();
    const scrapeText = JSON.stringify(scrapeData, null, 2);

    resultBox.textContent = `✅ Hasil Scraping:\n${scrapeText}\n\n🧠 Meminta bantuan AI...`;

    // Step 2: Send to AI (choose either GPT3 or Gemini-Pro)
    const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: scrapeText })
    });

    const aiData = await aiRes.json();
    const aiText = aiData.answer || aiData.result || "⚠️ Tidak ada balasan dari AI.";

    resultBox.textContent = `✅ Hasil Scraping:\n${scrapeText}\n\n🧠 GPT-3 Menjelaskan:\n${aiText}`;
    copyBtn.style.display = 'block';
  } catch (err) {
    resultBox.textContent = "❌ Gagal memproses: " + err.message;
  } finally {
    // Reset button state
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    actionBtn.disabled = false;
  }
}
