async function convertAndHelpAI() {
  const url = document.getElementById('urlInput').value.trim();
  const resultBox = document.getElementById("resultBox");
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const copyBtn = document.getElementById("copyBtn");

  if (!url) return alert("Masukkan URL yang valid.");
  
  // ESM Detection
  const isESM = url.endsWith('.mjs') || url.includes('import ') || url.includes('export ');
  let scrapeNotice = '';

  if (isESM) {
    scrapeNotice = "📡 Ini adalah file ESM. Akan dikonversi ke hasil scraping...\n\n";
    alert("📢 Deteksi ESM! File ini akan dikonversi melalui scraping.");
  }

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

    resultBox.textContent = scrapeNotice + `✅ Hasil Scraping:\n${scrapeText}\n\n🧠 Meminta bantuan AI...`;

    // Step 2: Send to AI (GPT-3 atau Gemini Pro)
    const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: scrapeText })
    });

    const aiData = await aiRes.json();
    const aiText = aiData.answer || aiData.result || "⚠️ Tidak ada balasan dari AI.";

    resultBox.textContent = scrapeNotice + `✅ Hasil Scraping:\n${scrapeText}\n\n🧠 GPT-3 Menjelaskan:\n${aiText}`;
    copyBtn.style.display = 'block';

  } catch (err) {
    resultBox.textContent = "❌ Gagal memproses: " + err.message;
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    actionBtn.disabled = false;
  }
}
