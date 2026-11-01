import { authClient, apiFetch } from '../auth-client.js';

const form = document.querySelector('#account-form');
const message = document.querySelector('#account-message');
const mode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'signin';
const nameField = document.querySelector('#name-field');
const title = document.querySelector('#account-title');
const intro = document.querySelector('#account-intro');
const submit = document.querySelector('#account-submit');
const switchLink = document.querySelector('#account-switch');
const forgotLink = document.querySelector('#forgot-password-link');
const password = document.querySelector('#password');

async function postSignInPage() {
  try {
    await apiFetch('/api/admin/stats');
    return 'admin.html';
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required.') return 'member.html';
    throw error;
  }
}

if (mode === 'signup') {
  forgotLink.hidden = true;
  nameField.hidden = false;
  document.querySelector('#name').required = true;
  title.textContent = 'JOIN THE GYM.';
  intro.textContent = 'Create your member account. Your membership will be confirmed by our team.';
  submit.firstChild.textContent = 'Create account ';
  password.autocomplete = 'new-password';
  const requestedPlan = new URLSearchParams(location.search).get('plan');
  if (['Essential', 'Plus', 'Complete'].includes(requestedPlan)) document.querySelector('#plan').value = requestedPlan;
  switchLink.innerHTML = 'Already have an account? <a href="account.html">Sign in</a>';
} else {
  switchLink.innerHTML = 'New to Andrews Gym? <a href="account.html?mode=signup">Create an account</a>';
  if (new URLSearchParams(location.search).get('reset') === 'success') message.textContent = 'Password updated. Sign in with your new password.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submit.disabled = true;
  message.classList.remove('error');
  message.textContent = 'Please wait…';
  const data = new FormData(form);
  try {
    if (mode === 'signup') {
      const result = await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) });
      if (result.error) throw new Error(result.error.message || 'Unable to create your account.');
      await apiFetch('/api/auth/signup-complete', { method: 'POST', body: JSON.stringify({ plan: String(data.get('plan') || '') }) });
      location.href = 'member.html';
    } else {
      const result = await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) });
      if (result.error) throw new Error(result.error.message || 'Unable to sign in.');
      location.href = await postSignInPage();
    }
  } catch (error) {
    message.classList.add('error');
    message.textContent = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  } finally {
    submit.disabled = false;
  }
});
