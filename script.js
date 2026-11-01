import { gymConfig as config } from './site-config.js';

(function(){
  const menuButton=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Open navigation':'Close navigation');nav.classList.toggle('is-open',!open)});
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open navigation');nav.classList.remove('is-open')}));
  document.getElementById('year').textContent=new Date().getFullYear();
  if(config.logo){const brandMarks=document.querySelectorAll('.brand-mark');brandMarks.forEach(mark=>{const image=document.createElement('img');image.src=config.logo;image.alt=config.name||'Gym';image.className='brand-logo';mark.replaceWith(image)})}
  const prices=config.prices||{};
  document.querySelectorAll('[data-price]').forEach(el=>{const price=prices[el.dataset.price];if(price!==null&&price!==undefined&&price!==''&&!Number.isNaN(Number(price)))el.textContent=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(price))});
  ['address','phone','email','hours'].forEach(key=>{if(config[key])document.querySelectorAll(`[data-contact="${key}"]`).forEach(el=>el.textContent=config[key])});
  if(config.phone){document.querySelectorAll('[data-contact-link="phone"]').forEach(el=>el.href='tel:'+config.phone.replace(/[^+\d]/g,''))}
  if(config.email){document.querySelectorAll('[data-contact-link="email"]').forEach(el=>el.href='mailto:'+config.email)}
  const photoVars={hero:'--hero-image',experience:'--experience-image',booking:'--booking-image'};
  Object.entries(photoVars).forEach(([key,variable])=>{const src=config.photos?.[key];if(src){const target=key==='hero'?document.querySelector('.hero-photo'):key==='experience'?document.querySelector('.experience-photo'):document.querySelector('.booking-photo');if(target)target.style.backgroundImage=`url("${src.replace(/["\\]/g,'')}")`}});
  if(config.siteUrl){const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=config.siteUrl.replace(/\/$/,'')+'/';document.head.append(canonical);document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical.href)}
  if(config.address&&config.phone&&config.siteUrl){const jsonLd={"@context":"https://schema.org","@type":"HealthClub",name:config.name||'Andrews Gym',url:config.siteUrl,address:{"@type":"PostalAddress",streetAddress:config.address,addressCountry:'DE'},telephone:config.phone};const script=document.createElement('script');script.type='application/ld+json';script.textContent=JSON.stringify(jsonLd);document.head.append(script)}
  const form=document.getElementById('booking-form');
  document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{const select=document.getElementById('interest');if(select)select.value=link.dataset.plan}));
  form?.addEventListener('submit',event=>{event.preventDefault();const status=document.getElementById('form-status');const data=new FormData(form);const subject=encodeURIComponent('Website visit request — '+data.get('interest'));const body=encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nInterested in: ${data.get('interest')}\n\nPlease follow up to arrange a visit.`);if(config.bookingUrl){window.open(config.bookingUrl,'_blank','noopener,noreferrer');status.textContent='Your booking page opened in a new tab. Please complete your request there.'}else if(config.bookingEmail){window.location.href=`mailto:${config.bookingEmail}?subject=${subject}&body=${body}`;status.textContent='Your email app should open with the request ready to send.'}else{status.textContent='Thanks! The form is ready. Add the owner’s booking link or email in site-config.js to receive requests.'}});
})();
