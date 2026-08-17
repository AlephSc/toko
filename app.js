const products = [
    { id: 1, name: 'Produk Digital 1', price: 50000 },
    { id: 2, name: 'Produk Digital 2', price: 100000 }
];
let cart = [];

function renderProducts() {
    document.getElementById('product-list').innerHTML = products.map(p => `
        <div class="product">
            <h3>${p.name}</h3>
            <p>Rp ${p.price.toLocaleString()}</p>
            <button onclick="addToCart(${p.id})">Tambah ke Keranjang</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    renderCart();
}

function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-items').innerHTML = `
        ${cart.map(item => `<p>${item.name} - Rp ${item.price.toLocaleString()}</p>`).join('')}
        <p><strong>Total: Rp ${total.toLocaleString()}</strong></p>
    `;
}

document.getElementById('checkout-btn').addEventListener('click', () => {
    // ponytail: payment gateway integration (Midtrans/Xendit/DOKU). Add when ready for production.
    alert('Integrasi payment gateway: kirim data ke server, buat transaksi, redirect ke halaman pembayaran.');
});

renderProducts();
