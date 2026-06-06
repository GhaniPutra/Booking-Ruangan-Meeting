# Master Design System: Booking Ruangan Meeting

Tujuan dari sistem desain ini adalah untuk memberikan panduan visual yang premium, bersih, dan konsisten bagi aplikasi pemesanan ruangan rapat. Desain ini menerapkan gaya **Liquid Glass** (kaca likuid/transparan) dengan pemisahan aksen visual yang jelas antara pengguna umum (Customer) dan Administrator.

---

## 1. Gaya Utama (Theme): Liquid Glass
*   **Transparansi & Efek Kaca**: Menggunakan container semi-transparan dengan `backdrop-filter: blur(12px)` dan border tipis berwarna transparan untuk memberikan kesan melayang di atas latar belakang gradien dinamis.
*   **Latar Belakang Dinamis**: Efek lingkaran gradien besar di latar belakang yang berputar lambat untuk memberikan nuansa "hidup" tanpa mengganggu kegunaan.
*   **Mikro-Interaksi**: Hover state yang halus (durasi 200ms) menggunakan transisi warna, bayangan lembut, dan pergeseran posisi yang aman (tidak merusak tata letak).

---

## 2. Palet Warna (Color Palette)

Aplikasi ini memisahkan aksen visual berdasarkan peran pengguna (role) setelah login:

### A. Landing Page & Portal User (Customer)
*   **Kesan**: Segar, tepercaya, berorientasi aksi.
*   **Aksen Utama**: Sky Blue & Booking Orange.
*   **Variabel CSS**:
    ```css
    --primary: #1e3a8a;      /* Deep Blue */
    --secondary: #3b82f6;    /* Sky Blue */
    --accent: #f97316;       /* Booking Orange (CTA utama) */
    --accent-hover: #ea580c;
    --bg-gradient: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    ```

### B. Portal Admin (Administrator)
*   **Kesan**: Profesional, aman, otoritatif, operasional.
*   **Aksen Utama**: Indigo & Emerald Green.
*   **Variabel CSS** (diterapkan via `.theme-admin` pada `<body>`):
    ```css
    --primary: #4f46e5;      /* Indigo */
    --secondary: #06b6d4;    /* Cyan */
    --accent: #10b981;       /* Emerald (Konfirmasi/Sukses) */
    --accent-hover: #059669;
    --bg-gradient: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
    ```

---

## 3. Tipografi (Typography)
*   **Font Heading**: `Poppins` (Google Fonts) untuk judul halaman, sub-header, dan kartu metrik. Memberikan kesan ramah namun profesional.
*   **Font Body**: `Open Sans` (Google Fonts) untuk keterbacaan teks deskripsi dan data tabel yang optimal.
*   **CSS Import**:
    ```css
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    ```

---

## 4. Aturan UX & Pencegahan Anti-Pattern
*   **Tanpa Ikon Emoji**: Semua ikon menggunakan format SVG inline (diambil dari koleksi Lucide/Heroicons) dengan ukuran tetap `w-5 h-5` atau `w-6 h-6`.
*   **Kursor & Hover**: Setiap elemen interaktif memiliki properti `cursor: pointer` dan transisi yang halus `transition: all 0.2s ease-in-out`.
*   **Kontras Teks**: Di mode terang (light mode), teks utama menggunakan warna gelap solid `#0f172a` (Slate 900) untuk memenuhi kriteria aksesibilitas kontras minimal 4.5:1.
*   **Batas Konten**: Lebar kontainer utama dibatasi dengan kelas `max-w-7xl` untuk konsistensi di layar lebar (desktop).
