// ==========================================
// 1. SELECTOR ELEMEN DI HALAMAN CHECKOUT
// ==========================================
const chkImg = document.querySelector('#checkout-img');
const chkTitle = document.querySelector('#checkout-title');
const chkPrice = document.querySelector('#checkout-price');
const chkDesc = document.querySelector('#checkout-desc');
const directPayBtn = document.querySelector('#direct-pay-btn');

// Selector ID Total Display Tahap 1 & Tahap 2
const chkTotalDisplay1 = document.querySelector('#checkout-total-display-1');
const chkTotalDisplay2 = document.querySelector('#checkout-total-display-2');

// Selector Kontrol Jumlah Beli (Kuantitas)
const chkQtyInput = document.querySelector('#chk-qty-input');
const chkQtyMinus = document.querySelector('.chk-qty-control .minus');
const chkQtyPlus = document.querySelector('.chk-qty-control .plus');

// Selector Pengontrol State Tahap (Step Wizard)
const chkStep1Container = document.querySelector('#chk-step-1');
const chkStep2Container = document.querySelector('#chk-step-2');
const nextStepBtn = document.querySelector('#next-step-btn');
const backStepBtn = document.querySelector('#back-step-btn');

// Selector Kolom Form Data Pengiriman Tahap 2
const chkNameInput = document.querySelector('#chk-name');
const chkEmailInput = document.querySelector('#chk-email');
const chkPhoneInput = document.querySelector('#chk-phone');
const chkAddressInput = document.querySelector('#chk-address');
const chkLocationInput = document.querySelector('#chk-location');
const getGpsBtn = document.querySelector('#get-gps-btn');

// Objek penampung data barang aktif yang diambil dari localStorage
let activeDirectProduct = null;

// ==========================================
// 2. INITIALIZATION: AMBIL DATA DARI MEMORI
// ==========================================
function initCheckout() {
    const savedData = localStorage.getItem('activeCheckoutProduct');
    
    // Pengaman jika pembeli iseng langsung masuk ke checkout.html tanpa pilih produk
    if (!savedData) {
        alert('Anda belum memilih produk untuk dibeli.');
        window.location.href = 'index.html';
        return;
    }

    activeDirectProduct = JSON.parse(savedData);

    // Render data produk ke element HTML
    if (chkImg) chkImg.src = activeDirectProduct.img;
    if (chkTitle) chkTitle.textContent = activeDirectProduct.name;
    if (chkPrice) chkPrice.textContent = 'IDR ' + activeDirectProduct.price.toLocaleString('id-ID');
    if (chkDesc) chkDesc.textContent = activeDirectProduct.description;

    // Reset Default State View
    if (chkQtyInput) chkQtyInput.value = 1;
    if (chkStep1Container) chkStep1Container.style.display = 'block';
    if (chkStep2Container) chkStep2Container.style.display = 'none';
    
    updateCheckoutTotal();
}

// ==========================================
// 3. LOGIKA HITUNG TOTAL TAGIHAN
// ==========================================
function updateCheckoutTotal() {
    if (!activeDirectProduct) return;
    const qty = chkQtyInput ? (parseInt(chkQtyInput.value) || 1) : 1;
    const total = activeDirectProduct.price * qty;
    
    if (chkTotalDisplay1) chkTotalDisplay1.textContent = 'IDR ' + total.toLocaleString('id-ID');
    if (chkTotalDisplay2) chkTotalDisplay2.textContent = 'IDR ' + total.toLocaleString('id-ID');
}

// Kuantitas Plus & Minus Listener
if (chkQtyMinus) {
    chkQtyMinus.addEventListener('click', () => {
        let currentQty = parseInt(chkQtyInput.value) || 1;
        if (currentQty > 1) { chkQtyInput.value = currentQty - 1; updateCheckoutTotal(); }
    });
}
if (chkQtyPlus) {
    chkQtyPlus.addEventListener('click', () => {
        let currentQty = parseInt(chkQtyInput.value) || 1;
        chkQtyInput.value = currentQty + 1; updateCheckoutTotal();
    });
}

// Selector Variasi Ukuran (Size)
const chkSizeButtons = document.querySelectorAll('.chk-size-btn');
chkSizeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        chkSizeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==========================================
// 4. ROUTING ANTAR TAHAPAN (WIZARD STEP)
// ==========================================
if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
        if (chkStep1Container) chkStep1Container.style.display = 'none';
        if (chkStep2Container) chkStep2Container.style.display = 'block';
        if (typeof feather !== 'undefined') feather.replace();
    });
}

if (backStepBtn) {
    backStepBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (chkStep2Container) chkStep2Container.style.display = 'none';
        if (chkStep1Container) chkStep1Container.style.display = 'block';
    });
}

// ==========================================
// 5. PELACAK KOORDINAT GPS HP CUSTOMER
// ==========================================
if (getGpsBtn && chkLocationInput) {
    getGpsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.geolocation) {
            chkLocationInput.placeholder = "Sedang melacak posisi koordinat GPS...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    chkLocationInput.value = `Latitude: ${lat}, Longitude: ${lon}`;
                },
                (error) => {
                    alert("Akses GPS ditolak. Silakan isi lokasi patokan secara manual.");
                    chkLocationInput.placeholder = "Patokan Rumah atau Koordinat GPS";
                }
            );
        } else {
            alert("Browser Anda tidak mendukung fitur pelacakan lokasi otomatis.");
        }
    });
}

// ==========================================
// 6. SUBMIT FINAL: WHATSAPP + MIDTRANS API
// ==========================================
if (directPayBtn) {
    directPayBtn.addEventListener('click', async function() {
        if (!activeDirectProduct) return;

        // Validasi inputan form agar tidak ada yang kosong
        const name = chkNameInput ? chkNameInput.value.trim() : "";
        const email = chkEmailInput ? chkEmailInput.value.trim() : "";
        const phone = chkPhoneInput ? chkPhoneInput.value.trim() : "";
        const address = chkAddressInput ? chkAddressInput.value.trim() : "";
        const location = chkLocationInput ? chkLocationInput.value.trim() : "";

        if (!name || !phone || !address || !location) {
            alert("Mohon lengkapi seluruh Data Pengiriman terlebih dahulu!");
            return;
        }

        const selectedSizeBtn = document.querySelector('.chk-size-btn.active');
        const finalSize = selectedSizeBtn ? selectedSizeBtn.getAttribute('data-size') : 'Standard';
        const finalQty = chkQtyInput ? (parseInt(chkQtyInput.value) || 1) : 1;
        const finalTotal = activeDirectProduct.price * finalQty;

        // ALUR KIRIM DATA OTOMATIS KE WHATSAPP ADMIN
        const noWhatsappAdmin = "6281234567890"; // ◄ Ganti pakai nomor WhatsApp Admin tokomu asli
        const teksPesanWa = `*NOTIFIKASI ORDERAN BARU - NN HIJAB*\n\n` +
                            `*--- DETAIL PRODUK ---*\n` +
                            `• Nama Barang : ${activeDirectProduct.name}\n` +
                            `• Ukuran      : ${finalSize}\n` +
                            `• Jumlah      : ${finalQty} pcs\n` +
                            `• Total Bayar : IDR ${finalTotal.toLocaleString('id-ID')}\n\n` +
                            `*--- DATA PENGIRIMAN CUSTOMER ---*\n` +
                            `• Nama Pembeli: ${name}\n` +
                            `• No. HP/WA   : ${phone}\n` +
                            `• Email       : ${email || '-'}\n` +
                            `• Alamat      : ${address}\n` +
                            `• Lokasi/GPS  : ${location}\n\n` +
                            `_Pesan otomatis dikirim oleh sistem saat customer membuka menu pembayaran Midtrans._`;

        const linkWhatsappUrl = `https://api.whatsapp.com/send?phone=${noWhatsappAdmin}&text=${encodeURIComponent(teksPesanWa)}`;
        window.open(linkWhatsappUrl, '_blank');

        // INTEGRASI TEMBAK TOKEN KE SERVER NODE.JS BACKEND PORT 5000
        const checkoutPayload = {
            items: [{
                id: activeDirectProduct.id,
                name: `${activeDirectProduct.name} (${finalSize})`,
                price: activeDirectProduct.price,
                quantity: finalQty,
                img: activeDirectProduct.img
            }],
            total: finalTotal,
            customer: { name, email, phone, address, location }
        };

        try {
            const response = await fetch('http://localhost:5000/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutPayload)
            });

            if (!response.ok) { throw new Error('Gagal menghubungi mesin backend Node.js.'); }

            const data = await response.json();
            const token = data.token;

            if (!token) { alert('Gagal mendapatkan kode transaksi dari Midtrans Sandbox.'); return; }

            // Panggil Pop-up Snap Midtrans Sandbox Resmi
            window.snap.pay(token, {
                onSuccess: function(result){
                    alert("Pembayaran Berhasil! Terima kasih telah berbelanja di NN Hijab.");
                    localStorage.removeItem('activeCheckoutProduct'); // Bersihkan memori belanja
                    window.location.href = 'index.html'; // Kembalikan ke halaman beranda
                },
                onPending: function(result){ alert("Menunggu penyelesaian pembayaran tagihan Anda."); },
                onError: function(result){ alert("Proses pembayaran gagal."); }
            });

        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan teknis pada server pembayaran.');
        }
    });
}

// Jalankan fungsi inisialisasi otomatis saat dokumen halaman siap dibuka
document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
    if (typeof feather !== 'undefined') feather.replace();
});