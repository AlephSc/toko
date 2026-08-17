let currentUser = null;
let cart = [];

async function checkAuth() {
    try {
        const res = await fetch('/api/me');
        if (res.ok) {
            currentUser = await res.json();
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'flex';
            document.getElementById('username-display').textContent = currentUser.username;
        }
    } catch (e) {}
}

async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    document.getElementById('product-list').innerHTML = products.map(p => `
        <div class="product">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p class="price">Rp ${p.price.toLocaleString()}</p>
            <p>Stok: ${p.stock}</p>
            <button onclick="addToCart(${p.id})">Tambah ke Keranjang</button>
        </div>
    `).join('');
}

async function addToCart(productId) {
    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
    });
    if (res.ok) {
        const data = await res.json();
        cart = data.cart;
        renderCart();
    }
}

async function removeFromCart(productId) {
    const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
    if (res.ok) {
        const data = await res.json();
        cart = data.cart;
        renderCart();
    }
}

function renderCart() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-items').innerHTML = cart.length === 0 
        ? '<p>Keranjang kosong</p>'
        : cart.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>${item.quantity} x Rp ${item.price.toLocaleString()}</p>
                </div>
                <button onclick="removeFromCart(${item.productId})">Hapus</button>
            </div>
        `).join('') + `<p style="margin-top: 1rem;"><strong>Total: Rp ${total.toLocaleString()}</strong></p>`;
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu');
        showAuthModal('login');
        return;
    }
    if (cart.length === 0) {
        alert('Keranjang kosong');
        return;
    }
    const res = await fetch('/api/checkout', { method: 'POST' });
    if (res.ok) {
        const data = await res.json();
        alert(`Order berhasil! Order ID: ${data.orderId}\nTotal: Rp ${data.total.toLocaleString()}\n\nPembayaran akan diproses melalui payment gateway.`);
        cart = [];
        renderCart();
    } else {
        alert('Checkout gagal. Silakan coba lagi.');
    }
});

function showAuthModal(mode) {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('auth-title').textContent = mode === 'login' ? 'Login' : 'Register';
    document.getElementById('email').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('auth-submit').onclick = () => submitAuth(mode);
}

async function submitAuth(mode) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    
    const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
    });
    
    if (res.ok) {
        document.getElementById('auth-modal').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('email').value = '';
        await checkAuth();
        await loadCart();
    } else {
        const error = await res.json();
        document.getElementById('auth-error').textContent = error.error;
    }
}

async function loadCart() {
    const res = await fetch('/api/cart');
    if (res.ok) {
        cart = await res.json();
        renderCart();
    }
}

document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('login');
});

document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal('register');
});

document.getElementById('logout-link').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    cart = [];
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('user-section').style.display = 'none';
    renderCart();
});

document.getElementById('auth-cancel').addEventListener('click', () => {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-error').textContent = '';
});

checkAuth();
loadProducts();
loadCart();
