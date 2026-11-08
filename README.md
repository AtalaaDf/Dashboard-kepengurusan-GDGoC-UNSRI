# Dashboard Manajemen GDGoC Universitas Sriwijaya

Sistem manajemen organisasi terpadu untuk pengurus **Google Developer Group on Campus (GDGoC) Universitas Sriwijaya**. Aplikasi ini dirancang untuk mempermudah pencatatan presensi kehadiran anggota, pengelolaan kas organisasi, pemantauan agenda kegiatan/event melalui lembar kerja tracker terperinci, hingga penentuan status kelulusan batch.

---

## 1. Peran Pengguna (Roles), Hak Akses, dan Batasan

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control* / RBAC) yang terintegrasi langsung dengan Supabase Auth dan *Row Level Security* (RLS) pada basis data. Terdapat **4 peran (role)** di dalam sistem:

| Peran (Role) | Kode Sistem | Cakupan Tanggung Jawab Utama |
|---|---|---|
| **Superadmin (Lead)** | `superadmin` | Pemimpin organisasi; memegang kendali penuh atas seluruh modul dan tata kelola sistem. |
| **Admin Organisasi** | `admin` | Pengurus divisi keanggotaan/operasional; mengelola presensi, rekap keaktifan, dan sanksi. |
| **Executive (Treasurer)** | `executive` | Bendahara organisasi; mengelola verifikasi kas, denda, dan pembukuan keuangan. |
| **Project Officer (PO)** | `po` | Penanggung jawab teknis acara; merancang agenda kegiatan dan mengelola tracker kerja. |

### Rincian Fungsi dan Batasan Masing-Masing Peran

#### A. Superadmin (Lead)
- **Fungsi & Hak Akses:**
  - Mengakses seluruh halaman dan modul tanpa batasan.
  - Menambah dan menghapus divisi organisasi (kategori technical dan non-technical).
  - Menambah anggota baru, mengubah status keaktifan (*active/inactive*), dan menghapus anggota permanen (*cascade delete*).
  - Membuat event baru serta menghapus event permanen.
  - Melakukan pencatatan presensi kehadiran event dan menetapkan status final.
  - Memeriksa, menerima (*approve*), atau menolak (*decline*) setoran kas anggota.
  - Mencatat kas fleksibel (pengeluaran maupun pemasukan eksternal seperti sponsor/hibah).
  - Mencatat data lomba anggota dan status penyelesaian sanksi (*punishment*).
  - Mengunduh rekapitulasi data anggota (absensi & kelulusan) dan rekapitulasi pembukuan kas.
- **Batasan:**
  - Tidak memiliki batasan akses fungsional (*Full Access*).

#### B. Admin Organisasi
- **Fungsi & Hak Akses:**
  - Melihat direktori anggota dan membuka profil detail masing-masing anggota.
  - Mengisi presensi kehadiran pada event kegiatan dan menandai absensi sebagai final.
  - Mencatat partisipasi perlombaan bagi anggota divisi technical.
  - Menandai penyelesaian sanksi (*punishment*) bagi anggota yang melampaui batas aman ketidakhadiran.
  - Mengunduh rekap absensi dan kelulusan anggota dalam format spreadsheet/CSV.
- **Batasan:**
  - Tidak dapat menambah, mengedit, atau menghapus divisi organisasi.
  - Tidak dapat mendaftarkan anggota baru atau menghapus anggota secara permanen.
  - Tidak memiliki akses ke modul verifikasi kas maupun pencatatan kas keluar/masuk.
  - Tidak dapat membuat event atau mengedit lembar kerja tracker PO.

#### C. Executive (Treasurer / Bendahara)
- **Fungsi & Hak Akses:**
  - Memeriksa antrean bukti pembayaran kas (iuran bulanan dan denda keterlambatan) yang masuk dari formulir publik.
  - Melihat bukti transfer dalam ukuran penuh (fitur modal pratinjau).
  - Menerima (*approve*) atau menolak (*decline*) pembayaran kas.
  - Mencatat transaksi kas: pengeluaran operasional organisasi maupun pemasukan dari sumber lain.
  - Melihat saldo kas organisasi secara *real-time* di Dashboard.
  - Mengunduh rekapitulasi kas periode Januari s.d. November dalam format spreadsheet/CSV.
- **Batasan:**
  - Tidak dapat mengelola divisi maupun keanggotaan organisasi.
  - Tidak dapat mengisi presensi event, mencatat lomba, atau mengatur sanksi anggota.
  - Tidak dapat membuat event kegiatan atau mengakses lembar kerja tracker PO.

#### D. Project Officer (PO)
- **Fungsi & Hak Akses:**
  - Membuat event baru (bertipe Online atau Offline) dengan inisialisasi lembar kerja otomatis (*tracker template*).
  - Menghapus event yang tidak jadi dilaksanakan beserta seluruh lembar kerja terkait secara bersih.
  - Mengelola lembar kerja tracker 3 tingkat: Divisi Tracker, Kelompok Tugas, dan Daftar Tugas/Checklist.
  - Mengatur rincian tugas: PIC, status pengerjaan, tahapan (*Pre-Event*, *On Event*, *Post-Event*), tenggat waktu, anggaran belanja (divisi E&C), dan tautan publikasi.
  - Memantau persentase kemajuan persiapan kegiatan secara *real-time*.
- **Batasan:**
  - Tidak dapat melakukan pencatatan presensi kehadiran peserta event.
  - Tidak memiliki akses ke modul pengelolaan keuangan dan kas.
  - Tidak dapat menambah, mengubah, atau menghapus data anggota dan divisi.

---

## 2. Tech Stack, Framework, dan Library

Aplikasi ini dibangun menggunakan arsitektur modern berbasis React dengan fokus pada performa tinggi, kebersihan kode (*clean code*), dan keterpisahan komponen presentasional murni:

### Core Framework & Bahasa
- **React 19 (`react`, `react-dom` v19.3)**: Pustaka inti antarmuka pengguna berbasis komponen.
- **TypeScript 5.8 (`typescript`)**: Pengetikan statis penuh untuk keandalan dan keamanan tipe data.
- **Vite 8 (`vite`)**: Alat *build* generasi terbaru dengan *Hot Module Replacement* (HMR) berkecepatan tinggi.

### Styling & Desain
- **Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss` v4.3)**: Kerangka kerja utilitas CSS modern.
- **Identitas Visual GDGoC**: Menerapkan font Google Sans, warna primer Google (Blue `#4285f4`, Green `#34a853`, Yellow `#f9ab00`, Red `#ea4335`), serta palet pastel pelengkap.
- **Animasi Kustom (`src/styles/animations.css`)**: Mengatur efek transisi halus, perpindahan halaman (*fade in*), dan ornamen lingkaran mengambang (*floating ornaments*).

### Backend, Basis Data, & Autentikasi
- **Supabase (`@supabase/supabase-js` v2.118)**: Layanan Backend-as-a-Service berbasis PostgreSQL.
  - **Supabase Auth**: Autentikasi berbasis email dan kata sandi dengan persistensi sesi otomatis.
  - **Supabase Database (PostgreSQL)**: Penyimpanan relasional yang dilengkapi aturan keamanan tingkat baris (*Row Level Security* / RLS).

### Navigasi & Formulir
- **React Router v7 (`react-router-dom` v7.18)**: Manajemen rute sisi klien, *Protected Routes* berbasis peran, dan indikator progres atas (*PageProgressBar*).
- **Zod 4 (`zod`)**: Validasi skema formulir dan deklarasi tipe data yang ketat.
- **TanStack Form & Query (`@tanstack/react-form`, `@tanstack/react-query`)**: Manajemen status formulir dan sinkronisasi data asinkron.

### Komponen UI & Utilitas
- **Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-slot`)**: Komponen aksesibel untuk dialog modal dan formulir.
- **Heroicons v2 (`@heroicons/react` v2.2)**: Set ikon resmi dari Tailwind Labs.
- **Class Utilities (`clsx`, `tailwind-merge`, `class-variance-authority`)**: Penggabungan kelas utilitas CSS yang aman tanpa konflik.

---


