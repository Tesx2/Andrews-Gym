import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY?: string;
  AUTH_FROM_EMAIL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

type SendEmail = (args: { to: string; subject: string; text: string }) => void;

function resendSender(env: Env, waitUntil: (promise: Promise<unknown>) => void): SendEmail {
  return ({ to, subject, text }) => {
    if (!env.RESEND_API_KEY || !env.AUTH_FROM_EMAIL) {
      console.warn('Auth email skipped: configure RESEND_API_KEY and AUTH_FROM_EMAIL in Cloudflare.');
      return;
    }
    const delivery = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.AUTH_FROM_EMAIL, to: [to], subject, text })
    }).then(async (response) => {
      if (!response.ok) console.error(`Auth email delivery failed with status ${response.status}.`);
    }).catch(() => console.error('Auth email delivery failed. Check the Resend configuration.'));
    waitUntil(delivery);
  };
}

export function createAuth(env: Env, waitUntil: (promise: Promise<unknown>) => void = (promise) => { void promise; }) {
  const sendEmail = resendSender(env, waitUntil);
  return betterAuth({
    database: env.DB,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      resetPasswordTokenExpiresIn: 1800,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        sendEmail({ to: user.email, subject: 'Reset your Andrews Gym password', text: `Use this link to reset your password. It expires in 30 minutes.\n\n${url}\n\nIf you did not request this, you can ignore this email.` });
      }
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          sendEmail({ to: user.email, subject: 'Confirm your Andrews Gym email change', text: `A request was made to change your login email to ${newEmail}. Confirm that request here:\n\n${url}\n\nIf you did not request this, ignore this email.` });
        }
      }
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        sendEmail({ to: user.email, subject: 'Verify your Andrews Gym email', text: `Confirm your new login email here:\n\n${url}\n\nIf you did not request this, ignore this email.` });
      }
    },
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
