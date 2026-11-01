import { authClient, apiFetch } from '../auth-client.js';

const form = document.querySelector('#forgot-form');
const button = document.querySelector('#forgot-submit');
const message = document.querySelector('#forgot-message');
const setupNote = document.querySelector('#email-setup-note');

try {
  const status = await apiFetch('/api/auth-status');
  if (!status.emailReady) {
    button.disabled = true;
    setupNote.hidden = false;
  }
} catch {
  button.disabled = true;
  setupNote.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  message.classList.remove('error');
  message.textContent = 'Sending…';
  const email = String(new FormData(form).get('email'));
  try {
    const result = await authClient.requestPasswordReset({ email, redirectTo: `${location.origin}/reset-password.html` });
    if (result.error) throw new Error(result.error.message || 'Unable to request a reset link. Please try again.');
    message.textContent = 'If an account matches that address, a reset link will arrive by email.';
    form.reset();
  } catch (error) {
    message.classList.add('error');
    message.textContent = error instanceof Error ? error.message : 'Unable to request a reset link. Please try again.';
  } finally {
    button.disabled = false;
  }
});
