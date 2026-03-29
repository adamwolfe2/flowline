# MyVSL — Executive Brief, Unit Economics & GTM Plan

---

## What the Platform Actually Is

MyVSL is a **no-code AI quiz funnel builder** that does three things no other single tool does together:

1. **AI generates the entire funnel** from a business description in under 2 minutes — copy, questions, scoring logic, all of it
2. **Scores every lead** and automatically routes them to the right calendar link (high-value → premium call, mid → standard call, low → self-serve)
3. **Tracks everything** — conversion, dropoff by step, UTM source, A/B test performance

The core insight: **most businesses book calls with everyone who clicks a button, then waste 40% of sales time on unqualified leads.** MyVSL eliminates that. Your best prospects get your best calendar. Your tire-kickers get a self-service option or nothing. Built in minutes, not weeks.

---

## Unit Economics

### OpenAI GPT-4o costs per funnel build

| Action | Input tokens | Output tokens | Cost |
|---|---|---|---|
| AI Plan (questions) | ~1,000 | ~400 | ~$0.007 |
| AI Generate (full funnel) | ~1,300 | ~600 | ~$0.009 |
| URL-to-funnel (optional) | ~2,000 | ~800 | ~$0.015 |
| **Total per build** | | | **~$0.02–0.03** |

Funnel builds are a one-time cost. After that, a published funnel costs essentially nothing to run.

### Fixed infrastructure (monthly, current scale)

| Service | Cost |
|---|---|
| Vercel (Pro) | $20 |
| Neon Postgres | $19 |
| Clerk auth | $0 (free to 10k MAU) |
| Resend email | $20 (50k/mo) |
| Upstash Redis | $0–10 |
| Sentry | $0 (free tier) |
| **Total** | **~$60–70/mo** |

### Per-user variable cost

- AI generation: ~$0.03 per funnel built (users build 1–3 funnels then run them forever)
- Email notifications: ~$0.0004/email
- Storage: negligible
- **Effective variable cost: ~$0.05–0.10/user/month**

### Gross margins

| Plan | Price | Variable Cost | Gross Margin |
|---|---|---|---|
| Pro | $49/mo | ~$0.10 | **99.8%** |
| Agency | $149/mo | ~$0.20 | **99.9%** |

- At **100 Pro subscribers**: $4,900 MRR — infrastructure costs $60–70. That's >98% gross margin.
- At **50 Agency subscribers**: $7,450 MRR — same infrastructure, essentially identical margin.
- **Break-even**: ~2 Pro subscribers covers all infrastructure. Everything after is near-pure profit.

### CAC targets

- Pro at $49/mo = $588 ACV. Target CAC < $150 (3.9x LTV ratio at 12-month horizon)
- Agency at $149/mo = $1,788 ACV. Target CAC < $450

---

## Top 5 ICPs — Ranked by Revenue Potential & Close Speed

### ICP 1: High-Ticket Coaches & Consultants ($5k–$50k programs)

Business coaches, executive coaches, health/life coaches, sales trainers. These people live and die by their calendar quality. They're already using Calendly. They're already spending $500–2k/mo on ads to fill it. They know exactly what a bad sales call costs them.

- **Pain**: "I'm getting on 20 calls a week, 8 are waste"
- **Value prop**: "Stop taking calls from people who can't afford you"
- **Buying trigger**: They're running ads, have an audience, and want better ROI
- **Price sensitivity**: None — $49/mo is a rounding error vs. one closed deal
- **Volume**: 2–3M coaches/consultants in the US alone
- **Best prospect signal**: LinkedIn title contains "coach" or "consultant," has a Calendly link, runs Facebook/Google ads

---

### ICP 2: Marketing & Lead Gen Agencies (the Agency plan multiplier)

A single agency owner on the $149/mo Agency plan white-labels MyVSL and resells it to their 10–30 clients at $300–500/month each. One agency = $3k–15k/mo in pass-through revenue for them, meaning they'd pay $149/mo forever without blinking.

- **Pain**: "My clients need better lead quality, I need a differentiated offer"
- **Value prop**: "Add a quiz funnel service to your agency for $149/mo, bill clients $500/mo each"
- **Price sensitivity**: None — it's a profit center for them
- **Volume**: 500k+ digital agencies in the US
- **Best prospect signal**: "Marketing agency," "lead generation," "funnel builder" on website, uses GoHighLevel or ClickFunnels

---

### ICP 3: Real Estate Teams & Mortgage Brokers

Real estate agents pay $1,000–5,000/mo for Zillow leads and get garbage quality. A quiz funnel that scores "investor vs first-time buyer vs just browsing" and routes them to the right agent or booking type is incredibly high value. Commission per closed deal is $5k–20k.

- **Pain**: "Leads from Zillow are terrible quality, I waste hours on browsers"
- **Value prop**: "Every lead scores themselves before getting on your calendar"
- **Price sensitivity**: Very low — $49/mo vs. $5k/mo Zillow
- **Volume**: 3M+ real estate professionals in the US
- **Best prospect signal**: "Real estate team," "top producer," "buyer specialist" — target teams of 3–15 agents

---

### ICP 4: B2B SaaS Companies with Sales-Led Motions (10–200 employees)

SaaS companies running demos need leads that match their ICP before a sales rep touches them. A quiz that asks company size, current tool, pain point, and budget — then routes "enterprise" to AE calendar and "SMB" to PLG/self-serve — saves 10+ SDR hours per week.

- **Pain**: "SDRs are wasting time qualifying leads that should never get a demo"
- **Value prop**: "Pre-qualify every inbound lead. Route automatically. No SDR time wasted."
- **Price sensitivity**: Low — $49/mo vs. $70k/yr SDR salary
- **Volume**: 50k+ SaaS companies in the US
- **Best prospect signal**: B2B SaaS, has a "Book a Demo" CTA, 10–200 employees, Series A or bootstrapped

---

### ICP 5: Info Product Creators Going High-Ticket

Someone who has been selling a $197 course wants to launch a $3k–10k coaching program. They need an application funnel — a professional way to screen and qualify. This is literally the use case MyVSL was built for. They have an audience, they have traffic, they just need the tool.

- **Pain**: "I want to launch a high-ticket offer but don't know how to qualify applicants"
- **Value prop**: "Your AI funnel is ready in 5 minutes. Let it do your screening."
- **Price sensitivity**: Medium — they're already spending on Kajabi ($149/mo), ClickFunnels ($97/mo), etc.
- **Volume**: 2M+ course creators and educators globally
- **Best prospect signal**: Has a Kajabi/Teachable/Podia site, Substack, or online course — sells to entrepreneurs or professionals

---

## Dream 100 Strategy — Audience-First Distribution

The concept: don't acquire customers one at a time. Find the 20 people who control access to 10,000 of your customers and build relationships with those 20.

MyVSL solves a **universal problem** — wasted sales calls from unqualified leads — across a dozen verticals. Every one of these verticals has influential people who teach business building to that audience. One integration or endorsement from the right person unlocks thousands of leads instantly.

### Dream 100 Targets

**Tier 1 — Coaches teaching coaches (highest leverage)**

| Name / Brand | Audience | Partnership Angle |
|---|---|---|
| Sam Ovens / Skool Games | Hundreds of thousands of consultants | Sponsor a training, offer free builds to community members |
| Alex Hormozi (Acquisition.com) | 3M+ entrepreneurs, gym/service biz owners | Case study: "qualify clients like Hormozi recommends" |
| Cole Gordon (Remote Closing Academy) | High-ticket closers + their employers | "The funnel your closers need to stop wasting time" |
| Taylor Welch (Traffic & Funnels) | Tens of thousands of consultants | Sponsored workshop or affiliate deal |
| Ravi Abuvala (Scaling With Systems) | Coaches building systematic businesses | Native curriculum integration — "the system for your calls" |

**Tier 2 — Agency owners**

| Name / Brand | Audience | Partnership Angle |
|---|---|---|
| Jordan Platten (Affluent Academy) | 100k+ YouTube agency owners | "Add this service, charge clients $500/mo" |
| Iman Gadzhi (Agency Incubator) | Young agency owners, massive reach | White-label agency upsell content |
| GoHighLevel Community | 50k+ agency resellers | List on GHL marketplace, build native webhook integration |
| Jason Wojo | Ads agency owners | Sponsored training on lead qualification |

**Tier 3 — Real estate**

| Name / Brand | Audience | Partnership Angle |
|---|---|---|
| Tom Ferry | 500k+ real estate agents, largest coach in the space | "The lead qualification tool every Tom Ferry student needs" |
| Kevin Ward (YesMasters) | 200k+ YouTube real estate agents | Sponsored training on lead filtering |
| Mike Sherrard | Younger agents, social media growth | YouTube tutorial on quiz funnels |

**Tier 4 — Info product / creator economy**

| Name / Brand | Audience | Partnership Angle |
|---|---|---|
| Jay Clouse (Creator Science) | Creators going high-ticket | "How to launch a high-ticket offer with a quiz funnel" |
| Justin Welsh | 400k+ LinkedIn solopreneurs | LinkedIn content partnership, affiliate deal |

### How to approach them

1. **Use the product on their behalf first.** Build a free custom funnel for their business and DM it. "Hey [Name], I built you a free lead qualification funnel for your coaching program — took 3 minutes. Here it is: [link]. Thought you might find it useful." Show, don't pitch.

2. **Affiliate structure.** Offer 30–40% recurring commission. At $49/mo that's $14–20/mo per referral. If they send 100 customers: $1,400–2,000/mo passively. Easy yes.

3. **Co-create content.** Offer to build their funnel live on their podcast or YouTube channel. Free value for their audience. Live demo for yours.

---

## Next 7 Days — Revenue Plan

You have two unfair advantages: **Cursive** (420M+ profile database) and **Email Bison** (your own sending infrastructure). This is an outbound machine. Use it.

---

### Day 1 — ICP 1 Cold Email Campaign (Coaches)

**Build list in Cursive:**
- Title: "business coach" OR "executive coach" OR "life coach" OR "sales trainer"
- Has Calendly link on website OR "book a call" CTA
- LinkedIn followers: 1,000+
- Location: US, Canada, UK, Australia
- Target: 2,000 contacts

**3-touch email sequence (send every 4 days):**

**Email 1 — Subject: "Your Calendly is leaking [First Name]"**

> [First Name],
>
> Quick question — do you get on discovery calls with people who clearly can't afford your program?
>
> I built something that fixes that. It's called MyVSL — it puts a 2-minute quiz in front of your calendar link that scores every lead before they book. High scores get your premium call. Everyone else gets redirected.
>
> Takes 5 minutes to set up. AI writes the whole thing.
>
> Worth a look? [link to live demo funnel]
>
> — Adam

**Email 2 — Subject: "The $10k call you almost skipped"**
- Short before/after story: "A coach went from 30% qualified calls to 80% in 2 weeks"
- Link to the product

**Email 3 — Subject: "Last email — free build offer"**
- Offer to build their funnel for free, no sign-up required
- "Just reply with your offer and I'll send you a live funnel in 24 hours"

---

### Day 2 — ICP 2 Agency Campaign

**Build list in Cursive:**
- Title: "agency owner" OR "marketing agency" OR "digital agency"
- Company size: 2–50 employees
- Tech stack: GoHighLevel, ClickFunnels, HubSpot
- Target: 1,500 contacts

**Email angle:** Resell play — "Add $500/mo per client to your agency for $149/mo total"

---

### Day 3 — Real Estate Campaign

**Build list in Cursive:**
- Title: "real estate agent" OR "realtor" OR "mortgage broker"
- Company size: 5–50 employees (teams, not solo agents)
- Location: top 20 US metros by home price
- Target: 1,000 contacts

**Email angle:** "You're paying $3k/mo for Zillow leads. Here's $49/mo to make every one of them worth taking."

---

### Day 4–5 — Dream 100 Outreach

Pick 10 targets from the Dream 100 list above. For each:
1. Build a live demo funnel customized for their specific audience (3 min each with AI)
2. DM on Instagram or LinkedIn with the link — no pitch, just genuine value
3. Follow up once in 48 hours if no response

---

### Day 6 — Community Posts

Post in these specific communities:
- **Skool** — search for business/coaching communities, post "How I stopped wasting time on bad sales calls" with a genuine breakdown
- **r/Entrepreneur** (Reddit) — write a real post about lead qualification, mention the tool naturally at the end
- **Facebook groups**: "Online Business Owners," "Coaches & Consultants," "Agency Owners"
- **LinkedIn**: publish a post showing the funnel builder in action (60-second screen recording)
- **Twitter/X**: thread on "how to qualify leads with a quiz" — educational, not promotional

---

### Day 7 — White Glove Onboarding Offer

For your first 10 paying customers, offer: **"I'll set up your entire funnel for you in 24 hours — for free."**

This closes fence-sitters, generates testimonials, and teaches you exactly where the friction points are in the product. Every objection you hear this week becomes a product improvement or a better email subject line.

---

## Conversion Math

| Step | Number |
|---|---|
| Emails sent (Day 1 coaches campaign) | 2,000 |
| Open rate (3% reply or click) | 60 |
| Book a demo or sign up free | 20 |
| Convert to paid (40%) | 8 |
| MRR from one afternoon | $392 |

Do this across all 3 ICP campaigns: **potential $1,000–1,500 MRR in week 1** before any Dream 100 deals close.

---

## Hiring Plan

| Stage | Revenue | Hire | Cost |
|---|---|---|---|
| Now | $0 | Nobody. You + outbound campaigns | $0 |
| Stage 1 | $5k MRR | Part-time SDR/VA to run Cursive + Email Bison daily | $1,500–2,000/mo |
| Stage 2 | $15k MRR | Full-time growth: content + community + affiliate program | $4–5k/mo |
| Stage 3 | $30k MRR | Second SDR + head of partnerships for Dream 100 | $8–10k/mo |

**What you don't need yet:** engineers (product is built), designers (Tailwind handles it), a marketing agency (you are your own case study).

---

## The Single Highest-Leverage Move This Week

Go to Cursive. Build a list of 500 business coaches with Calendly links and 1k+ LinkedIn followers. Write the 3-email sequence above. Launch in Email Bison. Do this today.

The product is built. The infrastructure costs $70/mo. The only constraint is distribution — and you own two tools that solve that problem.
