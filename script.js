document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 🛒 1. SEPET (SHOPPING CART) MANTIĞI
    // ==========================================


    if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Sayfa yüklendiğinde en yukarıya kaydırır
window.onload = () => {
    window.scrollTo(0, 0);
};
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    let discountApplied = 0; // İndirim yüzdesi

    const toggleCart = () => {
        if(!cartSidebar) return;
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    };

    if(cartIconBtn) cartIconBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    const parsePrice = (priceStr) => parseInt(priceStr.replace(/[^0-9]/g, ''));

    const renderCart = () => {
        if(!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; margin-top: 20px;">Sepetiniz boş.</p>';
            cartCountElement.textContent = '0';
            cartTotalPrice.textContent = '0 TL';
            return;
        }

        cart.forEach(item => {
            const itemTotal = parsePrice(item.price) * item.quantity;
            total += itemTotal;
            count += item.quantity;

            const cartItemHTML = `
                <div class="cart-item" style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                    <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; margin-right: 15px;">
                    <div class="cart-item-details" style="flex-grow: 1;">
                        <div class="cart-item-title" style="font-weight: bold;">${item.name}</div>
                        <div class="cart-item-price" style="color: #8b5cf6;">${item.price}</div>
                        <div class="cart-item-controls" style="display: flex; gap: 10px; align-items: center; margin-top: 5px;">
                            <button onclick="updateCartQuantity('${item.id}', -1)" style="width: 25px; height: 25px; cursor: pointer;">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', 1)" style="width: 25px; height: 25px; cursor: pointer;">+</button>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: red; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        cartCountElement.textContent = count;
        
        let finalTotal = total;
        if (discountApplied > 0) {
            finalTotal = total - (total * (discountApplied / 100));
        }
        
        cartTotalPrice.textContent = finalTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' TL';
    };

    window.updateCartQuantity = (id, change) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            renderCart();
        }
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        renderCart();
    };

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            
            const product = {
                id: card.getAttribute('data-product-id'),
                name: card.getAttribute('data-product-name'),
                img: card.getAttribute('data-product-img'),
                price: card.getAttribute('data-product-price'),
                quantity: 1
            };

            const existingItem = cart.find(i => i.id === product.id);
            if (existingItem) existingItem.quantity += 1;
            else cart.push(product);

            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            renderCart();

            const originalText = this.textContent;
            this.textContent = 'Eklendi!';
            this.style.backgroundColor = '#8b5cf6';
            this.style.color = 'white';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = 'transparent';
                this.style.color = '#8b5cf6';
            }, 1500);

            if(!cartSidebar.classList.contains('active')) toggleCart();
        });
    });

    const discountCodeInput = document.getElementById('discount-code-input');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    const discountMessage = document.getElementById('discount-message');

    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountCodeInput.value.trim().toUpperCase();
            const savedDiscount = JSON.parse(localStorage.getItem('gameDiscount') || 'null');

            if (savedDiscount && code === savedDiscount.code) {
                discountApplied = savedDiscount.discount;
                discountMessage.textContent = `%${discountApplied} İndirim Uygulandı!`;
                discountMessage.style.color = '#10b981';
                discountMessage.style.display = 'block';
                renderCart();
            } else if (code === '') {
                discountApplied = 0;
                discountMessage.style.display = 'none';
                renderCart();
            } else {
                discountApplied = 0;
                discountMessage.textContent = 'Geçersiz İndirim Kodu';
                discountMessage.style.color = '#ef4444';
                discountMessage.style.display = 'block';
                renderCart();
            }
        });
    }

    renderCart();
});
    // ==========================================
    // 🔐 2. GİRİŞ YAP & KAYIT OL (KULLANICI SİSTEMİ)
    // ==========================================
    const userBtn = document.getElementById('user-btn'); 
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const userNameDisplay = document.getElementById('user-name-display');
    const userDropdown = document.getElementById('user-dropdown');
    const adminPanelLink = document.getElementById('admin-panel-link');
    const navLogoutBtn = document.getElementById('nav-logout-btn');

    const checkLoginState = () => {
        const loggedInUser = sessionStorage.getItem('userName');
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

        if (loggedInUser && userNameDisplay && userDropdown) {
            userNameDisplay.textContent = loggedInUser.split(' ')[0];
            userNameDisplay.style.display = 'inline';
            if(isAdmin && adminPanelLink) adminPanelLink.style.display = 'block';
            loadFavorites();
        } else if (userNameDisplay && userDropdown) {
            userNameDisplay.style.display = 'none';
            userDropdown.classList.remove('active');
            clearFavoritesUI();
        }
    };

    const clearFavoritesUI = () => {
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.classList.remove('active');
            const icon = btn.querySelector('i');
            if(icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
        });
    };

    const loadFavorites = () => {
        const userEmail = sessionStorage.getItem('userEmail');
        if(!userEmail) return;
        
        const favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.getAttribute('data-product-id');
            const favBtn = card.querySelector('.btn-favorite');
            if(!favBtn) return;
            const icon = favBtn.querySelector('i');
            
            if(favorites.some(f => f.id === productId)) {
                favBtn.classList.add('active');
                icon.classList.remove('far'); icon.classList.add('fas');
            } else {
                favBtn.classList.remove('active');
                icon.classList.remove('fas'); icon.classList.add('far');
            }
        });
    };
    checkLoginState();

    if(userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (sessionStorage.getItem('userName')) userDropdown.classList.toggle('active');
            else authModal.classList.add('active');
        });
    }

    if(navLogoutBtn) {
        navLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            checkLoginState();
            window.location.href = 'index.html';
        });
    }

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }

    if(tabLogin && tabSignup) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active'); tabSignup.classList.remove('active');
            formLogin.classList.add('active'); formSignup.classList.remove('active');
        });
        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active'); tabLogin.classList.remove('active');
            formSignup.classList.add('active'); formLogin.classList.remove('active');
        });
    }

    const showMessage = (msg, isError = false) => {
        const authMessage = document.getElementById('auth-message');
        if(!authMessage) return;
        authMessage.textContent = msg;
        authMessage.style.display = 'block';
        authMessage.style.color = isError ? '#ef4444' : '#10b981';
    };

    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('http://localhost:8082/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                if(response.ok) {
                    showMessage(data.message, false);
                    sessionStorage.setItem('userName', data.user_name);
                    sessionStorage.setItem('userEmail', data.user_email);
                    sessionStorage.setItem('isAdmin', data.is_admin);
                    
                    setTimeout(() => {
                        authModal.classList.remove('active');
                        formLogin.reset();
                        document.getElementById('auth-message').style.display = 'none';
                        checkLoginState();
                    }, 1000);
                } else {
                    showMessage(data.detail, true);
                }
            } catch (err) {
                showMessage('Sunucu kapalı. Lütfen Python sunucusunu çalıştırın.', true);
            }
        });
    }

    if(formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                const response = await fetch('http://localhost:8082/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                if(response.ok) {
                    showMessage(data.message, false);
                    setTimeout(() => {
                        tabLogin.click();
                        document.getElementById('auth-message').style.display = 'none';
                        formSignup.reset();
                    }, 1500);
                } else {
                    showMessage(data.detail, true);
                }
            } catch (err) {
                showMessage('Sunucu kapalı. Lütfen Python sunucusunu çalıştırın.', true);
            }
        });
    }

    // ==========================================
    // ❤️ 3. FAVORİYE EKLE (KALP) İŞLEMLERİ
    // ==========================================
    const favoriteBtns = document.querySelectorAll('.btn-favorite');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userEmail = sessionStorage.getItem('userEmail');
            if(!userEmail) {
                alert('Favorilere eklemek için önce giriş yapmalısınız.');
                authModal.classList.add('active');
                return;
            }

            const card = e.target.closest('.product-card');
            const product = {
                id: card.getAttribute('data-product-id'),
                name: card.getAttribute('data-product-name'),
                img: card.getAttribute('data-product-img'),
                price: card.getAttribute('data-product-price')
            };

            let favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
            const existingIndex = favorites.findIndex(f => f.id === product.id);
            if(existingIndex > -1) favorites.splice(existingIndex, 1);
            else favorites.push(product);
            
            localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(favorites));
            loadFavorites();
        });
    });

// ==========================================
// 🗂️ 5. ÜST MENÜ (KATEGORİ FİLTRELEME) MANTIĞI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const categoryLinks = document.querySelectorAll('.nav-links a[data-filter]');
    const allProducts = document.querySelectorAll('.product-card');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Sayfanın aniden yukarı atmasını engeller
            
            const filterValue = e.target.getAttribute('data-filter');

            // Menüdeki "aktif" (mor çizgi) durumunu tıklanan butona geçir
            categoryLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            // Ekranı yumuşak bir kaydırma efektiyle Ürünler kısmına indir
            document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });

            // Ürünleri tek tek kontrol et ve filtrele
            allProducts.forEach(product => {
                const categoryText = product.querySelector('.category').textContent.trim();
                
                if (filterValue === 'all') {
                    product.style.display = 'block'; // Anasayfada hepsini geri getir
                } else if (categoryText === filterValue) {
                    product.style.display = 'block'; // Kategori eşleşiyorsa göster
                } else {
                    product.style.display = 'none';  // Diğerlerini gizle
                }
            });
        });
    });
});