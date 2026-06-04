// ==========================================
// 1. SELECTOR ELEMEN (PENGUMPULAN KOMPONEN)
// ==========================================
const navbarNav = document.querySelector('.navbar-nav');
const hamburger = document.querySelector('#hamburger-menu');

const searchForm = document.querySelector('.search-form');
const searchBtn = document.querySelector('#search');
const searchInput = document.querySelector('#search-input');

const shoppingCart = document.querySelector('.shopping-cart');
const cartBtn = document.querySelector('#shopping-cart-button');

const cartContainer = document.querySelector('.cart-items-container');
const totalPriceDisplay = document.querySelector('#total-price-display');

// Selector Elemen untuk Direct Checkout Multi-Step
const directCheckoutSection = document.querySelector('#direct-checkout');
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

// Selector Komponen Filter Kategori & Slider Navigasi
const categoryButtons = document.querySelectorAll('.category-btn');
const productSlider = document.querySelector('.products-slider-container');
const prevBtn = document.querySelector('#prev-slide-btn');
const nextBtn = document.querySelector('#next-slide-btn');

// Mengumpulkan seluruh kartu produk yang ada di slider
const allProductCards = document.querySelectorAll('.products-slider-container .products-card');

// Objek penampung data barang aktif yang sedang dicheckout instan
let activeDirectProduct = null;

// Data internal untuk keranjang belanja multi-item biasa (Wishlist)
let cartData = [];


// ==========================================
// 2. KONTROL INTERAKSI TOMBOL (TOGGLE MENU)
// ==========================================
if (hamburger) {
    hamburger.onclick = (e) => {
        if (navbarNav) navbarNav.classList.toggle('active');
        if (searchForm) searchForm.classList.remove('active');
        if (shoppingCart) shoppingCart.classList.remove('active');
        e.preventDefault();
    };
}

if (searchBtn) {
    searchBtn.onclick = (e) => {
        if (searchForm) {
            searchForm.classList.toggle('active');
            if (searchForm.classList.contains('active') && searchInput) { searchInput.focus(); }
        }
        if (navbarNav) navbarNav.classList.remove('active');
        if (shoppingCart) shoppingCart.classList.remove('active');
        e.preventDefault();
    };
}

if (cartBtn) {
    cartBtn.onclick = (e) => {
        if (shoppingCart) shoppingCart.classList.toggle('active');
        if (navbarNav) navbarNav.classList.remove('active');
        if (searchForm) searchForm.classList.remove('active');
        e.preventDefault();
    };
}


// ==========================================
// 3. LOGIKA UX (PENGAMAN & LINK NAVIGASI)
// ==========================================
document.addEventListener('click', function(e) {
    if (hamburger && navbarNav && !hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
    if (searchBtn && searchForm && !searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
        searchForm.classList.remove('active');
    }
    if (cartBtn && shoppingCart && 
        !cartBtn.contains(e.target) && 
        !shoppingCart.contains(e.target) && 
        !e.target.closest('.add-to-cart-btn') && 
        !e.target.closest('.buy-now-btn') && 
        !e.target.classList.contains('qty-btn') &&
        !e.target.closest('.remove-item')) {
        shoppingCart.classList.remove('active');
    }
});

document.querySelectorAll('.navbar-nav a').forEach(link => {
    link.addEventListener('click', () => { if (navbarNav) navbarNav.classList.remove('active'); });
});


// ==========================================
// 4. LOGIKA OPERASIONAL DIRECT CHECKOUT & STEP STATE
// ==========================================
function handleProductClick(card) {
    const btnData = card.querySelector('.buy-now-btn') || card.querySelector('.add-to-cart-btn');
    if (!btnData) return;
    
    const id = btnData.getAttribute('data-id');
    const name = btnData.getAttribute('data-name');
    const price = parseInt(btnData.getAttribute('data-price'));
    const img = btnData.getAttribute('data-img');
    const description = card.getAttribute('data-description') || 'Bahan premium berkualitas tinggi, sangat nyaman dipakai harian.';

    // SIMPAN DATA KE LOCALSTORAGE
    const productData = { id, name, price, img, description };
    localStorage.setItem('activeCheckoutProduct', JSON.stringify(productData));

    // PINDAH KE HALAMAN CHECKOUT Baru
    window.location.href = 'checkout.html';
}

function updateCheckoutTotal() {
    if (!activeDirectProduct) return;
    const qty = chkQtyInput ? (parseInt(chkQtyInput.value) || 1) : 1;
    const total = activeDirectProduct.price * qty;
    
    if (chkTotalDisplay1) chkTotalDisplay1.textContent = 'IDR ' + total.toLocaleString('id-ID');
    if (chkTotalDisplay2) chkTotalDisplay2.textContent = 'IDR ' + total.toLocaleString('id-ID');
}

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

const allBuyNowBtns = document.querySelectorAll('.buy-now-btn');
allBuyNowBtns.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); 
        const card = this.closest('.products-card');
        if (card) { handleProductClick(card); }
    });
});

allProductCards.forEach(card => {
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.buy-now-btn')) { 
            handleProductClick(this); 
        }
    });
});

const chkSizeButtons = document.querySelectorAll('.chk-size-btn');
chkSizeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        chkSizeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

if (directPayBtn) {
    directPayBtn.addEventListener('click', async function() {
        if (!activeDirectProduct) return;

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

        // NOTIFIKASI DISUNTIKKAN MASUK KE CHAT WA ADMIN
        const noWhatsappAdmin = "6281234567890"; // ◄ Ganti nomor WA tokomu di sini
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

            window.snap.pay(token, {
                onSuccess: function(result){
                    alert("Pembayaran Berhasil! Terima kasih telah berbelanja di NN Hijab.");
                    if (directCheckoutSection) directCheckoutSection.style.display = 'none';
                    activeDirectProduct = null;
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


// ==========================================
// 5. FITUR SEARCH BAR REAL-TIME FILTER
// ==========================================
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const keyword = e.target.value.toLowerCase().trim();
        
        categoryButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === 'all') { btn.classList.add('active'); } 
            else { btn.classList.remove('active'); }
        });

        allProductCards.forEach(card => {
            const title = card.querySelector('.products-card-title').textContent.toLowerCase();
            card.style.display = title.includes(keyword) ? 'flex' : 'none';
        });
    });
}


// ==========================================
// 6. LOGIKA FILTER KATEGORI PRODUK INTERAKTIF
// ==========================================
categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        if (searchInput) searchInput.value = '';

        const filterValue = this.getAttribute('data-filter');

        allProductCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (filterValue === 'all' || cardCategory === filterValue) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none';  
            }
        });

        if (productSlider) { productSlider.scrollLeft = 0; }
    });
});


// ==========================================
// 7. LOGIKA NAVIGASI TOMBOL PANAH SLIDER
// ==========================================
if (prevBtn && nextBtn && productSlider) {
    prevBtn.addEventListener('click', () => { productSlider.scrollLeft -= productSlider.clientWidth; });
    nextBtn.addEventListener('click', () => { productSlider.scrollLeft += productSlider.clientWidth; });
}


// ==========================================
// 8. LOGIKA TAMBAH KERANJANG BIASA (MURNI TAMPILAN WISHLIST)
// ==========================================
function renderCart() {
    if (!cartContainer) return;
    cartContainer.innerHTML = '';
    if (cartData.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart-text">Keranjang masih kosong.</p>';
        if (totalPriceDisplay) totalPriceDisplay.textContent = 'IDR 0';
        return;
    }
    let total = 0;
    cartData.forEach((item, index) => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-detail">
                <h3>${item.name}</h3>
                <div class="item-price">IDR ${item.price.toLocaleString('id-ID')} (Qty: ${item.quantity})</div>
            </div>
            <i data-feather="trash-2" class="remove-item" onclick="removeFromCart(${index})"></i>
        `;
        cartContainer.appendChild(cartItem);
    });
    if (totalPriceDisplay) totalPriceDisplay.textContent = 'IDR ' + total.toLocaleString('id-ID');
    if (typeof feather !== 'undefined') feather.replace();
}

document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); 
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseInt(this.getAttribute('data-price'));
        const img = this.getAttribute('data-img');
        const existing = cartData.find(item => item.id === id);
        if (existing) { existing.quantity += 1; } else { cartData.push({ id, name, price, img, quantity: 1 }); }
        renderCart();
        if (shoppingCart) shoppingCart.classList.add('active');
    });
});

window.removeFromCart = function(index) { cartData.splice(index, 1); renderCart(); };

renderCart();