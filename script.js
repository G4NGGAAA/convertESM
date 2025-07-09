async function convertAndHelpAI() {
      const input = document.getElementById('urlInput').value.trim();
      const resultBox = document.getElementById("resultBox");
      const actionBtn = document.getElementById("actionBtn");
      const btnText = document.getElementById("btnText");
      const btnLoader = document.getElementById("btnLoader");
      const copyBtn = document.getElementById("copyBtn");

      if (!input) return alert("Masukkan kode ESM yang valid.");

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      actionBtn.disabled = true;
      resultBox.textContent = "⏳ Mengonversi kode ESM ke CommonJS...";
      copyBtn.style.display = 'none';

      try {
        let convertedText = '';
        let notice = '';

        const isCode = input.includes('import') || input.includes('export');
        if (!isCode) throw new Error("Input bukan kode ESM yang valid.");

        notice = "🧩 Deteksi kode ESM! Mengonversi ke format CommonJS...\n\n";
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

        const aiRes = await fetch(`https://api.siputzx.my.id/api/ai/gpt3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: convertedText })
        });

        const aiData = await aiRes.json();
        const aiText = aiData.answer || aiData.result || "⚠️ Tidak ada balasan dari AI.";

        resultBox.textContent = notice + `✅ Hasil Konversi:\n${convertedText}\n\n🧠 GPT-3 Menjelaskan:\n${aiText}`;
        copyBtn.style.display = 'inline';

      } catch (err) {
        resultBox.textContent = "❌ Gagal memproses: " + err.message;
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        actionBtn.disabled = false;
      }
    }

    function copyResult() {
      const text = document.getElementById("resultBox").textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert("✅ Hasil disalin ke clipboard!");
      });
    }
