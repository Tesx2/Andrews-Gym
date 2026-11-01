import { authClient, apiFetch } from '../auth-client.js';

const byId = (id) => document.getElementById(id);
const nameForm = byId('name-form');
const emailForm = byId('email-form');
const passwordForm = byId('password-form');
const emailButton = emailForm.querySelector('button');
const emailSetupNote = byId('email-setup-note');

byId('sign-out').addEventListener('click', async (event) => {
  event.preventDefault();
  await authClient.signOut();
  location.href = 'account.html';
});

const sessionResult = await authClient.getSession();
const user = sessionResult.data?.user;
if (sessionResult.error || !user) {
  location.replace('account.html');
  throw new Error('Sign in required.');
}
byId('settings-welcome').textContent = `${user.name} · ${user.email}`;
byId('name').value = user.name || '';

try {
  const status = await apiFetch('/api/auth-status');
  if (!status.emailReady) {
    emailButton.disabled = true;
    emailSetupNote.hidden = false;
  }
} catch {
  emailButton.disabled = true;
  emailSetupNote.hidden = false;
}

nameForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const output = byId('name-message');
  try {
    const result = await authClient.updateUser({ name: String(new FormData(nameForm).get('name')).trim() });
    output.classList.toggle('error', Boolean(result.error));
    output.textContent = result.error?.message || 'Name updated.';
    if (!result.error) byId('settings-welcome').textContent = `${String(new FormData(nameForm).get('name')).trim()} · ${user.email}`;
  } catch { output.classList.add('error'); output.textContent = 'Could not update your name. Try again.'; }
});

emailForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newEmail = String(new FormData(emailForm).get('email')).trim();
  const output = byId('email-message');
  try {
    const result = await authClient.changeEmail({ newEmail, callbackURL: `${location.origin}/account-settings.html` });
    output.classList.toggle('error', Boolean(result.error));
    output.textContent = result.error?.message || 'Check your current email for a confirmation link, then verify the new address.';
  } catch { output.classList.add('error'); output.textContent = 'Could not request an email change. Try again.'; }
});

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(passwordForm);
  const output = byId('password-message');
  if (data.get('newPassword') !== data.get('confirmPassword')) {
    output.classList.add('error');
    output.textContent = 'The new passwords do not match.';
    return;
  }
  const button = passwordForm.querySelector('button');
  button.disabled = true;
  try {
    const result = await authClient.changePassword({ currentPassword: String(data.get('currentPassword')), newPassword: String(data.get('newPassword')), revokeOtherSessions: true });
    output.classList.toggle('error', Boolean(result.error));
    output.textContent = result.error?.message || 'Password updated. Other active sessions have been signed out.';
    if (!result.error) passwordForm.reset();
  } catch { output.classList.add('error'); output.textContent = 'Could not update your password. Check your current password and try again.'; }
  button.disabled = false;
});
