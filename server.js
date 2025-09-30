const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html di /public)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * RULES SISTEM PAKAR SEDERHANA
 * - Setiap minat punya daftar jurusan prioritas.
 * - Setiap bakat memberi bobot tambahan ke bidang tertentu.
 * Algoritma: ambil jurusan dari minat, beri skor, tambah poin kalau bakat cocok.
 */

const minatToMajors = {
  "Teknologi": ["Teknik Informatika", "Sistem Informasi", "Teknik Elektro", "Teknik Komputer"],
  "Kesehatan": ["Kedokteran", "Keperawatan", "Farmasi", "Gizi"],
  "Ekonomi": ["Manajemen", "Akuntansi", "Ekonomi", "Perbankan"],
  "Seni": ["Desain Komunikasi Visual", "Seni Rupa", "Arsitektur", "Televisi & Film"],
  "Sosial": ["Psikologi", "Ilmu Komunikasi", "Ilmu Politik", "Sosiologi"]
};

const bakatInfluence = {
  "Analisis": ["Teknik Informatika", "Sistem Informasi", "Akuntansi", "Ekonomi"],
  "Komunikasi": ["Ilmu Komunikasi", "Manajemen", "Psikologi", "Hubungan Internasional"],
  "Kreatif": ["Desain Komunikasi Visual", "Seni Rupa", "Arsitektur", "Televisi & Film"],
  "Kepemimpinan": ["Manajemen", "Hukum", "Ilmu Politik", "Administrasi Publik"],
  "Teknis": ["Teknik Elektro", "Teknik Komputer", "Teknik Mesin", "Teknik Industri"]
};

function recommend(minat, bakat) {
  const majors = minatToMajors[minat] || [];
  const scores = {};

  // Base score: jurusan dari minat -> +50
  majors.forEach(m => scores[m] = (scores[m] || 0) + 50);

  // Add some neighbor majors (similar fields) with smaller base
  // e.g., for Teknologi, also consider Teknik Komputer etc (already included).
  // Now boost according to bakatInfluence
  const boosts = bakatInfluence[bakat] || [];
  boosts.forEach(m => scores[m] = (scores[m] || 0) + 30);

  // Also small generic scoring: if bakat matches keywords in major name, +10
  Object.keys(scores).forEach(m => {
    const name = m.toLowerCase();
    if (bakat === 'Analisis' && /informatika|sistem|akuntan|ekonomi/.some?.call) {
      // ignore — old pattern; do simple checks below:
    }
  });

  // Extra: give slight preference to majors that appear both in minat list and influence list.
  // (Already handled by additive scores.)

  // Convert to array and sort
  const arr = Object.entries(scores)
    .map(([major, score]) => ({ major, score }))
    .sort((a, b) => b.score - a.score);

  // If not enough candidates, add fallback majors related to minat
  if (arr.length < 3) {
    // gather other majors from all minat groups that contain the chosen bakat influence words
    const all = new Set();
    Object.values(minatToMajors).flat().forEach(m => all.add(m));
    all.forEach(m => {
      if (!scores[m]) arr.push({ major: m, score: 10 });
    });
  }

  // Return top 3 unique majors
  const top = arr.slice(0, 3).map(x => x.major);
  return top;
}

// API endpoint
app.post('/api/recommend', (req, res) => {
  const { minat, bakat } = req.body;

  if (!minat || !bakat) {
    return res.status(400).json({ error: 'minat dan bakat harus dikirim' });
  }

  const result = recommend(minat, bakat);
  res.json({ recommended: result, basedOn: { minat, bakat } });
});

// fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
