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

## 3. Panduan Konfigurasi dan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di lingkungan lokal:

### Prasyarat
- **Node.js**: Versi 18.x atau lebih baru.
- **Package Manager**: npm (bawaan Node.js).
- **Akun Supabase**: Proyek Supabase aktif untuk basis data dan autentikasi.

### Langkah 1: Kloning Repositori dan Instalasi Dependensi
```bash
git clone <url-repository-anda>
cd Dashboard-GDGoC
npm install
```

### Langkah 2: Konfigurasi Environment Variables (`.env`)
Salin berkas template konfigurasi lingkungan `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka berkas `.env` dan masukkan kredensial proyek Supabase Anda:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh......
```
*Catatan: Nilai URL dan Anon Key dapat diperoleh pada dashboard Supabase di menu **Project Settings > API**.*

### Langkah 3: Konfigurasi Skema Basis Data di Supabase
1. Masuk ke dashboard proyek Supabase Anda.
2. Buka menu **SQL Editor**.
3. Buka berkas spesifikasi basis data proyek ini yang terletak di [`docs/database.md`](docs/database.md).
4. Salin seluruh skrip DDL SQL yang ada di bagian bawah dokumen tersebut (Bagian 4 & 5: DDL Script & Initial Data), lalu jalankan (*Run*) di SQL Editor Supabase.
5. Skrip tersebut akan otomatis membentuk:
   - Tipe ENUM (`user_role`, `division_type`, `event_type`, `submission_status`, dll.)
   - Tabel-tabel relasional (`batches`, `divisions`, `profiles`, `members`, `events`, `attendances`, `kas_submissions`, dll.)
   - Fungsi pembantu hak akses `get_current_role()`
   - Aturan keamanan baris (*Row Level Security Policies*)
   - Data batch awal (`Batch 2026`)

### Langkah 4: Menyiapkan Akun Pengurus Pertama (Superadmin)
Karena pendaftaran akun baru tidak dibuka untuk publik demi keamanan data organisasi:
1. Buka menu **Authentication > Users** di dashboard Supabase.
2. Klik **Add User** > **Create User**. Masukkan email dan kata sandi yang diinginkan (misal: `superadmin@gdgocunsri.org`).
3. Buka menu **Table Editor** > pilih tabel **`profiles`**.
4. Tambahkan baris baru (*Insert Row*):
   - Kolom `id`: Tempelkan UUID user yang baru dibuat pada menu Authentication.
   - Kolom `role`: Pilih `'superadmin'`.
5. Akun Superadmin kini siap digunakan untuk masuk ke dashboard.

### Langkah 5: Menjalankan Server Pengembangan
Jalankan server lokal menggunakan perintah:
```bash
npm run dev
```
Aplikasi akan aktif di alamat `http://localhost:5173`.

---

## 4. Perintah yang Tersedia (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan aplikasi pada mode pengembangan lokal (Vite Dev Server). |
| `npm run build` | Melakukan kompilasi TypeScript dan membangun aset produksi ke folder `dist/`. |
| `npm run lint` | Menjalankan pemeriksaan kualitas kode menggunakan ESLint. |
| `npm run preview` | Menjalankan pratinjau lokal dari berkas hasil kompilasi folder `dist/`. |

---

## 5. Struktur Direktori Proyek

```text
Dashboard-GDGoC/
├── docs/                      # Dokumentasi teknis, aturan desain, dan skema SQL Supabase
│   ├── agent.md               # Spesifikasi arsitektur kode dan ketentuan sistem
│   ├── database.md            # Kamus data dan skrip DDL SQL resmi Supabase
│   └── desain.md              # Acuan sistem desain dan palet warna GDGoC
├── public/                    # Aset statis publik (ikon, logo)
├── src/
│   ├── app/                   # Konfigurasi routing utama (AppRouter) dan pelindung peran
│   ├── components/
│   │   ├── common/            # Komponen umum (ErrorBoundary, FloatingOrnaments, PageProgressBar)
│   │   ├── layout/            # Kerangka tata letak (AppLayout, Sidebar, Footer)
│   │   └── ui/                # Komponen antarmuka atomik (Button, Input, Badge, Dialog, dll.)
│   ├── data/                  # Konteks autentikasi global dan data bersama
│   ├── lib/                   # Klien Supabase, pemformat mata uang/tanggal, helper animasi
│   ├── pages/                 # Halaman aplikasi
│   │   ├── cash/              # Modul verifikasi pembayaran kas dan pencatatan kas
│   │   ├── dashboard/         # Modul ringkasan metrik bento box
│   │   ├── events/            # Modul agenda kegiatan, absensi, dan lembar tracker
│   │   ├── login/             # Modul masuk akun pengurus
│   │   ├── members/           # Modul direktori anggota, divisi, dan detail kelulusan
│   │   └── public-payment/    # Formulir bayar kas publik (/bayar)
│   ├── styles/                # Token gaya Tailwind dan definisi animasi CSS
│   └── types/                 # Definisi tipe data TypeScript global
├── .env.example               # Template variabel lingkungan
├── package.json               # Daftar dependensi dan perintah proyek
├── tsconfig.json              # Konfigurasi TypeScript
└── vite.config.ts             # Konfigurasi Vite
```

---

## 6. Hak Cipta dan Lisensi

Dikembangkan untuk keperluan operasional **Google Developer Group on Campus (GDGoC) Universitas Sriwijaya**. Seluruh hak cipta dan merek dagang materi GDGoC adalah milik Google LLC dan komunitas terkait.
