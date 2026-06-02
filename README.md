# Stress Checker Mahasiswa - AI Assistant

Aplikasi web berbasis AI untuk menganalisis tingkat stress mahasiswa dan memberikan rekomendasi yang tepat dengan interface multi-halaman yang lengkap.

## Fitur Utama

- 🏠 **Home Page**: Halaman utama dengan overview fitur aplikasi
- 💝 **Mood Tracker**: Catat mood harian dengan visualisasi emoji
- ❓ **Kuis Stress**: Kuis komprehensif 10 pertanyaan dengan scoring dan rekomendasi
- 🤖 **AI Chat Interface**: Berinteraksi dengan AI untuk analisis stress
- 📊 **Statistics Dashboard**: Visualisasi data stress dan mood (gabungan AI + Kuis)
- 👤 **User Profile**: Kelola profil mahasiswa
- 📱 **Responsive Navigation**: Desktop navbar + mobile bottom navigation
- 🎨 **Modern UI**: Interface yang menarik dengan animasi smooth

## Halaman & Fitur

### 🏠 Home
- Welcome screen dengan penjelasan fitur
- Cards informatif tentang kemampuan aplikasi
- Quick access ke fitur utama

### 💝 Mood Tracker  
- 5 pilihan mood dengan emoji (Sangat Bahagia - Sangat Sedih)
- Catatan mood harian
- Penyimpanan riwayat mood di localStorage

### ❓ Kuis Stress
- **10 pertanyaan komprehensif** tentang kehidupan mahasiswa
- **Progress bar** dengan indikator 1/10 hingga 10/10
- **Navigasi kuis**: tombol Previous/Next dengan validasi
- **Scoring system**: Skor 1-100 berdasarkan jawaban
- **Kategori hasil**: Rendah (≤30%), Sedang (31-60%), Tinggi (>60%)
- **Hasil detail**: Deskripsi kondisi + rekomendasi spesifik
- **Animasi skor**: Counter animasi untuk hasil akhir
- **Share function**: Bagikan hasil via native share atau clipboard
- **Restart quiz**: Ulangi kuis kapan saja
- **Data persistence**: Riwayat kuis tersimpan untuk statistik

### 🤖 AI Chat
- Chat interface dengan AI assistant
- Analisis tingkat stress (1-10) dengan visualisasi meter
- Rekomendasi personal berdasarkan analisis AI
- Riwayat percakapan tersimpan

### 📊 Statistics
- Rata-rata stress mingguan dan bulanan (**gabungan data AI + Kuis**)
- Trend analysis (naik/turun/stabil)
- Counter total sesi chat
- Placeholder untuk grafik (siap untuk integrasi chart library)

### 👤 Profile
- Form data mahasiswa (nama, universitas, jurusan, semester, email)
- Penyimpanan data di localStorage
- Interface yang user-friendly

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI**: OpenAI GPT-3.5 Turbo API
- **Storage**: localStorage untuk data persistence
- **Styling**: Font Awesome Icons, CSS Grid & Flexbox
- **Responsive**: Mobile-first design dengan dual navigation

## Navigation System

### Desktop Navigation
- Top navigation bar dengan brand logo
- Horizontal menu: Home | Mood | AI | Stats | Profile
- Hover effects dan active states

### Mobile Navigation  
- Bottom navigation bar (tersembunyi di desktop)
- Icon + label untuk setiap menu
- Touch-friendly dengan spacing optimal

## Cara Penggunaan

1. **Setup**: Buka `index.html` di browser modern
2. **Home**: Mulai dari halaman home untuk overview
3. **Profile**: Isi profil mahasiswa di halaman Profile
4. **Mood**: Catat mood harian di halaman Mood
5. **Kuis**: Ikuti kuis stress 10 pertanyaan untuk assessment lengkap
6. **AI Chat**: Konsultasi dengan AI di halaman AI untuk analisis mendalam
7. **Stats**: Lihat progress gabungan dari kuis dan AI di halaman Statistics

## Instalasi & Konfigurasi

1. Clone atau download repository
2. Pastikan semua file dalam satu folder:
   ```
   ├── index.html
   ├── style.css  
   ├── script.js
   ├── config.js
   └── README.md
   ```
3. Buka `index.html` di browser
4. API key OpenAI sudah dikonfigurasi di `config.js`

## Struktur File

```
stress-checker-mahasiswa/
├── index.html          # Struktur HTML dengan multi-page
├── style.css           # Styling lengkap + responsive
├── script.js           # Logic aplikasi & navigation
├── config.js           # Konfigurasi API & settings
└── README.md           # Dokumentasi
```

## Data Storage

Aplikasi menggunakan localStorage untuk menyimpan:
- **userProfile**: Data profil mahasiswa
- **moodHistory**: Riwayat mood harian
- **stressHistory**: Data tingkat stress dari AI
- **quizHistory**: Hasil kuis stress dengan skor dan kategori
- **chatSessions**: Counter total percakapan
- **conversationHistory**: Riwayat chat dengan AI

## Responsive Design

### Desktop (≥769px)
- Top navigation bar
- Grid layout untuk cards
- Hover effects dan transitions

### Mobile (<768px)  
- Bottom navigation bar
- Single column layout
- Touch-optimized buttons
- Compressed spacing

## Keamanan & Performance

- Input sanitization untuk XSS prevention
- Error handling yang komprehensif  
- Loading states untuk UX
- Data validation sebelum penyimpanan
- Optimized untuk mobile performance

## Pengembangan Lebih Lanjut

### Immediate Improvements
1. **Chart Integration**: Tambah Chart.js untuk visualisasi data
2. **Export Data**: Fitur export statistik ke PDF/Excel
3. **Dark Mode**: Toggle tema gelap/terang
4. **Notifications**: Browser notifications untuk reminder

### Advanced Features
1. **Backend Integration**: Database server untuk multi-device sync
2. **User Authentication**: Login system dengan JWT
3. **Social Features**: Share progress dengan teman
4. **ML Enhancement**: Custom model untuk analisis yang lebih akurat
5. **PWA**: Progressive Web App dengan offline capability

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+  
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Kontribusi

Silakan buat pull request atau issue untuk:
- Bug fixes
- Feature enhancements  
- UI/UX improvements
- Performance optimizations

## Lisensi

MIT License - Bebas digunakan untuk tujuan edukasi dan pengembangan.

---

**⚠️ Disclaimer**: Aplikasi ini adalah alat bantu dan tidak menggantikan konsultasi profesional dengan psikolog atau konselor. Untuk masalah kesehatan mental yang serius, segera hubungi tenaga profesional.