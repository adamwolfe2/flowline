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
    description: "Qualify coaching leads by goals and budget",
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
        headline: "See if you qualify for 1-on-1 coaching",
        subheadline: "Answer 3 quick questions so we can match you with the right program.",
        questions: [
          {
            key: "q1",
            text: "What is your primary goal right now?",
            options: [
              { id: "a", label: "Get clarity on direction", points: 1 },
              { id: "b", label: "Increase revenue", points: 2 },
              { id: "c", label: "Scale my team", points: 3 },
              { id: "d", label: "Exit / sell my business", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What is your current monthly revenue?",
            options: [
              { id: "a", label: "Under $5k", points: 0 },
              { id: "b", label: "$5k-$20k", points: 1 },
              { id: "c", label: "$20k-$100k", points: 2 },
              { id: "d", label: "$100k+", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "How much are you willing to invest in coaching?",
            options: [
              { id: "a", label: "Under $500/mo", points: 0 },
              { id: "b", label: "$500-$1,500/mo", points: 1 },
              { id: "c", label: "$1,500-$5,000/mo", points: 2 },
              { id: "d", label: "$5,000+/mo", points: 3 },
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
        title: "Apply for Coaching",
        description: "Find out if 1-on-1 coaching is the right fit for you.",
      },
    },
  },
  {
    id: "agency",
    name: "Agency Lead Scorer",
    icon: "Briefcase",
    description: "Score agency prospects by revenue and needs",
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
        headline: "See if we can help grow your business",
        subheadline: "Answer 3 questions so our team can prepare a custom proposal.",
        questions: [
          {
            key: "q1",
            text: "What is your company's annual revenue?",
            options: [
              { id: "a", label: "Under $250k", points: 0 },
              { id: "b", label: "$250k-$1M", points: 1 },
              { id: "c", label: "$1M-$5M", points: 2 },
              { id: "d", label: "$5M+", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What service do you need most?",
            options: [
              { id: "a", label: "Brand strategy", points: 1 },
              { id: "b", label: "Paid advertising", points: 2 },
              { id: "c", label: "SEO & content", points: 2 },
              { id: "d", label: "Full-stack marketing", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your monthly marketing budget?",
            options: [
              { id: "a", label: "Under $2k", points: 0 },
              { id: "b", label: "$2k-$10k", points: 1 },
              { id: "c", label: "$10k-$50k", points: 2 },
              { id: "d", label: "$50k+", points: 3 },
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
        title: "Apply to Work With Us",
        description: "Find out if our agency is the right partner for your growth.",
      },
    },
  },
  {
    id: "saas",
    name: "SaaS Discovery Call",
    icon: "Laptop",
    description: "Qualify SaaS leads for product demos",
    config: {
      brand: {
        name: "SaaS Discovery",
        logoUrl: "",
        primaryColor: "#0891B2",
        primaryColorLight: "#ECFEFF",
        primaryColorDark: "#0E7490",
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Book a personalized product demo",
        subheadline: "Help us tailor the demo to your exact needs.",
        questions: [
          {
            key: "q1",
            text: "How large is your team?",
            options: [
              { id: "a", label: "Just me", points: 0 },
              { id: "b", label: "2-10 people", points: 1 },
              { id: "c", label: "11-50 people", points: 2 },
              { id: "d", label: "50+ people", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What tool are you currently using?",
            options: [
              { id: "a", label: "Spreadsheets", points: 1 },
              { id: "b", label: "A competitor product", points: 2 },
              { id: "c", label: "Built something in-house", points: 2 },
              { id: "d", label: "Nothing yet", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "When are you looking to implement?",
            options: [
              { id: "a", label: "Just exploring", points: 0 },
              { id: "b", label: "This quarter", points: 1 },
              { id: "c", label: "This month", points: 2 },
              { id: "d", label: "ASAP", points: 3 },
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
        title: "Book a Demo",
        description: "See how our platform can help your team.",
      },
    },
  },
  {
    id: "realestate",
    name: "Real Estate Booking",
    icon: "Home",
    description: "Book property viewings with qualified buyers",
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
        headline: "Find your dream property",
        subheadline: "Answer 3 questions so we can match you with the best listings.",
        questions: [
          {
            key: "q1",
            text: "What is your budget range?",
            options: [
              { id: "a", label: "Under $300k", points: 0 },
              { id: "b", label: "$300k-$600k", points: 1 },
              { id: "c", label: "$600k-$1.2M", points: 2 },
              { id: "d", label: "$1.2M+", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "Are you pre-approved for a mortgage?",
            options: [
              { id: "a", label: "Not yet", points: 0 },
              { id: "b", label: "In progress", points: 1 },
              { id: "c", label: "Yes, pre-approved", points: 3 },
              { id: "d", label: "Cash buyer", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "When are you looking to move?",
            options: [
              { id: "a", label: "Just browsing", points: 0 },
              { id: "b", label: "Within 6 months", points: 1 },
              { id: "c", label: "Within 3 months", points: 2 },
              { id: "d", label: "Within 30 days", points: 3 },
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
        title: "Book a Property Viewing",
        description: "Get matched with properties that fit your needs.",
      },
    },
  },
  {
    id: "fitness",
    name: "Fitness Assessment",
    icon: "Dumbbell",
    description: "Assess clients for training programs",
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
        headline: "Get your personalized training plan",
        subheadline: "Tell us about your goals so we can build the perfect program.",
        questions: [
          {
            key: "q1",
            text: "What is your primary fitness goal?",
            options: [
              { id: "a", label: "Lose weight", points: 1 },
              { id: "b", label: "Build muscle", points: 2 },
              { id: "c", label: "Improve performance", points: 2 },
              { id: "d", label: "Complete transformation", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "How often do you currently work out?",
            options: [
              { id: "a", label: "Never", points: 0 },
              { id: "b", label: "1-2x per week", points: 1 },
              { id: "c", label: "3-4x per week", points: 2 },
              { id: "d", label: "5+ per week", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What level of support do you want?",
            options: [
              { id: "a", label: "Just a workout plan", points: 0 },
              { id: "b", label: "Plan + check-ins", points: 1 },
              { id: "c", label: "1-on-1 coaching", points: 2 },
              { id: "d", label: "Full lifestyle coaching", points: 3 },
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
        title: "Free Fitness Assessment",
        description: "Get a personalized training plan built for your goals.",
      },
    },
  },
  {
    id: "consulting",
    name: "Consulting Intake",
    icon: "LineChart",
    description: "Pre-qualify consulting prospects",
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
        headline: "Apply for a strategy consultation",
        subheadline: "We work with a select number of clients. See if you qualify.",
        questions: [
          {
            key: "q1",
            text: "What is your biggest challenge right now?",
            options: [
              { id: "a", label: "Revenue growth", points: 2 },
              { id: "b", label: "Operational efficiency", points: 2 },
              { id: "c", label: "Market expansion", points: 3 },
              { id: "d", label: "Digital transformation", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What is your company's annual revenue?",
            options: [
              { id: "a", label: "Under $500k", points: 0 },
              { id: "b", label: "$500k-$2M", points: 1 },
              { id: "c", label: "$2M-$10M", points: 2 },
              { id: "d", label: "$10M+", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your timeline for results?",
            options: [
              { id: "a", label: "No rush", points: 0 },
              { id: "b", label: "Within 6 months", points: 1 },
              { id: "c", label: "Within 90 days", points: 2 },
              { id: "d", label: "Urgent — this month", points: 3 },
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
        title: "Apply for a Consultation",
        description: "See if you qualify for our strategy consulting services.",
      },
    },
  },
];
