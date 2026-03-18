import { FunnelConfig } from "@/types";

export const DEFAULT_FUNNEL_CONFIG: FunnelConfig = {
  brand: {
    name: "My Business",
    logoUrl: "",
    primaryColor: "#2563EB",
    primaryColorLight: "#EFF6FF",
    primaryColorDark: "#1D4ED8",
    fontHeading: "Inter",
    fontBody: "Inter",
  },
  quiz: {
    headline: "Find out if you qualify for our program",
    subheadline: "Answer 3 quick questions to see if we're a fit.",
    questions: [
      {
        key: "q1",
        text: "What is your current monthly revenue?",
        options: [
          { id: "a", label: "Under $10k", points: 0 },
          { id: "b", label: "$10k-$50k", points: 1 },
          { id: "c", label: "$50k-$200k", points: 2 },
          { id: "d", label: "$200k+", points: 3 },
        ],
      },
      {
        key: "q2",
        text: "How are you currently getting clients?",
        options: [
          { id: "a", label: "Referrals only", points: 0 },
          { id: "b", label: "Some outbound", points: 1 },
          { id: "c", label: "Paid ads", points: 2 },
          { id: "d", label: "Multiple channels", points: 3 },
        ],
      },
      {
        key: "q3",
        text: "What's your biggest bottleneck right now?",
        options: [
          { id: "a", label: "Not enough leads", points: 1 },
          { id: "b", label: "Low close rate", points: 2 },
          { id: "c", label: "Can't scale fulfillment", points: 3 },
          { id: "d", label: "All of the above", points: 3 },
        ],
      },
    ],
    thresholds: { high: 7, mid: 4 },
    ctaButtonText: "Take the Quiz — It Takes 60 Seconds",
    emailHeadline: "One last step",
    emailSubtext: "Enter your email to see your results and book your call.",
    emailButtonText: "See My Results & Book a Call",
    successHeadline: "You qualify!",
    successSubtext: "We sent a confirmation to {email}. Pick a time that works for you below.",
    badgeText: "Free Application",
    calendars: {
      high: "https://cal.com/your-name/hot-lead",
      mid: "https://cal.com/your-name/warm-lead",
      low: "https://cal.com/your-name/intro-call",
    },
  },
  webhook: { url: "" },
  meta: {
    title: "Apply | My Business",
    description: "See if you qualify for our program.",
  },
  tracking: {
    fbPixelId: "",
    tiktokPixelId: "",
    ga4MeasurementId: "",
  },
};
