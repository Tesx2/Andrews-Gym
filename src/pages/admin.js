import { authClient, apiFetch, euro } from '../auth-client.js';

const message = document.querySelector('#admin-message');
document.querySelector('#sign-out').addEventListener('click', async (event) => { event.preventDefault(); await authClient.signOut(); location.href = 'index.html'; });
const escapeText = (value) => value == null ? '' : String(value);

function makeSelect(values, selected) {
  const select = document.createElement('select');
  for (const [value, label] of values) { const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = value === (selected || ''); select.append(option); }
  return select;
}

async function loadDashboard() {
  const [stats, members, products, orders] = await Promise.all([
    apiFetch('/api/admin/stats'), apiFetch('/api/admin/members'), apiFetch('/api/admin/products'), apiFetch('/api/admin/orders')
  ]);
  document.querySelector('#admin-welcome').textContent = 'Review member status, update plans, and keep the shop catalogue current.';
  const statList = [['Total members', stats.members], ['Active', stats.active], ['Pending', stats.pending], ['Shop products', stats.products]];
  const statRoot = document.querySelector('#admin-stats'); statRoot.replaceChildren();
  for (const [label, value] of statList) { const box = document.createElement('div'); box.className = 'portal-stat'; const span = document.createElement('span'); span.textContent = label; const strong = document.createElement('strong'); strong.textContent = value; box.append(span, strong); statRoot.append(box); }
  const memberRoot = document.querySelector('#member-rows'); memberRoot.replaceChildren();
  if (!members.members.length) { const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 7; cell.textContent = 'No member accounts yet.'; row.append(cell); memberRoot.append(row); }
  for (const member of members.members) {
    const row = document.createElement('tr');
    const identity = document.createElement('td'); identity.textContent = `${escapeText(member.name)} · ${escapeText(member.email)}`;
    const planCell = document.createElement('td'); const plan = makeSelect([['','No plan'],['Essential','Essential'],['Plus','Plus'],['Complete','Complete']], member.plan); planCell.append(plan);
    const statusCell = document.createElement('td'); const status = makeSelect([['pending','Pending'],['active','Active'],['paused','Paused'],['cancelled','Cancelled']], member.status); statusCell.append(status);
    const startCell = document.createElement('td'); const start = document.createElement('input'); start.type = 'date'; start.value = member.start_date || ''; startCell.append(start);
    const endCell = document.createElement('td'); const end = document.createElement('input'); end.type = 'date'; end.value = member.end_date || ''; endCell.append(end);
    const visitsCell = document.createElement('td'); visitsCell.textContent = String(member.visits ?? 0); const checkIn = document.createElement('button'); checkIn.className = 'mini-button'; checkIn.type = 'button'; checkIn.textContent = '+ VISIT'; checkIn.addEventListener('click', async () => { try { await apiFetch(`/api/admin/members/${encodeURIComponent(member.id)}/check-ins`, { method: 'POST', body: '{}' }); await loadDashboard(); } catch (error) { message.textContent = error.message; } }); visitsCell.append(document.createElement('br'), checkIn);
    const saveCell = document.createElement('td'); const save = document.createElement('button'); save.className = 'mini-button'; save.type = 'button'; save.textContent = 'SAVE';
    save.addEventListener('click', async () => { save.disabled = true; try { await apiFetch(`/api/admin/members/${encodeURIComponent(member.id)}`, { method: 'PATCH', body: JSON.stringify({ plan: plan.value || null, status: status.value, startDate: start.value || null, endDate: end.value || null }) }); save.textContent = 'SAVED'; } catch (error) { message.textContent = error.message; save.disabled = false; } });
    saveCell.append(save); row.append(identity, planCell, statusCell, startCell, endCell, visitsCell, saveCell); memberRoot.append(row);
  }
  const productRoot = document.querySelector('#product-rows'); productRoot.replaceChildren();
  if (!products.products.length) { const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 5; cell.textContent = 'No products listed.'; row.append(cell); productRoot.append(row); }
  for (const product of products.products) {
    const row = document.createElement('tr');
    const name = document.createElement('td'); name.textContent = product.name;
    const price = document.createElement('td'); const priceInput = document.createElement('input'); priceInput.type = 'number'; priceInput.min = '0'; priceInput.step = '0.01'; priceInput.value = (product.price_cents / 100).toFixed(2); price.append(priceInput);
    const stock = document.createElement('td'); const stockInput = document.createElement('input'); stockInput.type = 'number'; stockInput.min = '0'; stockInput.step = '1'; stockInput.value = product.stock; stock.append(stockInput);
    const visibility = document.createElement('td'); const pill = document.createElement('span'); pill.className = 'status-pill'; pill.textContent = product.active ? 'Visible' : 'Hidden'; visibility.append(pill);
    const actionCell = document.createElement('td'); const save = document.createElement('button'); save.className = 'mini-button'; save.type = 'button'; save.textContent = 'SAVE'; save.addEventListener('click', async () => { await apiFetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: 'PATCH', body: JSON.stringify({ priceCents: Math.round(Number(priceInput.value) * 100), stock: Number(stockInput.value) }) }); await loadDashboard(); }); const button = document.createElement('button'); button.className = 'mini-button'; button.type = 'button'; button.textContent = product.active ? 'HIDE' : 'SHOW'; button.addEventListener('click', async () => { await apiFetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: 'PATCH', body: JSON.stringify({ active: !product.active }) }); await loadDashboard(); }); actionCell.append(save, document.createElement('br'), button);
    row.append(name, price, stock, visibility, actionCell); productRoot.append(row);
  }
  const orderRoot = document.querySelector('#order-rows'); orderRoot.replaceChildren();
  if (!orders.orders.length) { const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 5; cell.textContent = 'No orders yet. Connect payment and delivery setup to start selling.'; row.append(cell); orderRoot.append(row); }
  for (const order of orders.orders) { const row = document.createElement('tr'); [order.id.slice(0,8), order.email, order.items || '—', euro(order.total_cents), order.status].forEach((value) => { const cell = document.createElement('td'); cell.textContent = escapeText(value); row.append(cell); }); orderRoot.append(row); }
}

document.querySelector('#refresh-members').addEventListener('click', () => loadDashboard().catch((error) => { message.textContent = error.message; }));
document.querySelector('#product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget; const data = new FormData(form); const productMessage = document.querySelector('#product-message');
  try {
    const priceCents = Math.round(Number(data.get('price')) * 100);
    await apiFetch('/api/admin/products', { method: 'POST', body: JSON.stringify({ name: data.get('name'), description: data.get('description'), category: data.get('category'), priceCents, stock: Number(data.get('stock')), imageUrl: data.get('imageUrl') }) });
    form.reset(); document.querySelector('#product-category').value = 'Essentials'; productMessage.textContent = 'Product added.'; await loadDashboard();
  } catch (error) { productMessage.classList.add('error'); productMessage.textContent = error.message; }
});

loadDashboard().catch((error) => {
  message.classList.add('error'); message.textContent = error.message;
  if (error.message.includes('Sign in')) setTimeout(() => { location.href = 'account.html'; }, 900);
  else if (error.message.includes('Admin')) message.textContent = 'This page is for authorised gym administrators. Your account does not have admin access.';
});
