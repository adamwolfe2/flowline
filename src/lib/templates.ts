import { FunnelConfig } from "@/types";

export interface FunnelTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  config: FunnelConfig;
}

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    id: "coaching",
    name: "Coaching Qualifier",
    category: "Coaching",
    icon: "Users",
    description: "Qualify coaching leads based on revenue, commitment level, and goals.",
    config: {
      brand: {
        name: "My Coaching Program",
        logoUrl: "",
        primaryColor: "#2D6A4F",
        primaryColorLight: "#D1FAE5",
        primaryColorDark: "#1B4332",
        fontHeading: "DM Sans",
        fontBody: "Inter",
      },
      quiz: {
        headline: "See if you qualify for our coaching program",
        subheadline: "Answer 3 quick questions to find out if we're a fit.",
        ctaButtonText: "Start Your Application",
        badgeText: "Free Application",
        emailHeadline: "Almost there!",
        emailSubtext: "Enter your email to see your results and book a strategy call.",
        emailButtonText: "See My Results",
        successHeadline: "Great news - you qualify!",
        successSubtext: "We sent a confirmation to {email}. Book your free strategy call below.",
        trustBadges: ["No commitment required", "Results in 60 seconds", "100% confidential"],
        questions: [
          {
            key: "q1",
            text: "What is your current monthly revenue?",
            options: [
              { id: "a", label: "Under $5k", points: 0 },
              { id: "b", label: "$5k - $20k", points: 1 },
              { id: "c", label: "$20k - $100k", points: 2 },
              { id: "d", label: "$100k+", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "How committed are you to growing your business?",
            options: [
              { id: "a", label: "Just exploring", points: 0 },
              { id: "b", label: "Somewhat committed", points: 1 },
              { id: "c", label: "Very committed", points: 2 },
              { id: "d", label: "All in - ready to invest", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your primary goal right now?",
            options: [
              { id: "a", label: "Get more clients", points: 1 },
              { id: "b", label: "Increase revenue per client", points: 2 },
              { id: "c", label: "Build a team", points: 2 },
              { id: "d", label: "Scale to 7 figures", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
      },
      webhook: { url: "" },
      meta: { title: "Apply | Coaching Program", description: "See if you qualify for our coaching program." },
    },
  },
  {
    id: "saas-demo",
    name: "SaaS Demo Booker",
    category: "SaaS",
    icon: "Laptop",
    description: "Qualify SaaS prospects by team size, current tools, and pain points.",
    config: {
      brand: {
        name: "My SaaS Product",
        logoUrl: "",
        primaryColor: "#4F46E5",
        primaryColorLight: "#EEF2FF",
        primaryColorDark: "#3730A3",
        fontHeading: "Plus Jakarta Sans",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Find out which plan is right for your team",
        subheadline: "Takes 60 seconds. Get a personalized recommendation.",
        ctaButtonText: "Get My Recommendation",
        badgeText: "Free Assessment",
        emailHeadline: "Your recommendation is ready",
        emailSubtext: "Enter your work email to see your personalized plan and book a demo.",
        emailButtonText: "See My Plan",
        successHeadline: "We've found your perfect plan!",
        successSubtext: "We sent the details to {email}. Book a demo to get started.",
        trustBadges: ["No credit card needed", "Personalized results", "Talk to a human"],
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
            text: "What tools are you currently using?",
            options: [
              { id: "a", label: "Spreadsheets only", points: 0 },
              { id: "b", label: "Basic free tools", points: 1 },
              { id: "c", label: "A competitor product", points: 2 },
              { id: "d", label: "Multiple paid tools", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your biggest pain point?",
            options: [
              { id: "a", label: "Manual processes", points: 1 },
              { id: "b", label: "Scaling operations", points: 2 },
              { id: "c", label: "Data & reporting", points: 2 },
              { id: "d", label: "Team collaboration", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
      },
      webhook: { url: "" },
      meta: { title: "Find Your Plan", description: "Get a personalized product recommendation." },
    },
  },
  {
    id: "agency",
    name: "Agency Lead Scorer",
    category: "Agency",
    icon: "Briefcase",
    description: "Qualify marketing agency leads by company size, budget, channels, and challenges.",
    config: {
      brand: {
        name: "My Agency",
        logoUrl: "",
        primaryColor: "#0F172A",
        primaryColorLight: "#F1F5F9",
        primaryColorDark: "#020617",
        fontHeading: "Space Grotesk",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Let's see if we can help grow your business",
        subheadline: "Answer 4 questions to get a custom growth plan.",
        ctaButtonText: "Get My Growth Plan",
        badgeText: "Free Strategy Session",
        emailHeadline: "Your growth plan is ready",
        emailSubtext: "Enter your email to unlock your custom strategy.",
        emailButtonText: "Unlock My Strategy",
        successHeadline: "Your custom plan is ready!",
        successSubtext: "We sent the details to {email}. Book a call to discuss your strategy.",
        trustBadges: ["Free consultation included", "No long-term contracts", "Proven strategies"],
        questions: [
          {
            key: "q1",
            text: "How large is your company?",
            options: [
              { id: "a", label: "Solo / freelancer", points: 0 },
              { id: "b", label: "2-10 employees", points: 1 },
              { id: "c", label: "11-50 employees", points: 2 },
              { id: "d", label: "50+ employees", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's your monthly marketing spend?",
            options: [
              { id: "a", label: "Under $2k", points: 0 },
              { id: "b", label: "$2k - $10k", points: 1 },
              { id: "c", label: "$10k - $50k", points: 2 },
              { id: "d", label: "$50k+", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What's your biggest marketing challenge?",
            options: [
              { id: "a", label: "Getting started", points: 0 },
              { id: "b", label: "Generating quality leads", points: 1 },
              { id: "c", label: "Scaling what works", points: 2 },
              { id: "d", label: "Improving ROI across channels", points: 3 },
            ],
          },
          {
            key: "q4",
            text: "Which channels are you using today?",
            options: [
              { id: "a", label: "None / Organic only", points: 0 },
              { id: "b", label: "Social media ads", points: 1 },
              { id: "c", label: "Google + Social", points: 2 },
              { id: "d", label: "Full omnichannel", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
      },
      webhook: { url: "" },
      meta: { title: "Free Growth Plan", description: "Get a custom growth strategy for your business." },
    },
  },
  {
    id: "real-estate",
    name: "Real Estate Buyer",
    category: "Real Estate",
    icon: "Home",
    description: "Qualify home buyers by budget, timeline, and location preferences.",
    config: {
      brand: {
        name: "My Real Estate Team",
        logoUrl: "",
        primaryColor: "#92400E",
        primaryColorLight: "#FEF3C7",
        primaryColorDark: "#78350F",
        fontHeading: "Outfit",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Find your dream home faster",
        subheadline: "Answer 3 questions and we'll match you with the right properties.",
        ctaButtonText: "Find My Match",
        badgeText: "Free Home Search",
        emailHeadline: "We found your matches!",
        emailSubtext: "Enter your email to see personalized listings and book a viewing.",
        emailButtonText: "See My Matches",
        successHeadline: "Great matches found!",
        successSubtext: "We sent property matches to {email}. Book a viewing below.",
        trustBadges: ["Licensed agents", "No obligation", "Local market experts"],
        questions: [
          {
            key: "q1",
            text: "What's your budget range?",
            options: [
              { id: "a", label: "Under $300k", points: 0 },
              { id: "b", label: "$300k - $600k", points: 1 },
              { id: "c", label: "$600k - $1M", points: 2 },
              { id: "d", label: "$1M+", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "When are you looking to move?",
            options: [
              { id: "a", label: "Just browsing", points: 0 },
              { id: "b", label: "Within 6 months", points: 1 },
              { id: "c", label: "Within 3 months", points: 2 },
              { id: "d", label: "As soon as possible", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "What type of area do you prefer?",
            options: [
              { id: "a", label: "Rural / countryside", points: 1 },
              { id: "b", label: "Suburban neighborhood", points: 2 },
              { id: "c", label: "Urban / city center", points: 2 },
              { id: "d", label: "Waterfront / luxury", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
      },
      webhook: { url: "" },
      meta: { title: "Find Your Dream Home", description: "Get matched with the right properties." },
    },
  },
  {
    id: "fitness",
    name: "Fitness Assessment",
    category: "Health & Fitness",
    icon: "Dumbbell",
    description: "Qualify fitness coaching leads by goals, experience, and commitment level.",
    config: {
      brand: {
        name: "My Fitness Program",
        logoUrl: "",
        primaryColor: "#DC2626",
        primaryColorLight: "#FEE2E2",
        primaryColorDark: "#991B1B",
        fontHeading: "Sora",
        fontBody: "Inter",
      },
      quiz: {
        headline: "Get your custom fitness plan",
        subheadline: "Answer 3 questions and we'll build your personalized program.",
        ctaButtonText: "Build My Plan",
        badgeText: "Free Assessment",
        emailHeadline: "Your plan is ready!",
        emailSubtext: "Enter your email to get your custom fitness program.",
        emailButtonText: "Get My Program",
        successHeadline: "Your program is ready!",
        successSubtext: "We sent your custom plan to {email}. Book your free consultation below.",
        trustBadges: ["Certified trainers", "Personalized plan", "No gym required"],
        questions: [
          {
            key: "q1",
            text: "What's your primary fitness goal?",
            options: [
              { id: "a", label: "Lose weight", points: 1 },
              { id: "b", label: "Build muscle", points: 2 },
              { id: "c", label: "Improve performance", points: 2 },
              { id: "d", label: "Complete transformation", points: 3 },
            ],
          },
          {
            key: "q2",
            text: "What's your current fitness level?",
            options: [
              { id: "a", label: "Beginner", points: 0 },
              { id: "b", label: "Intermediate", points: 1 },
              { id: "c", label: "Advanced", points: 2 },
              { id: "d", label: "Former athlete", points: 3 },
            ],
          },
          {
            key: "q3",
            text: "How many days per week can you commit?",
            options: [
              { id: "a", label: "1-2 days", points: 0 },
              { id: "b", label: "3-4 days", points: 1 },
              { id: "c", label: "5-6 days", points: 2 },
              { id: "d", label: "Every day", points: 3 },
            ],
          },
        ],
        thresholds: { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
      },
      webhook: { url: "" },
      meta: { title: "Custom Fitness Plan", description: "Get a personalized fitness program." },
    },
  },
];

/** Look up a template by ID */
export function getTemplateById(templateId: string): FunnelTemplate | undefined {
  return FUNNEL_TEMPLATES.find(t => t.id === templateId);
}
