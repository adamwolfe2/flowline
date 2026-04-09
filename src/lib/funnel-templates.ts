import type { FunnelConfig } from "@/types";

export type TemplateId =
  | "coaching-lead-gen"
  | "coaching-webinar"
  | "coaching-vsl"
  | "agency-lead-gen"
  | "agency-webinar"
  | "agency-vsl"
  | "ecommerce-lead-gen"
  | "ecommerce-webinar"
  | "ecommerce-vsl";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  industry: "coaching" | "agency" | "ecommerce";
  archetype: "lead-gen" | "webinar" | "vsl";
  iconName: string;
}

type PartialFunnelConfig = Omit<FunnelConfig, "quiz"> & {
  quiz: Omit<FunnelConfig["quiz"], "questions"> & {
    questions: FunnelConfig["quiz"]["questions"];
  };
};

export const TEMPLATE_META: TemplateMeta[] = [
  {
    id: "coaching-lead-gen",
    name: "Coaching — Lead Gen",
    description: "Qualify prospects for your coaching program with a discovery quiz.",
    industry: "coaching",
    archetype: "lead-gen",
    iconName: "GraduationCap",
  },
  {
    id: "coaching-webinar",
    name: "Coaching — Webinar Funnel",
    description: "Invite high-fit leads to a live training or masterclass.",
    industry: "coaching",
    archetype: "webinar",
    iconName: "Video",
  },
  {
    id: "coaching-vsl",
    name: "Coaching — VSL Funnel",
    description: "Send qualified leads to a video sales letter before booking.",
    industry: "coaching",
    archetype: "vsl",
    iconName: "PlayCircle",
  },
  {
    id: "agency-lead-gen",
    name: "Agency — Lead Gen",
    description: "Score inbound leads and route them to the right closer.",
    industry: "agency",
    archetype: "lead-gen",
    iconName: "Briefcase",
  },
  {
    id: "agency-webinar",
    name: "Agency — Webinar Funnel",
    description: "Qualify prospects before inviting them to an agency workshop.",
    industry: "agency",
    archetype: "webinar",
    iconName: "Monitor",
  },
  {
    id: "agency-vsl",
    name: "Agency — VSL Funnel",
    description: "Warm up leads with a case-study video before the call.",
    industry: "agency",
    archetype: "vsl",
    iconName: "Film",
  },
  {
    id: "ecommerce-lead-gen",
    name: "E-commerce — Lead Gen",
    description: "Capture and qualify buyers for a high-ticket product or bundle.",
    industry: "ecommerce",
    archetype: "lead-gen",
    iconName: "ShoppingBag",
  },
  {
    id: "ecommerce-webinar",
    name: "E-commerce — Webinar Funnel",
    description: "Drive e-commerce customers to a product demo or live launch.",
    industry: "ecommerce",
    archetype: "webinar",
    iconName: "Presentation",
  },
  {
    id: "ecommerce-vsl",
    name: "E-commerce — VSL Funnel",
    description: "Qualify shoppers and send high-intent buyers to a product video.",
    industry: "ecommerce",
    archetype: "vsl",
    iconName: "ShoppingCart",
  },
];

const BASE_BRAND: FunnelConfig["brand"] = {
  name: "Your Business Name",
  primaryColor: "#2D6A4F",
  primaryColorLight: "#E8F5E9",
  primaryColorDark: "#1B5E20",
  fontHeading: "Inter",
  fontBody: "Inter",
  logoUrl: "",
};

const BASE_THRESHOLDS: FunnelConfig["quiz"]["thresholds"] = {
  high: 75,
  mid: 40,
};

const BASE_CALENDARS: FunnelConfig["quiz"]["calendars"] = {
  high: "",
  mid: "",
  low: "",
};

const BASE_WEBHOOK: FunnelConfig["webhook"] = { url: "" };

export const FUNNEL_TEMPLATES: Record<TemplateId, PartialFunnelConfig> = {
  "coaching-lead-gen": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Is Your Business Ready to Scale with Coaching?",
      subheadline: "Answer 4 quick questions to see if you qualify for a free strategy session.",
      questions: [
        {
          key: "current_revenue",
          text: "What is your current monthly revenue?",
          options: [
            { id: "a", label: "Under $5k / month", points: 10 },
            { id: "b", label: "$5k – $20k / month", points: 30 },
            { id: "c", label: "$20k – $50k / month", points: 60 },
            { id: "d", label: "Over $50k / month", points: 90 },
          ],
        },
        {
          key: "goal",
          text: "What is your primary goal for the next 90 days?",
          options: [
            { id: "a", label: "Get my first 5 clients", points: 20 },
            { id: "b", label: "Replace my 9-5 income", points: 40 },
            { id: "c", label: "Reach consistent $10k months", points: 60 },
            { id: "d", label: "Scale beyond $50k / month", points: 90 },
          ],
        },
        {
          key: "commitment",
          text: "How committed are you to investing in your growth?",
          options: [
            { id: "a", label: "Just exploring options", points: 5 },
            { id: "b", label: "Ready to invest if it's a fit", points: 50 },
            { id: "c", label: "Already budgeted and ready to start", points: 90 },
          ],
        },
        {
          key: "timeline",
          text: "When are you looking to get started?",
          options: [
            { id: "a", label: "Within the next week", points: 90 },
            { id: "b", label: "Within the next month", points: 60 },
            { id: "c", label: "In the next 3–6 months", points: 30 },
            { id: "d", label: "Just researching for now", points: 5 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Free Strategy Session",
      description: "Find out if you qualify for a free coaching strategy session.",
    },
  },

  "coaching-webinar": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Secure Your Seat at Our Free Masterclass",
      subheadline: "Tell us a bit about yourself so we can confirm your spot.",
      questions: [
        {
          key: "role",
          text: "How would you describe yourself?",
          options: [
            { id: "a", label: "Aspiring coach just getting started", points: 20 },
            { id: "b", label: "Part-time coach looking to go full-time", points: 50 },
            { id: "c", label: "Full-time coach wanting to scale", points: 90 },
            { id: "d", label: "Business owner adding coaching services", points: 70 },
          ],
        },
        {
          key: "biggest_challenge",
          text: "What is your biggest challenge right now?",
          options: [
            { id: "a", label: "Getting consistent leads", points: 70 },
            { id: "b", label: "Converting leads to clients", points: 80 },
            { id: "c", label: "Pricing and packaging my offers", points: 60 },
            { id: "d", label: "Building systems so I can scale", points: 90 },
          ],
        },
        {
          key: "attend_live",
          text: "Can you attend the masterclass live?",
          options: [
            { id: "a", label: "Yes, I will be there live", points: 90 },
            { id: "b", label: "I prefer the replay", points: 50 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Free Masterclass",
      description: "Reserve your seat for our free live masterclass.",
    },
  },

  "coaching-vsl": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Watch How We Help Coaches Build a 6-Figure Business",
      subheadline: "Answer 3 questions to unlock the full video training.",
      questions: [
        {
          key: "business_stage",
          text: "What stage is your coaching business at?",
          options: [
            { id: "a", label: "Pre-launch — no clients yet", points: 20 },
            { id: "b", label: "Early stage — 1-5 clients", points: 50 },
            { id: "c", label: "Growing — 5-15 clients", points: 70 },
            { id: "d", label: "Established — scaling beyond 15 clients", points: 90 },
          ],
        },
        {
          key: "revenue_target",
          text: "What revenue target are you working toward?",
          options: [
            { id: "a", label: "$5k / month", points: 20 },
            { id: "b", label: "$10k / month", points: 50 },
            { id: "c", label: "$25k / month", points: 75 },
            { id: "d", label: "$50k+ / month", points: 90 },
          ],
        },
        {
          key: "ready_to_invest",
          text: "Are you open to investing in a proven coaching system?",
          options: [
            { id: "a", label: "Yes, if it's the right fit", points: 90 },
            { id: "b", label: "Maybe — I want to learn more first", points: 50 },
            { id: "c", label: "Not at this time", points: 5 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Watch the Training",
      description: "Unlock the free video training for coaches.",
    },
  },

  "agency-lead-gen": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Is Your Business a Good Fit for Our Agency?",
      subheadline: "Take our 60-second assessment to find out if we can help you grow.",
      questions: [
        {
          key: "monthly_adspend",
          text: "What is your current monthly ad spend?",
          options: [
            { id: "a", label: "Under $1k / month", points: 10 },
            { id: "b", label: "$1k – $5k / month", points: 30 },
            { id: "c", label: "$5k – $20k / month", points: 70 },
            { id: "d", label: "Over $20k / month", points: 90 },
          ],
        },
        {
          key: "primary_goal",
          text: "What is your primary growth goal?",
          options: [
            { id: "a", label: "Get more leads from paid ads", points: 80 },
            { id: "b", label: "Improve website conversion rate", points: 70 },
            { id: "c", label: "Scale revenue with proven systems", points: 90 },
            { id: "d", label: "Reduce cost per acquisition", points: 75 },
          ],
        },
        {
          key: "decision_timeline",
          text: "How soon are you looking to start?",
          options: [
            { id: "a", label: "Immediately", points: 90 },
            { id: "b", label: "Within 30 days", points: 70 },
            { id: "c", label: "1 – 3 months", points: 40 },
            { id: "d", label: "Just exploring", points: 10 },
          ],
        },
        {
          key: "monthly_budget",
          text: "What monthly budget can you allocate for marketing services?",
          options: [
            { id: "a", label: "Under $1,500 / month", points: 10 },
            { id: "b", label: "$1,500 – $3,000 / month", points: 40 },
            { id: "c", label: "$3,000 – $7,500 / month", points: 75 },
            { id: "d", label: "Over $7,500 / month", points: 90 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Free Growth Audit",
      description: "See if your business qualifies for a free growth audit with our agency.",
    },
  },

  "agency-webinar": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Join Our Agency Growth Workshop",
      subheadline: "Answer a few questions to confirm your seat.",
      questions: [
        {
          key: "business_type",
          text: "What type of business do you run?",
          options: [
            { id: "a", label: "E-commerce / DTC brand", points: 80 },
            { id: "b", label: "SaaS or software company", points: 70 },
            { id: "c", label: "Service business or agency", points: 60 },
            { id: "d", label: "Brick-and-mortar / local business", points: 50 },
          ],
        },
        {
          key: "annual_revenue",
          text: "What is your annual revenue?",
          options: [
            { id: "a", label: "Under $250k", points: 20 },
            { id: "b", label: "$250k – $1M", points: 50 },
            { id: "c", label: "$1M – $5M", points: 80 },
            { id: "d", label: "Over $5M", points: 90 },
          ],
        },
        {
          key: "attend_live",
          text: "Can you attend the workshop live?",
          options: [
            { id: "a", label: "Yes, I will attend live", points: 90 },
            { id: "b", label: "I'll watch the replay", points: 50 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Agency Growth Workshop",
      description: "Reserve your free seat at our agency growth workshop.",
    },
  },

  "agency-vsl": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "See the Exact System We Use to Get Clients 3x ROI",
      subheadline: "Answer 3 questions to unlock the case study video.",
      questions: [
        {
          key: "biggest_pain",
          text: "What is your biggest marketing challenge right now?",
          options: [
            { id: "a", label: "Not enough leads coming in", points: 80 },
            { id: "b", label: "Leads aren't converting to sales", points: 70 },
            { id: "c", label: "Ad spend is not profitable", points: 90 },
            { id: "d", label: "Can't scale without losing quality", points: 85 },
          ],
        },
        {
          key: "tried_before",
          text: "Have you worked with a marketing agency before?",
          options: [
            { id: "a", label: "No, this would be my first time", points: 50 },
            { id: "b", label: "Yes, but I didn't see results", points: 70 },
            { id: "c", label: "Yes, and I'm looking for something better", points: 90 },
          ],
        },
        {
          key: "monthly_budget",
          text: "What monthly budget do you have for growth?",
          options: [
            { id: "a", label: "Under $2,000 / month", points: 10 },
            { id: "b", label: "$2,000 – $5,000 / month", points: 50 },
            { id: "c", label: "$5,000 – $15,000 / month", points: 80 },
            { id: "d", label: "Over $15,000 / month", points: 90 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Watch the Case Study",
      description: "Unlock the case study video and see how we deliver results.",
    },
  },

  "ecommerce-lead-gen": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Find the Perfect Product for Your Needs",
      subheadline: "Tell us about yourself and we'll match you with our best solution.",
      questions: [
        {
          key: "shopping_goal",
          text: "What are you primarily looking for?",
          options: [
            { id: "a", label: "A solution for personal use", points: 60 },
            { id: "b", label: "A gift for someone special", points: 40 },
            { id: "c", label: "Bulk or wholesale purchase", points: 90 },
            { id: "d", label: "Just browsing and comparing options", points: 20 },
          ],
        },
        {
          key: "budget",
          text: "What is your budget for this purchase?",
          options: [
            { id: "a", label: "Under $100", points: 20 },
            { id: "b", label: "$100 – $500", points: 50 },
            { id: "c", label: "$500 – $2,000", points: 75 },
            { id: "d", label: "Over $2,000", points: 90 },
          ],
        },
        {
          key: "timeline",
          text: "When are you looking to purchase?",
          options: [
            { id: "a", label: "Right now — I'm ready to buy", points: 90 },
            { id: "b", label: "Within the next week", points: 70 },
            { id: "c", label: "Within the next month", points: 40 },
            { id: "d", label: "Still researching", points: 10 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Find Your Perfect Match",
      description: "Take our quick quiz to find the right product for you.",
    },
  },

  "ecommerce-webinar": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "Join Our Free Live Product Demo",
      subheadline: "Answer a few questions to secure your spot.",
      questions: [
        {
          key: "familiarity",
          text: "How familiar are you with our products?",
          options: [
            { id: "a", label: "Brand new — just discovered you", points: 40 },
            { id: "b", label: "I've seen your ads or content", points: 60 },
            { id: "c", label: "I've purchased before", points: 80 },
            { id: "d", label: "I'm a repeat customer", points: 90 },
          ],
        },
        {
          key: "interest",
          text: "What topic interests you most for the demo?",
          options: [
            { id: "a", label: "How to get the best results", points: 80 },
            { id: "b", label: "Comparing options and pricing", points: 70 },
            { id: "c", label: "Wholesale or bulk opportunities", points: 90 },
            { id: "d", label: "Customer success stories", points: 60 },
          ],
        },
        {
          key: "attend_live",
          text: "Can you join us live?",
          options: [
            { id: "a", label: "Yes, I will be there live", points: 90 },
            { id: "b", label: "I'll watch the replay", points: 50 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Free Live Demo",
      description: "Reserve your seat for our free live product demo.",
    },
  },

  "ecommerce-vsl": {
    brand: { ...BASE_BRAND },
    quiz: {
      headline: "See Why Thousands of Customers Choose Us",
      subheadline: "Answer 3 quick questions to unlock the full story.",
      questions: [
        {
          key: "problem",
          text: "What problem are you trying to solve?",
          options: [
            { id: "a", label: "I need a faster or easier solution", points: 70 },
            { id: "b", label: "I need a higher quality option", points: 80 },
            { id: "c", label: "I need better value for my money", points: 60 },
            { id: "d", label: "I need something that actually works", points: 90 },
          ],
        },
        {
          key: "current_solution",
          text: "What are you currently using to solve this problem?",
          options: [
            { id: "a", label: "Nothing yet", points: 60 },
            { id: "b", label: "A competitor's product", points: 80 },
            { id: "c", label: "A DIY or manual approach", points: 70 },
            { id: "d", label: "I've tried several things with no luck", points: 90 },
          ],
        },
        {
          key: "ready_to_buy",
          text: "If our product is the right fit, are you ready to order today?",
          options: [
            { id: "a", label: "Yes, I'm ready to buy", points: 90 },
            { id: "b", label: "I need to see the price first", points: 60 },
            { id: "c", label: "I'm still deciding", points: 30 },
          ],
        },
      ],
      thresholds: { ...BASE_THRESHOLDS },
      calendars: { ...BASE_CALENDARS },
    },
    webhook: { ...BASE_WEBHOOK },
    meta: {
      title: "Your Business Name — Watch the Story",
      description: "Unlock the video and see why customers love us.",
    },
  },
};
