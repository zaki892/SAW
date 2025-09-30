document.getElementById('btn-rekom').addEventListener('click', async () => {
  const minat = document.getElementById('minat').value;
  const bakat = document.getElementById('bakat').value;
  const resultEl = document.getElementById('result');

  if (!minat || !bakat) {
    resultEl.innerHTML = '<p class="text-red-600">Isi dulu minat dan bakatnya!</p>';
    return;
  }

  resultEl.innerHTML = '<p>Memproses rekomendasi...</p>';

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minat, bakat })
    });

    if (!res.ok) {
      const err = await res.json();
      resultEl.innerHTML = `<p class="text-red-600">Error: ${err.error || 'Server error'}</p>`;
      return;
    }

    const data = await res.json();
    const list = data.recommended;
    resultEl.innerHTML = `
      <p class="mb-2">Berdasarkan <strong>${minat}</strong> dan bakat <strong>${bakat}</strong>, rekomendasi jurusan:</p>
      <ol class="list-decimal pl-6">
        ${list.map(m => `<li class="py-1">${m}</li>`).join('')}
      </ol>
      <p class="mt-3 text-sm text-gray-500">Catatan: ini rekomendasi dasar, bisa dikembangkan dengan bobot, kuesioner, atau metode SAW/CF.</p>
    `;
  } catch (e) {
    console.error(e);
    resultEl.innerHTML = '<p class="text-red-600">Gagal menghubungi server.</p>';
  }
});
