import { apiFetch, euro } from '../auth-client.js';

const productList = document.querySelector('#product-list');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const message = document.querySelector('#shop-message');
let savedCart = [];
try { savedCart = JSON.parse(localStorage.getItem('andrews-gym-cart') || '[]'); } catch { savedCart = []; }
const cart = new Map(Array.isArray(savedCart) ? savedCart.filter((item) => Array.isArray(item) && typeof item[0] === 'string' && Number.isSafeInteger(item[1]) && item[1] > 0) : []);
let products = [];

function renderCart() {
  cartItems.replaceChildren();
  let total = 0;
  if (!cart.size) {
    const empty = document.createElement('p'); empty.className = 'portal-muted'; empty.textContent = 'Your bag is empty.'; cartItems.append(empty);
  }
  localStorage.setItem('andrews-gym-cart', JSON.stringify([...cart]));
  for (const [id, quantity] of cart) {
    const product = products.find((item) => item.id === id);
    if (!product) continue;
    total += product.price_cents * quantity;
    const row = document.createElement('div'); row.className = 'cart-row';
    const name = document.createElement('span'); name.textContent = `${product.name} × ${quantity}`;
    const price = document.createElement('strong'); price.textContent = euro(product.price_cents * quantity);
    row.append(name, price); cartItems.append(row);
  }
  cartTotal.textContent = euro(total);
  checkoutButton.disabled = cart.size === 0;
}

function renderProducts() {
  productList.replaceChildren();
  if (!products.length) {
    const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = 'No products listed yet. Check back soon.'; productList.append(empty); return;
  }
  for (const product of products) {
    const card = document.createElement('article'); card.className = 'product-card';
    const image = document.createElement('div'); image.className = 'product-image'; image.textContent = 'ANDREWS GYM';
    if (product.image_url && /^https:\/\//i.test(product.image_url)) image.style.backgroundImage = `url("${product.image_url.replace(/["\\]/g, '')}")`;
    const details = document.createElement('div'); details.className = 'product-details';
    const category = document.createElement('span'); category.className = 'product-category'; category.textContent = product.category;
    const name = document.createElement('h2'); name.textContent = product.name;
    const description = document.createElement('p'); description.textContent = product.description || 'Gym training essential.';
    const bottom = document.createElement('div'); bottom.className = 'product-bottom';
    const price = document.createElement('strong'); price.className = 'product-price'; price.textContent = euro(product.price_cents);
    const add = document.createElement('button'); add.className = 'mini-button'; add.type = 'button'; add.textContent = product.stock > 0 ? 'ADD TO BAG +' : 'SOLD OUT'; add.disabled = product.stock <= 0;
    add.addEventListener('click', () => { cart.set(product.id, Math.min(product.stock, (cart.get(product.id) || 0) + 1)); renderCart(); });
    bottom.append(price, add); details.append(category, name, description, bottom); card.append(image, details); productList.append(card);
  }
}

checkoutButton.addEventListener('click', async () => {
  message.classList.remove('error'); message.textContent = 'Preparing checkout…';
  try {
    const data = await apiFetch('/api/checkout', { method: 'POST', body: JSON.stringify({ items: [...cart].map(([productId, quantity]) => ({ productId, quantity })) }) });
    if (data.url) location.href = data.url;
  } catch (error) { message.classList.add('error'); message.textContent = error.message; }
});

try {
  const data = await apiFetch('/api/products'); products = data.products || [];
  for (const [id, quantity] of cart) { const product = products.find((item) => item.id === id); if (!product || product.stock < 1) cart.delete(id); else if (quantity > product.stock) cart.set(id, product.stock); }
  renderProducts(); renderCart();
}
catch (error) { productList.textContent = error.message; }
