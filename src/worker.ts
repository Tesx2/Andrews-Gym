import { Hono, type Context } from 'hono';
import { createAuth, type Env } from './auth';

type Variables = { auth: ReturnType<typeof createAuth> };
const app = new Hono<{ Bindings: Env; Variables: Variables }>();
type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
const validPlans = new Set(['Essential', 'Plus', 'Complete']);
const validMemberStatuses = new Set(['pending', 'active', 'paused', 'cancelled']);

app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    const origin = c.req.header('Origin');
    let expectedOrigin = '';
    try { expectedOrigin = new URL(c.env.BETTER_AUTH_URL).origin; } catch { /* Auth configuration reports the invalid URL. */ }
    if (!origin || origin !== expectedOrigin) return c.json({ error: 'Request origin is not allowed.' }, 403);
  }
  c.set('auth', createAuth(c.env));
  await next();
});

async function currentUser(c: AppContext) {
  const result = await c.get('auth').api.getSession({ headers: c.req.raw.headers });
  return result?.user ?? null;
}

async function requireAdmin(c: AppContext) {
  const user = await currentUser(c);
  if (!user) return { user: null, response: c.json({ error: 'Sign in required.' }, 401) };
  const roles = (user as typeof user & { role?: string }).role?.split(',') ?? [];
  if (!roles.includes('admin')) return { user, response: c.json({ error: 'Admin access required.' }, 403) };
  return { user, response: null };
}

app.post('/api/auth/signup-complete', async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: 'Sign in required.' }, 401);
  const body = await c.req.json<{ plan?: string }>().catch((): { plan?: string } => ({}));
  const plan = body.plan && validPlans.has(body.plan) ? body.plan : null;
  await c.env.DB.prepare(`INSERT OR IGNORE INTO members (id, user_id, plan, status) VALUES (?, ?, ?, 'pending')`)
    .bind(crypto.randomUUID(), user.id, plan).run();
  if (plan) await c.env.DB.prepare('UPDATE members SET plan = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND status = \'pending\'')
    .bind(plan, user.id).run();
  return c.json({ ok: true });
});

app.on(['GET', 'POST'], '/api/auth/*', (c) => c.get('auth').handler(c.req.raw));

app.get('/api/member/me', async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: 'Sign in required.' }, 401);
  const member = await c.env.DB.prepare(`SELECT m.plan, m.status, m.start_date, m.end_date, m.created_at,
    (SELECT COUNT(*) FROM check_ins ci WHERE ci.member_id = m.id) AS visits
    FROM members m WHERE m.user_id = ?`)
    .bind(user.id).first();
  return c.json({ user: { name: user.name, email: user.email }, member });
});

app.get('/api/products', async (c) => {
  const result = await c.env.DB.prepare('SELECT id, name, slug, description, category, price_cents, image_url, stock FROM products WHERE active = 1 ORDER BY category, name').all();
  return c.json({ products: result.results });
});

app.get('/api/admin/stats', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const [members, active, pending, products, orders] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM members').first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM members WHERE status = 'active'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM members WHERE status = 'pending'").first<{ count: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM products WHERE active = 1').first<{ count: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM orders WHERE status = \'paid\'').first<{ count: number }>()
  ]);
  return c.json({ members: members?.count ?? 0, active: active?.count ?? 0, pending: pending?.count ?? 0, products: products?.count ?? 0, paidOrders: orders?.count ?? 0 });
});

app.get('/api/admin/members', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const result = await c.env.DB.prepare(`SELECT m.id, m.plan, m.status, m.start_date, m.end_date, m.created_at,
    (SELECT COUNT(*) FROM check_ins ci WHERE ci.member_id = m.id) AS visits,
    u.name, u.email FROM members m JOIN "user" u ON u.id = m.user_id ORDER BY m.created_at DESC LIMIT 500`).all();
  return c.json({ members: result.results });
});

app.post('/api/admin/members/:id/check-ins', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const memberId = c.req.param('id');
  const member = await c.env.DB.prepare('SELECT id FROM members WHERE id = ?').bind(memberId).first();
  if (!member) return c.json({ error: 'Member not found.' }, 404);
  await c.env.DB.prepare('INSERT INTO check_ins (id, member_id) VALUES (?, ?)').bind(crypto.randomUUID(), memberId).run();
  return c.json({ ok: true });
});

app.patch('/api/admin/members/:id', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const body = await c.req.json<{ plan?: string | null; status?: string; startDate?: string | null; endDate?: string | null }>().catch(() => null);
  if (!body || (body.plan && !validPlans.has(body.plan)) || (body.status && !validMemberStatuses.has(body.status))) return c.json({ error: 'Invalid member update.' }, 400);
  const validDate = (value: string | null | undefined) => {
    if (value == null) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  };
  if (!validDate(body.startDate) || !validDate(body.endDate)) return c.json({ error: 'Dates must use YYYY-MM-DD.' }, 400);
  if (body.startDate && body.endDate && body.startDate > body.endDate) return c.json({ error: 'The end date must be on or after the start date.' }, 400);
  const memberId = c.req.param('id');
  const result = await c.env.DB.prepare(`UPDATE members SET
    plan = CASE WHEN ? THEN ? ELSE plan END,
    status = COALESCE(?, status),
    start_date = CASE WHEN ? THEN ? ELSE start_date END,
    end_date = CASE WHEN ? THEN ? ELSE end_date END,
    updated_at = datetime('now') WHERE id = ?`)
    .bind(Number(body.plan !== undefined), body.plan || null, body.status ?? null,
      Number(body.startDate !== undefined), body.startDate ?? null,
      Number(body.endDate !== undefined), body.endDate ?? null, memberId).run();
  if (!result.meta.changes) return c.json({ error: 'Member not found.' }, 404);
  return c.json({ ok: true });
});

app.get('/api/admin/products', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const result = await c.env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  return c.json({ products: result.results });
});

app.post('/api/admin/products', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const body = await c.req.json<{ name?: string; description?: string; category?: string; priceCents?: number; imageUrl?: string; stock?: number }>().catch(() => null);
  const name = body?.name?.trim();
  const priceCents = Number(body?.priceCents);
  const stock = Number(body?.stock);
  const imageUrl = body?.imageUrl?.trim() ?? '';
  if (!name || name.length > 120 || !Number.isSafeInteger(priceCents) || priceCents < 0 || !Number.isSafeInteger(stock) || stock < 0 || (imageUrl && !/^https:\/\//i.test(imageUrl))) return c.json({ error: 'Enter a product name, an HTTPS image URL, price in cents, and non-negative stock quantity.' }, 400);
  const slugBase = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || crypto.randomUUID();
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
  await c.env.DB.prepare(`INSERT INTO products (id, name, slug, description, category, price_cents, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), name, slug, body?.description?.trim().slice(0, 1000) ?? '', body?.category?.trim().slice(0, 60) || 'Essentials', priceCents, imageUrl.slice(0, 1000), stock).run();
  return c.json({ ok: true }, 201);
});

app.patch('/api/admin/products/:id', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const body = await c.req.json<{ active?: boolean; stock?: number; priceCents?: number }>().catch(() => null);
  if (!body || (body.stock !== undefined && (!Number.isSafeInteger(body.stock) || body.stock < 0)) || (body.priceCents !== undefined && (!Number.isSafeInteger(body.priceCents) || body.priceCents < 0))) return c.json({ error: 'Invalid product update.' }, 400);
  const result = await c.env.DB.prepare(`UPDATE products SET active = COALESCE(?, active), stock = COALESCE(?, stock),
    price_cents = COALESCE(?, price_cents), updated_at = datetime('now') WHERE id = ?`)
    .bind(body.active === undefined ? null : Number(body.active), body.stock ?? null, body.priceCents ?? null, c.req.param('id')).run();
  if (!result.meta.changes) return c.json({ error: 'Product not found.' }, 404);
  return c.json({ ok: true });
});

app.get('/api/admin/orders', async (c) => {
  const access = await requireAdmin(c);
  if (access.response) return access.response;
  const result = await c.env.DB.prepare(`SELECT o.id, o.email, o.status, o.total_cents, o.created_at,
    GROUP_CONCAT(oi.product_name || ' × ' || oi.quantity, ', ') AS items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 300`).all();
  return c.json({ orders: result.results });
});

app.post('/api/checkout', async (c) => {
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: 'Online checkout is not configured yet.' }, 503);
  return c.json({ error: 'Checkout will be enabled after shipping, tax, and payment settings are confirmed.' }, 501);
});

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default {
  fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    return app.fetch(request, env, executionContext);
  }
};
