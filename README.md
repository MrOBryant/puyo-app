# PUYO App — Prototype

Prototype konsep aplikasi PUYO untuk tugas Strategic Management (rekomendasi strategi Market Penetration).
**Bukan aplikasi resmi PUYO.** Pesanan, pembayaran, rider, dan poin hanya simulasi; data tersimpan di perangkat pengguna saja.
Logo, foto produk, dan daftar gerai diambil dari puyodesserts.com untuk keperluan tugas.

## Chatbot WhatsApp PUYO Member (prototype)

Live: https://mrobryant.github.io/puyo-app/chat.html (HP & laptop; di laptop tampil seperti WhatsApp Web).

`chat.html` + `chat.css` + `chat.js` adalah prototype chatbot WhatsApp "PUYO Group" untuk Loyalty Membership Program (bab 3.2.2 paper).

- **Daftar member di chat**: persetujuan data (UU PDP 27/2022) → nama (hanya huruf) → tanggal lahir (ketik bebas, mis. `19/11/2001` / `19 November 2001`, atau pilih kalender).
- **Hadiah ulang tahun real-time**: tanggal lahir dicocokkan dengan tanggal hari ini di perangkat. Kalau sama, member langsung dapat voucher 1 PUYO gratis untuk diklaim di gerai terdekat (sekali per tahun; dicek ulang otomatis tiap kali chat dibuka).
- **Diskon member 10%**: voucher otomatis tiap bulan, 1x pakai, khusus Silky Desserts, tidak bisa digabung promo lain.
- **Stamp**: 1 transaksi di gerai = 1 stamp, 5 stamp = 1 PUYO gratis. Klik kartu stamp untuk pop-up berisi tanggal, gerai, item, dan total tiap transaksi.
- **Tanya bebas** (bahasa apa pun untuk sapaan: halo, hi, hola, こんにちは, 안녕하세요, dll.): varian produk bergambar, harga, lokasi gerai (bisa kirim lokasi), hampers, promo bulan berjalan, PUYOTEIN. Ketik angka 1–8 untuk menu cepat.
- Menu ⋮ → **Simulasi kasir** untuk mencatat pembelian di gerai (stamp, diskon 10%, voucher).

Bot berbasis aturan (bukan AI) dan tanpa server: setiap perangkat menyimpan datanya sendiri (nama, stamp, voucher) di browser, dan tab yang terbuka di perangkat yang sama ikut tersinkron. Isi hampers dan promo bulanan bersifat ilustrasi. Bukan akun resmi PUYO.
