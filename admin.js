document.addEventListener('DOMContentLoaded', () => {
    // Güvenlik: Sadece admin giriş yaptıysa bu sayfayı aç, yoksa kışkışla!
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('user-table-body');
    const totalUsersSpan = document.getElementById('total-users');

    // Python sunucusundan kullanıcı listesini çeken fonksiyon
    const loadUsers = async () => {
        try {
            const response = await fetch('http://localhost:8082/api/admin/users');
            if (response.ok) {
                const users = await response.json();
                totalUsersSpan.textContent = users.length;
                
                if (users.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Henüz kayıtlı kullanıcı yok.</td></tr>';
                    return;
                }

                tableBody.innerHTML = '';
                users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>#${user.id}</td>
                        <td style="font-weight: bold;">${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="${user.is_admin ? 'badge-admin' : 'badge-user'}">${user.is_admin ? 'Yönetici' : 'Müşteri'}</span></td>
                        <td>
                            ${!user.is_admin ? `<button class="btn-delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Sil</button>` : '<span style="color: #9ca3af; font-size: 0.8rem;">Silinemez</span>'}
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Veriler çekilirken hata oluştu. Sunucu açık mı?</td></tr>';
        }
    };

    // Sil butonuna basıldığında kişiyi veritabanından silecek fonksiyon
    window.deleteUser = async (userId) => {
        if (confirm('Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`http://localhost:8082/api/admin/users/${userId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('Kullanıcı başarıyla silindi.');
                    loadUsers(); // Listeyi güncelle
                } else {
                    alert('Silme işlemi başarısız.');
                }
            } catch (error) {
                alert('Sunucu hatası!');
            }
        }
    };

    // Sayfa açıldığında kullanıcıları yükle
    loadUsers();
});
