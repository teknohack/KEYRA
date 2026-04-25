document.addEventListener('DOMContentLoaded', () => {
    // Tarayıcıdan giriş yapan kişinin bilgilerini çek
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    // Eğer giriş yapılmamışsa uyar ve anasayfaya at
    if (!userEmail) {
        alert('Bu sayfayı görüntülemek için giriş yapmalısınız.');
        window.location.href = 'index.html';
        return;
    }

    // Profil Sayfasındaki sol panele isim ve maili yazdır
    document.getElementById('display-name').textContent = userName;
    document.getElementById('display-email').textContent = userEmail;

    const favoritesContainer = document.getElementById('favorites-container');

    // Favorileri Yükleyen Fonksiyon
    const loadProfileFavorites = () => {
        // Bu kişiye özel favori listesini bul
        const favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p style="grid-column: 1/-1; color: #6b7280;">Henüz favorilere eklediğiniz bir ürün bulunmuyor.</p>';
            return;
        }

        favoritesContainer.innerHTML = '';
        favorites.forEach(product => {
            const card = document.createElement('div');
            card.className = 'fav-card';
            card.innerHTML = `
                <button class="btn-remove-fav" onclick="removeFavorite('${product.id}')" title="Favorilerden Çıkar">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${product.img}" alt="${product.name}">
                <h4>${product.name}</h4>
                <div class="price">${product.price}</div>
            `;
            favoritesContainer.appendChild(card);
        });
    };

    // Çarpıya basıldığında ürünü favorilerden çıkaran fonksiyon
    window.removeFavorite = (productId) => {
        let favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
        favorites = favorites.filter(f => f.id !== productId);
        localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(favorites));
        loadProfileFavorites(); // Listeyi yenile
    };

    // Sayfa açıldığında favorileri yükle
    loadProfileFavorites();
});
