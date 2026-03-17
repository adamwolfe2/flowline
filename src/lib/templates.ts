import { FunnelConfig } from "@/types";

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  config: FunnelConfig;
}

export const TEMPLATES: Template[] = [
  {
    id: "coaching",
    name: "Coaching Qualifier",
    icon: "Users",
    description: "Qualify coaching leads by readiness, revenue, and commitment level",
    config: {
      brand: {
        name: "Coaching Qualifier",
        logoUrl: "",
        primaryColor: "#2D6A4F",
        primaryColorLight: "#D8F3DC",
        primaryColorDark: "#1B4332",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "See If You're Ready for 1-on-1 Coaching",
        subheadline: "Answer 3 quick questions — takes 30 seconds.",
        questions: [
          {
            key: "q1",
            text: "What's your current monthly revenue?",
            options: [
              { id: "a", label: "Under $5k — just getting started", points: 1 },
              { id: "b", label: "$5k-$20k — growing but inconsistent", points: 2 },
              { id: "c", label: "$20k-$50k — ready to scale systems", points: 3 },
              { id: "d", label: "$50k+ — looking to optimize and exit-proof", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's the #1 thing holding you back right now?",
            options: [
              { id: "a", label: "I don't have a clear offer or niche", points: 1 },
              { id: "b", label: "Lead gen — I need more qualified prospects", points: 2 },
              { id: "c", label: "Fulfillment — I'm the bottleneck in delivery", points: 3 },
              { id: "d", label: "Team and ops — I need to remove myself", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "How soon do you want to see results?",
            options: [
              { id: "a", label: "No rush, just exploring", points: 0 },
              { id: "b", label: "Within the next 3-6 months", points: 1 },
              { id: "c", label: "Within 90 days — I'm committed", points: 2 },
              { id: "d", label: "ASAP — I'm ready to invest now", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/vip-strategy",
          mid: "https://cal.com/your-name/discovery-call",
          low: "https://cal.com/your-name/intro-chat",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "See If You Qualify for 1-on-1 Coaching",
        description: "Take a 30-second quiz to find out if coaching is the right next step for your business.",
      },
    },
  },
  {
    id: "agency",
    name: "Agency Lead Scorer",
    icon: "Briefcase",
    description: "Score agency prospects by deal size, urgency, and service fit",
    config: {
      brand: {
        name: "Agency Lead Scorer",
        logoUrl: "",
        primaryColor: "#4F46E5",
        primaryColorLight: "#EEF2FF",
        primaryColorDark: "#3730A3",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Get a Free Custom Growth Plan",
        subheadline: "Tell us about your business so we can build a tailored strategy.",
        questions: [
          {
            key: "q1",
            text: "What's your current monthly ad spend?",
            options: [
              { id: "a", label: "We're not running ads yet", points: 0 },
              { id: "b", label: "$1k-$10k/mo — testing but inconsistent", points: 1 },
              { id: "c", label: "$10k-$50k/mo — scaling profitably", points: 2 },
              { id: "d", label: "$50k+/mo — need better ROAS", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's the biggest gap in your marketing right now?",
            options: [
              { id: "a", label: "We need a strategy — we're doing things randomly", points: 1 },
              { id: "b", label: "Creative and content — ads feel stale", points: 2 },
              { id: "c", label: "Conversion — traffic isn't turning into revenue", points: 3 },
              { id: "d", label: "Scale — we hit a plateau and can't break through", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your timeline for hiring an agency?",
            options: [
              { id: "a", label: "Just researching for now", points: 0 },
              { id: "b", label: "Within the next quarter", points: 1 },
              { id: "c", label: "Within 30 days", points: 2 },
              { id: "d", label: "Immediately — we have budget approved", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/strategy-session",
          mid: "https://cal.com/your-name/consultation",
          low: "https://cal.com/your-name/intro-call",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "Get Your Free Custom Growth Plan",
        description: "Answer 3 questions and our team will build a personalized marketing strategy for your business.",
      },
    },
  },
  {
    id: "saas",
    name: "SaaS Demo Qualifier",
    icon: "Laptop",
    description: "Route prospects to the right demo based on team size and urgency",
    config: {
      brand: {
        name: "SaaS Demo Qualifier",
        logoUrl: "",
        primaryColor: "#0891B2",
        primaryColorLight: "#ECFEFF",
        primaryColorDark: "#0E7490",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "See How [Product] Works for Your Team",
        subheadline: "Help us personalize your demo — takes 20 seconds.",
        questions: [
          {
            key: "q1",
            text: "How many people would use this tool?",
            options: [
              { id: "a", label: "Just me — solo user", points: 0 },
              { id: "b", label: "2-10 — small team", points: 1 },
              { id: "c", label: "11-50 — growing org", points: 2 },
              { id: "d", label: "50+ — enterprise", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What are you using today?",
            options: [
              { id: "a", label: "Spreadsheets and manual processes", points: 1 },
              { id: "b", label: "A free tool that we've outgrown", points: 2 },
              { id: "c", label: "A competitor — but we're evaluating alternatives", points: 3 },
              { id: "d", label: "Nothing — this is a new initiative", points: 1 },
            ],
          },
          {
            key: "q3",
            text: "When do you need a solution in place?",
            options: [
              { id: "a", label: "No timeline — just exploring", points: 0 },
              { id: "b", label: "Next quarter", points: 1 },
              { id: "c", label: "This month", points: 2 },
              { id: "d", label: "This week — it's urgent", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/enterprise-demo",
          mid: "https://cal.com/your-name/product-demo",
          low: "https://cal.com/your-name/quick-intro",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "Book a Personalized Product Demo",
        description: "Answer 3 quick questions so we can tailor the demo to your team's needs.",
      },
    },
  },
  {
    id: "realestate",
    name: "Real Estate Qualifier",
    icon: "Home",
    description: "Identify serious buyers by readiness, financing, and timeline",
    config: {
      brand: {
        name: "Property Qualifier",
        logoUrl: "",
        primaryColor: "#DC2626",
        primaryColorLight: "#FEF2F2",
        primaryColorDark: "#B91C1C",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Find Your Perfect Property in 30 Seconds",
        subheadline: "We'll match you with listings that fit — no spam, just results.",
        questions: [
          {
            key: "q1",
            text: "Where are you in the buying process?",
            options: [
              { id: "a", label: "Just starting to look — researching areas", points: 0 },
              { id: "b", label: "Actively browsing listings online", points: 1 },
              { id: "c", label: "Pre-approved and ready to tour", points: 3 },
              { id: "d", label: "Cash buyer — ready to move fast", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What type of property are you looking for?",
            options: [
              { id: "a", label: "Starter home under $350k", points: 1 },
              { id: "b", label: "Family home $350k-$750k", points: 2 },
              { id: "c", label: "Luxury property $750k-$1.5M", points: 3 },
              { id: "d", label: "Investment property or multi-unit", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "When do you need to move?",
            options: [
              { id: "a", label: "No rush — 6+ months out", points: 0 },
              { id: "b", label: "3-6 months", points: 1 },
              { id: "c", label: "1-3 months", points: 2 },
              { id: "d", label: "Under 30 days — lease ending or relocating", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/priority-viewing",
          mid: "https://cal.com/your-name/property-consultation",
          low: "https://cal.com/your-name/buyer-intro",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "Get Matched With Your Dream Property",
        description: "Answer 3 quick questions and we'll connect you with listings that actually fit.",
      },
    },
  },
  {
    id: "fitness",
    name: "Fitness Assessment",
    icon: "Dumbbell",
    description: "Match clients to the right program by experience, goals, and commitment",
    config: {
      brand: {
        name: "Fitness Assessment",
        logoUrl: "",
        primaryColor: "#EA580C",
        primaryColorLight: "#FFF7ED",
        primaryColorDark: "#C2410C",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Discover Your Ideal Training Program",
        subheadline: "Answer 3 questions and we'll recommend the best plan for your body and goals.",
        questions: [
          {
            key: "q1",
            text: "What's your #1 fitness goal right now?",
            options: [
              { id: "a", label: "Lose 10-30 lbs and feel confident", points: 1 },
              { id: "b", label: "Build lean muscle and get stronger", points: 2 },
              { id: "c", label: "Train for a specific event or sport", points: 2 },
              { id: "d", label: "Complete body transformation — all-in", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's your experience with structured training?",
            options: [
              { id: "a", label: "Brand new — never had a real program", points: 1 },
              { id: "b", label: "Intermediate — I train but lack consistency", points: 2 },
              { id: "c", label: "Advanced — I train regularly but plateaued", points: 3 },
              { id: "d", label: "Returning — used to be fit, want it back", points: 2 },
            ],
          },
          {
            key: "q3",
            text: "How much accountability do you want?",
            options: [
              { id: "a", label: "Just send me a plan — I'll follow it", points: 0 },
              { id: "b", label: "Weekly check-ins to stay on track", points: 1 },
              { id: "c", label: "1-on-1 coaching with form review", points: 2 },
              { id: "d", label: "Full lifestyle coaching — nutrition, sleep, training", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/vip-assessment",
          mid: "https://cal.com/your-name/fitness-consult",
          low: "https://cal.com/your-name/free-assessment",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "Get Your Personalized Training Plan",
        description: "Take a 30-second assessment and discover the program that fits your goals and lifestyle.",
      },
    },
  },
  {
    id: "consulting",
    name: "Consulting Intake",
    icon: "LineChart",
    description: "Pre-qualify consulting prospects by challenge, scale, and urgency",
    config: {
      brand: {
        name: "Consulting Intake",
        logoUrl: "",
        primaryColor: "#7C3AED",
        primaryColorLight: "#F5F3FF",
        primaryColorDark: "#6D28D9",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "See If We're the Right Fit for Your Business",
        subheadline: "We only take on a handful of clients each quarter. Let's find out if there's a match.",
        questions: [
          {
            key: "q1",
            text: "What would make the biggest impact on your business in the next 90 days?",
            options: [
              { id: "a", label: "Clarifying our positioning and go-to-market", points: 2 },
              { id: "b", label: "Fixing broken sales or fulfillment processes", points: 2 },
              { id: "c", label: "Breaking into a new market or vertical", points: 3 },
              { id: "d", label: "Building a leadership team so I can step back", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's your company's annual revenue?",
            options: [
              { id: "a", label: "Under $500k — pre-product-market fit", points: 0 },
              { id: "b", label: "$500k-$2M — proven model, need to scale", points: 1 },
              { id: "c", label: "$2M-$10M — scaling but hitting ceilings", points: 2 },
              { id: "d", label: "$10M+ — optimizing for leverage or exit", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "How quickly do you need to see movement?",
            options: [
              { id: "a", label: "No rush — planning for next year", points: 0 },
              { id: "b", label: "This quarter — we have a window", points: 1 },
              { id: "c", label: "Within 30 days — we're losing momentum", points: 2 },
              { id: "d", label: "Urgent — the board or investors are involved", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: {
          high: "https://cal.com/your-name/executive-strategy",
          mid: "https://cal.com/your-name/consultation",
          low: "https://cal.com/your-name/intro-call",
        },
      },
      webhook: { url: "" },
      meta: {
        title: "Apply for a Strategy Consultation",
        description: "Answer 3 questions to see if our consulting services are the right fit for your business.",
      },
    },
  },
];
