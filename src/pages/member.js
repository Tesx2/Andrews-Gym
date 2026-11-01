import { authClient, apiFetch } from '../auth-client.js';

const welcome = document.querySelector('#member-welcome');
const card = document.querySelector('#member-card');
const message = document.querySelector('#member-message');
document.querySelector('#sign-out').addEventListener('click', async (event) => { event.preventDefault(); await authClient.signOut(); location.href = 'index.html'; });

try {
  const data = await apiFetch('/api/member/me');
  welcome.textContent = `Welcome, ${data.user.name}. Here’s the current status of your account.`;
  if (!data.member) {
    card.textContent = 'Your member profile is not set up yet. Please contact the gym team.';
  } else {
    const heading = document.createElement('h2'); heading.className = 'portal-title'; heading.style.fontSize = '36px'; heading.textContent = data.member.plan || 'Plan to be confirmed';
    const status = document.createElement('span'); status.className = 'member-status'; status.textContent = data.member.status;
    const copy = document.createElement('p'); copy.className = 'portal-subtitle'; copy.textContent = data.member.status === 'pending' ? 'Your account is ready. The gym team will confirm your selected membership and activate your plan.' : 'For membership changes or questions, please contact the gym team.';
    const email = document.createElement('p'); email.className = 'portal-muted'; email.textContent = data.user.email;
    const visits = document.createElement('p'); visits.className = 'portal-muted'; visits.textContent = `Recorded gym visits: ${data.member.visits ?? 0}`;
    card.replaceChildren(heading, status, copy, email, visits);
    if (data.member.start_date || data.member.end_date) {
      const dates = document.createElement('p'); dates.className = 'portal-muted'; dates.textContent = `Membership dates: ${data.member.start_date || '—'} to ${data.member.end_date || '—'}`; card.append(dates);
    }
  }
} catch (error) {
  message.textContent = error.message;
  if (error.message.includes('Sign in')) setTimeout(() => { location.href = 'account.html'; }, 800);
}
