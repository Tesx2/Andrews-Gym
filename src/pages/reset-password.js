import { authClient } from '../auth-client.js';

const form = document.querySelector('#reset-form');
const button = document.querySelector('#reset-submit');
const message = document.querySelector('#reset-message');
const token = new URLSearchParams(location.search).get('token');

if (!token) {
  button.disabled = true;
  message.classList.add('error');
  message.textContent = 'This reset link is missing or has expired. Request a new one.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const password = String(data.get('password'));
  if (password !== String(data.get('confirm-password'))) {
    message.classList.add('error');
    message.textContent = 'The passwords do not match.';
    return;
  }
  button.disabled = true;
  message.classList.remove('error');
  message.textContent = 'Updating password…';
  try {
    const result = await authClient.resetPassword({ newPassword: password, token });
    if (result.error) throw new Error(result.error.message || 'This reset link could not be used. Request a new one.');
    location.href = 'account.html?reset=success';
  } catch (error) {
    message.classList.add('error');
    message.textContent = error instanceof Error ? error.message : 'This reset link could not be used. Request a new one.';
    button.disabled = false;
  }
});
