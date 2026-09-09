# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + React Router + Tailwind CSS + GSAP (with ScrollTrigger) + Three.js + React Three Fiber + Lottie (dotLottie/lottie-react) + Lucide React icons. Specified directly by the user, not delegated.

## Users

- Wider public audience discovering the artist for the first time (via social/search/referral), browsing casually on desktop or mobile.
- Prospective supporters/donors who land on the site after hearing about the artist and want to understand his work and how to help.
- Gallery/press/exhibition contacts researching the artist's practice and story.

No accounts, no login, no returning-user state to design for.

## Product Purpose

A digital home for an autistic/neurodivergent (Asperger's) artist that introduces him to a wider audience, showcases his artwork beautifully, tells his story respectfully and as a person first, makes his work easy to discover, and encourages people to support his artistic journey (donations). Success = a visitor leaves understanding who he is, having actually looked at the art, and knowing how to see more or support him.

## Positioning

Most artist portfolio sites are either generic template galleries or maximalist animation showcases. This site's mechanism is restraint-as-contrast: the interface itself (chrome, nav, footer, glass, typography) stays monochrome — white/black/glass/gray only — so that the artwork is the sole source of color on the page. The site reads as "a monochrome digital gallery that reveals the colourful world of the artist," not as a colorful marketing site with pictures in it.

## Operating Context

- Casual browsing sessions, often from a phone, often arriving mid-scroll from a social link.
- No checkout/e-commerce flow yet — donation is UI + architecture only, payment processing added later.
- No CMS yet — artwork and bio content is mock/placeholder data, structured so it can be swapped for real content later without restructuring code.
- Content is public and viewed by neurodivergent visitors and family/support-network visitors as well as general art audiences — cognitive accessibility is a first-class requirement, not an afterthought.

## Capabilities and Constraints

- Five routes: `/` (Home), `/about`, `/catalogue`, `/artwork/:id`, `/donate`.
- Primary nav: Home / About / Artwork / Support.
- Artwork data is mock for now (~24+ entries) with a local placeholder image system (`src/assets/artwork/`) — no broken image URLs, generated placeholders stand in for real photography until the artist supplies real files.
- Donation amounts are shown in RM (Malaysian Ringgit) per the brief's examples (RM 10 / 30 / 50 / 100 / custom) — no real payment processor wired up yet.
- Social links are placeholders (Instagram/Facebook/Email-style) until real profile URLs are supplied — never invent real-looking URLs.
- Artist name/persona: **placeholder identity, "Adam Rusli,"** used consistently across nav/hero/about/footer. This is explicitly a stand-in the user asked for — swap everywhere the name appears when a real name is supplied.
- Bio/story content is a respectful, generic placeholder narrative (his relationship to art and to being autistic/Asperger's, handled tastefully) — no invented exhibitions, awards, ages, or credentials.

## Brand Commitments

None confirmed yet beyond the placeholder identity above. No real logo, real photography, real testimonials, or real press mentions exist — none should be fabricated.

## Evidence on Hand

None. All artwork imagery, artist name, and biographical detail in this build are explicitly placeholder/mock content, chosen so the architecture (data shape, routing, components) is ready to receive real content later with minimal rework.

## Product Principles

1. Chrome stays monochrome (white/black/glass/gray); color only ever enters the page through the artwork itself.
2. Exciting to explore, never difficult to understand — animation is decoration on top of a UI that already works and reads correctly with every animation switched off.
3. Every showcase-level interaction (infinite spiral, 3D carousel, 3D studio) ships with a plain, fully accessible equivalent path (e.g. "View Full Catalogue," explicit prev/next controls) — the showcase is never the only way to reach the content.
4. Respectful, human portrayal of neurodivergence: person and artist first. No inspirational-disability cliché, no objectifying language.
5. Reduced-motion and keyboard-only users get full functional parity, not a degraded experience — motion is removed or minimized, content and navigation are not.

## Accessibility & Inclusion

WCAG-minded throughout: keyboard navigation and visible focus states on every interactive element, semantic HTML and landmarks, meaningful alt text, no meaning conveyed by color/hover/animation alone, large touch targets (44×44px+), `prefers-reduced-motion` support with real functional fallbacks (not just "less motion" but equivalent access), and cognitive-accessibility priorities: predictable navigation, short plain-language copy, obvious buttons with real labels (never a bare arrow icon), consistent layout patterns, no gesture-only or puzzle-like interactions required to proceed.
