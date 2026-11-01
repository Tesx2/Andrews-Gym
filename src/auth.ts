import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export function createAuth(env: Env) {
  return betterAuth({
    database: env.DB,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true },
    trustedOrigins: [env.BETTER_AUTH_URL],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await env.DB.prepare('INSERT OR IGNORE INTO members (id, user_id, status) VALUES (?, ?, ?)')
              .bind(crypto.randomUUID(), user.id, 'pending').run();
          }
        }
      }
    },
    plugins: [admin({ defaultRole: 'user' })]
  });
}
