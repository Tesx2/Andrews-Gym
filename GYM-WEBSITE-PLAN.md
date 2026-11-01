# Andrews Gym Website — Project Plan

**Status:** Initial website in progress; member portal, admin, and shop scope added. See [PLATFORM-PLAN.md](PLATFORM-PLAN.md) for the application architecture and owner decisions.  
**Prepared:** 1 November 2026  
**Purpose:** Build a useful, mobile-first website that helps prospective members understand the gym, compare options, and take a clear next step.

## 1. Project outcome

The website should help a visitor answer four questions quickly:

1. Is this gym right for me?
2. What does it offer, and what does membership cost?
3. Where is it, and when can I visit or train?
4. How do I join, book a trial, or ask a question?

The primary action should be **Book a visit / Start a trial** (confirm the preferred offer). The secondary action should be **Call or message the gym**. If the gym is ready to accept online payments, add **Join online** as a direct conversion path.

## 2. Audience and main journeys

- **New to fitness:** sees a welcoming promise, beginner support, real facility photos, and a low-pressure first visit option.
- **Experienced gym-goer:** checks equipment, opening hours, access rules, and price before joining.
- **Class-focused visitor:** scans the current timetable, class descriptions, instructor details, and booking availability.
- **Personal-training prospect:** reviews coach credentials and services, then requests a consultation.
- **Returning/member visitor:** quickly finds the location, contact details, timetable, and member portal if one exists.

## 3. Recommended first release

### Pages

1. **Home** — clear headline, location, key offer, primary action, facilities/services, membership preview, proof, and contact details.
2. **Membership** — plan comparison, inclusions, fees/terms, FAQs, and an enquiry or joining action. Publish confirmed prices or a clear “from” price where possible.
3. **Classes & timetable** — searchable or day-based schedule, class descriptions, coach names, and booking/contact action. A simple maintained timetable is acceptable for launch if live booking is not ready.
4. **Personal training** — what coaching includes, trainer profiles, and consultation request.
5. **About / facilities** — real photos, equipment/amenities, gym values, and accessibility details.
6. **Contact & visit** — address, map, hours, phone, WhatsApp if used, directions, and enquiry form.
7. **Shop** — gym essentials catalogue, EUR prices, and checkout after payment/fulfilment details are confirmed.
8. **Member and admin areas** — Better Auth sign-in, membership status, admin member management, and visit tracking.

Optional later pages: blog/training advice, dedicated landing pages for special programmes, and additional branch pages.

### Core functions

- Responsive layouts designed for phones first.
- Persistent, obvious “Book a visit” or “Start a trial” action.
- Click-to-call and direct message links on mobile.
- Short enquiry form with clear consent/privacy copy and a confirmation state.
- Membership cards with transparent inclusions and terms.
- Timetable that remains readable on narrow screens.
- Map, accurate hours and location details.
- Basic analytics for page visits, calls/messages, form submissions, and trial bookings.
- Search basics: page titles, descriptions, location wording, social sharing image, sitemap, and structured business information.
- Accessibility basics: readable contrast, keyboard navigation, labels, alt text, and reduced-motion-friendly interactions.

## 4. Suggested homepage order

1. **Top bar/navigation:** logo, Membership, Classes, About, Contact, primary action.
2. **Hero:** one specific value statement, local area, real gym image, primary and secondary actions.
3. **Quick facts:** opening hours, key amenities, or a verified introductory offer.
4. **Choose your training:** open gym, group classes, PT, or other confirmed services.
5. **Membership preview:** a few easy-to-compare options and a link to full details.
6. **Class preview:** next classes or timetable shortcut.
7. **People and proof:** coach profiles, genuine reviews, and member stories with permission.
8. **Visit us:** address, map, directions, phone/message, and hours.
9. **Footer:** page links, social accounts, policies, and business details.

### Sample copy direction (placeholder only)

> **Train your way at Andrews Gym.**  
> Strength training, coaching, and a supportive local community in **[area]**.  
> **[Book your first visit]**  **[View membership options]**

Replace all bracketed details with verified gym information. Avoid promises about results or services the gym cannot substantiate.

## 5. Benchmark examples and what to learn

| Example | Useful pattern | Apply carefully |
|---|---|---|
| [Planet Fitness South Africa](https://www.planetfitness.co.za/) and its [class schedule](https://www.planetfitness.co.za/classes/) | Main navigation exposes membership, club finding, trial, and schedule. The schedule asks visitors to choose a club before viewing days, which is useful for multiple locations. | Use a club selector only if Andrews has multiple branches. Keep the first schedule view direct and simple for a single site. |
| [Planet Fitness US](https://www.planetfitness.com/) | Membership tiers show starting prices and explain the main distinction between plans before the visitor clicks to join. | Show Andrews’ actual full fees and terms; do not copy another market’s price or membership conditions. |
| [Equinox Bryant Park](https://www.equinox.com/clubs/new-york/midtown/bryantpark) | A club-specific page presents facilities, classes, and schedule access as part of a premium local club experience. | Borrow the focused location and facilities storytelling if it fits Andrews’ brand; avoid expensive-looking design if it does not reflect the real gym. |

These examples are references, not templates to copy. Their live details can change; use them to study hierarchy, clarity, and visitor flow.

## 6. Phases and deliverables

### Phase 1 — Discovery

- Confirm audience, location(s), differentiators, services, and top conversion action.
- Collect membership options, timetable, hours, contact channels, policies, and existing brand assets.
- Decide whether online joining/payment or class booking is required at launch.

**Deliverable:** approved content and requirements checklist.

### Phase 2 — Structure and content

- Confirm sitemap and homepage sections.
- Draft page copy and calls to action.
- Prepare photography list and identify any third-party scheduling/payment links.

**Deliverable:** page outline and content pack.

### Phase 3 — Design

- Set visual direction, typography, color, and image style based on the actual gym.
- Design phone and desktop layouts for Home, Membership, and Timetable first.
- Review accessibility and usability before implementation.

**Deliverable:** approved responsive page designs.

### Phase 4 — Build

- Implement pages, forms, navigation, timetable, map, analytics, metadata, and any approved integrations.
- Enter real content and optimize real images.

**Deliverable:** launch candidate.

### Phase 5 — Review and launch

- Verify all copy, prices, links, forms, map pin, contact actions, and timetable.
- Review on common phone and desktop sizes; check keyboard use and page speed.
- Connect the production domain and analytics, then publish.

**Deliverable:** live website and handover notes for updating schedules and offers.

## 7. Content and decisions needed from Andrews Gym

- Exact gym name, logo, preferred colors, and any existing brand guide.
- Country, town/area, full address, map pin, phone, email, social links, and opening hours.
- Main audience and what makes this gym distinct.
- Confirmed services, equipment, amenities, accessibility, and age/access rules.
- Membership plans, prices, joining fees, contract/cancellation terms, and any trial offer.
- Current timetable, class capacities, instructors, and booking method.
- Trainer names, photos, qualifications, and approved biographies.
- Real gym, equipment, staff, and member photos (with permission for identifiable people).
- Preferred enquiry destination and who will respond to website leads.
- Whether online payments, online membership signup, or live bookings are needed at launch.

## 8. Launch acceptance checklist

- A first-time visitor can identify the gym, area, offer, and next action from the first screen.
- Membership inclusions and all confirmed costs/terms are easy to find.
- Timetable, contact details, address, and opening hours are current.
- Every primary button and form works, including confirmation and lead delivery.
- Phone visitors can call/message in one tap and use the timetable without horizontal scrolling.
- Images are authentic, permissioned, compressed, and have useful alternative text where needed.
- Pages have page titles, descriptions, social preview, and consistent business details.
- Privacy notice and any required terms are linked from forms and the footer.

## 9. Success measures

Track a small set of useful measures from launch:

- Trial/visit requests and the share that lead to an attended visit.
- Membership enquiries or completed online joins.
- Calls, message clicks, and timetable/booking actions.
- Mobile form completion and abandonment.
- Local search impressions and visits to the location/contact page.

Review monthly and improve the biggest drop-off before adding more pages or features.

## Research links

- [Planet Fitness South Africa homepage](https://www.planetfitness.co.za/)
- [Planet Fitness South Africa class schedule](https://www.planetfitness.co.za/classes/)
- [Planet Fitness US membership overview](https://www.planetfitness.com/)
- [Equinox Bryant Park club page](https://www.equinox.com/clubs/new-york/midtown/bryantpark)
- [MyGymDesk gym website examples and feature patterns](https://mygymdesk.com/best-gym-websites) — vendor-produced overview; useful for ideas, not independent performance evidence.
