async function convertAndHelpAI() {
  const input = document.getElementById('urlInput').value.trim();
  const resultBox = document.getElementById("resultBox");
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const copyBtn = document.getElementById("copyBtn");

  if (!input) return alert("Masukkan kode atau URL yang valid.");

  // Show loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  actionBtn.disabled = true;
  resultBox.textContent = "⏳ Memproses...";
  copyBtn.style.display = 'none';

  try {
    let convertedText = '';
    let notice = '';

    // ESM CODE DETECTION (jika input mengandung 'import' atau 'export')
    const isCode = input.includes('import') || input.includes('export');

    if (isCode) {
      notice = "🧩 Deteksi kode ESM! Akan dikonversi ke format scraping JavaScript (CommonJS)...\n\n";

      // Convert ESM to CommonJS
      convertedText = input
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

      resultBox.textContent = notice + "✅ Hasil Konversi:\n" + convertedText + "\n\n🧠 Meminta bantuan AI...";

    } else {
      // Assume it's a scraping URL
      notice = "📡 Deteksi URL, memproses scraping dari API...\n\n";
      const scrapeRes = await fetch(`https://api.siputzx.my.id/api/download/igdl?url=${encodeURIComponent(input)}`);
      const scrapeData = await scrapeRes.json();
      convertedText = JSON.stringify(scrapeData, null, 2);
      resultBox.textContent = notice + `✅ Hasil Scraping:\n${convertedText}\n\n🧠 Meminta bantuan AI...`;
    }

    // Step 2: Send to AI
    const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: convertedText })
    });

    const aiData = await aiRes.json();
    const aiText = aiData.answer || aiData.result || "⚠️ Tidak ada balasan dari AI.";

    resultBox.textContent = notice + `✅ Hasil:\n${convertedText}\n\n🧠 GPT-3 Menjelaskan:\n${aiText}`;
    copyBtn.style.display = 'block';

  } catch (err) {
    resultBox.textContent = "❌ Gagal memproses: " + err.message;
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    actionBtn.disabled = false;
  }
}
