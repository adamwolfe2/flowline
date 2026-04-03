export interface FeatureItem {
  name: string;
  myvsl: boolean | string;
  competitor: boolean | string;
}

export interface FeatureCategory {
  category: string;
  items: FeatureItem[];
}

export interface CompetitorPricing {
  myvsl: { free: string; pro: string; agency: string };
  competitor: { plans: Array<{ name: string; price: string }> };
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface CompetitorData {
  slug: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  features: FeatureCategory[];
  pricing: CompetitorPricing;
  sections: ContentSection[];
  ctaHeading: string;
  ctaDescription: string;
}

export const competitors: CompetitorData[] = [
  {
    slug: "perspective",
    name: "Perspective Funnels",
    tagline: "MyVSL vs Perspective Funnels: The Smarter Quiz Funnel Builder",
    metaTitle: "MyVSL vs Perspective Funnels | Best Perspective Alternative 2026",
    metaDescription:
      "Compare MyVSL and Perspective Funnels side by side. See why MyVSL's AI-powered quiz funnels with lead scoring and calendar routing outperform Perspective.",
    heroDescription:
      "Perspective Funnels is known for mobile-first funnel building with a swipeable story format. MyVSL takes a different approach: AI generates your entire quiz funnel from a business description, complete with lead scoring and tier-based calendar routing. Here is how they compare across features, pricing, and capabilities.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Pre-built templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive funnels", myvsl: true, competitor: true },
          { name: "Mobile-first swipe format", myvsl: false, competitor: true },
          { name: "Generate funnel from website URL", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: false },
          { name: "Tier-based routing (high/mid/low)", myvsl: true, competitor: false },
          { name: "Conditional logic", myvsl: true, competitor: true },
          { name: "Multi-step forms", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: true },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: false },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Exit-intent triggers", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: "Limited" },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: true },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: "Limited" },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "UTM source attribution", myvsl: true, competitor: "Limited" },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: "Add-on" },
          { name: "Team workspaces", myvsl: true, competitor: "Limited" },
          { name: "API access", myvsl: true, competitor: false },
          { name: "Free plan available", myvsl: true, competitor: false },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Basic", price: "$63/mo (billed annually)" },
          { name: "Pro", price: "$99/mo (billed annually)" },
          { name: "Business", price: "$199/mo (billed annually)" },
        ],
      },
    },
    sections: [
      {
        heading: "How Perspective Funnels Works",
        body: "Perspective Funnels has built its reputation on a mobile-first approach to funnel building. Their signature feature is a swipeable, story-like format inspired by social media experiences. You build funnels using a drag-and-drop editor with blocks for text, images, video, forms, and calendars. The platform targets service businesses, coaches, and agencies who want a mobile-optimized lead capture experience.\n\nPerspective offers templates organized by industry and use case, along with integrations for CRMs, email tools, and calendar booking. Their builder focuses heavily on the visual presentation layer, with attention to animations and transitions that feel native to mobile browsing. For teams that primarily target mobile traffic from social media ads, Perspective delivers a polished end-user experience.",
      },
      {
        heading: "Where MyVSL Goes Further",
        body: "While Perspective gives you a beautiful mobile builder, MyVSL rethinks the entire funnel creation process. Instead of starting with a blank template, you describe your business in plain English and the AI generates a complete quiz funnel with questions, scoring logic, tier-based calendar routing, and follow-up email sequences. What might take hours of design work in Perspective happens in under 60 seconds with MyVSL.\n\nMyVSL also includes built-in lead scoring that Perspective lacks entirely. Every quiz response earns points, and leads are automatically routed to different calendar links or outcomes based on their score tier. High-value prospects can be fast-tracked to your premium booking calendar while lower-scoring leads receive nurture sequences instead. This scoring-to-routing pipeline is native to MyVSL and requires no third-party integrations.\n\nAdditionally, MyVSL includes email sequences, popup campaigns with exit-intent triggers, and a comprehensive analytics dashboard with waterfall conversion tracking. These features would require separate tools or integrations alongside Perspective.",
      },
      {
        heading: "Who Should Choose Perspective Funnels?",
        body: "Perspective is a strong choice if your primary concern is mobile-first visual design and you want the swipeable story format for social media traffic. If your funnels are heavy on rich media content and you want granular control over mobile animations and transitions, Perspective gives you more design flexibility in that specific area.\n\nTeams already invested in the Perspective ecosystem with existing funnels and workflows may also prefer to stay on the platform rather than migrate. Perspective's integrations with European-focused tools can also be advantageous for businesses operating primarily in the DACH region.",
      },
      {
        heading: "Why MyVSL Is the Better Alternative for Most Teams",
        body: "For coaches, consultants, agencies, and service businesses that want to generate leads efficiently, MyVSL offers more functionality at a lower price point. The AI-powered generation eliminates the design bottleneck, built-in lead scoring removes the need for external scoring tools, and tier-based calendar routing ensures your sales team focuses on the highest-value prospects.\n\nMyVSL also offers a genuinely free plan with real functionality, while Perspective requires a paid subscription starting at $63 per month. For agencies, MyVSL's white-label features and team workspaces at $149 per month provide capabilities that would cost significantly more with Perspective's add-on pricing model.",
      },
    ],
    ctaHeading: "Build a Smarter Funnel Than Perspective in 60 Seconds",
    ctaDescription:
      "Describe your business. Get a complete quiz funnel with lead scoring and calendar routing. Free to start.",
  },

  {
    slug: "typeform",
    name: "Typeform",
    tagline: "MyVSL vs Typeform: From Forms to Full Funnels",
    metaTitle: "MyVSL vs Typeform | Best Typeform Alternative for Quiz Funnels 2026",
    metaDescription:
      "Typeform builds beautiful forms. MyVSL builds complete quiz-to-calendar funnels with AI, lead scoring, and booking automation. See the full comparison.",
    heroDescription:
      "Typeform is the gold standard for beautiful, conversational forms. But when you need more than data collection -- when you need lead scoring, calendar routing, and automated follow-up -- MyVSL picks up where Typeform leaves off. Here is a detailed comparison for teams evaluating their quiz funnel options.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Pre-built templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "One-question-at-a-time format", myvsl: true, competitor: true },
          { name: "Generate funnel from website URL", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz/survey builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: false },
          { name: "Tier-based routing", myvsl: true, competitor: false },
          { name: "Conditional logic / branching", myvsl: true, competitor: true },
          { name: "Calculator fields", myvsl: false, competitor: true },
          { name: "File upload fields", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: "Via Calendly embed" },
          { name: "A/B testing", myvsl: true, competitor: false },
          { name: "Popup campaigns", myvsl: true, competitor: "Via embed only" },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Thank-you page customization", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: "Limited" },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "Zapier/Make integration", myvsl: "Via webhooks", competitor: true },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: "Basic" },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Drop-off analysis", myvsl: true, competitor: true },
          { name: "Lead timeline", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: "Business plan only" },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: true },
          { name: "API access", myvsl: true, competitor: true },
          { name: "Free plan available", myvsl: true, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Free", price: "$0/mo (10 responses/mo)" },
          { name: "Basic", price: "$29/mo" },
          { name: "Plus", price: "$59/mo" },
          { name: "Business", price: "$99/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Typeform Works",
        body: "Typeform revolutionized online forms with its one-question-at-a-time interface. The platform excels at creating engaging, conversational experiences for surveys, quizzes, contact forms, and data collection. With logic jumps, you can branch respondents to different questions based on their answers, and the builder supports a wide range of field types including file uploads, payment collection, and calculator fields.\n\nTypeform integrates with hundreds of tools through native connections and Zapier. Many teams use Typeform as the front end of their lead capture, connecting responses to CRMs, email platforms, and spreadsheets. The design quality is consistently high, with smooth animations and a polished user experience that respondents appreciate.",
      },
      {
        heading: "The Gap Between Forms and Funnels",
        body: "Typeform is fundamentally a form builder, not a funnel builder. When you need to go beyond collecting data -- scoring leads, routing them to different outcomes based on qualification, booking calendar appointments, and triggering automated email follow-up -- you need to stitch together multiple tools. A typical Typeform-based funnel requires Typeform for the quiz, a Zapier connection for scoring logic, Calendly for booking, and a separate email platform for follow-up sequences.\n\nMyVSL consolidates this entire workflow into a single platform. The AI generates your quiz questions, assigns point values, creates scoring tiers, connects calendar routing, and builds email sequences. There is no integration overhead. A lead takes your quiz, gets scored instantly, sees the appropriate calendar based on their tier, and enters an automated email sequence -- all without leaving MyVSL.\n\nTypeform also lacks native A/B testing for form variants. MyVSL includes built-in split testing so you can optimize quiz questions, scoring thresholds, and routing rules to improve conversion rates over time.",
      },
      {
        heading: "Who Should Choose Typeform?",
        body: "Typeform remains the better choice for general-purpose forms, surveys, and data collection where lead scoring and calendar routing are not needed. If you are running employee satisfaction surveys, event registrations, customer feedback loops, or any data-collection workflow that ends at the submission, Typeform's field types and integration ecosystem are more flexible.\n\nTeams that need advanced form capabilities like file uploads, payment fields, or complex calculation logic will also find Typeform more suitable. Typeform's Zapier integration library is also more extensive if you rely on connecting to niche tools in your workflow.",
      },
      {
        heading: "Why MyVSL Is the Better Typeform Alternative for Lead Generation",
        body: "If your goal is converting visitors into qualified leads and booked calls, MyVSL delivers the complete pipeline that Typeform cannot provide on its own. The AI-generated quiz funnel eliminates hours of setup, lead scoring replaces manual qualification, and tier-based calendar routing ensures your best leads talk to your sales team first.\n\nMyVSL's free plan includes 100 submissions per month compared to Typeform's limit of 10 responses. For growing businesses, MyVSL's Pro plan at $49 per month includes unlimited funnels and submissions, while Typeform's comparable Plus plan at $59 per month still caps you on responses. When you factor in the cost of Calendly, an email platform, and Zapier that you would need alongside Typeform, MyVSL provides significantly more value for lead generation use cases.",
      },
    ],
    ctaHeading: "Stop Stitching Together Tools. Build a Complete Funnel.",
    ctaDescription:
      "MyVSL replaces Typeform + Calendly + email sequences with one AI-powered platform. Describe your business and get a funnel in 60 seconds.",
  },

  {
    slug: "leadpages",
    name: "Leadpages",
    tagline: "MyVSL vs Leadpages: Landing Pages vs AI Quiz Funnels",
    metaTitle: "MyVSL vs Leadpages | Best Leadpages Alternative for Quiz Funnels 2026",
    metaDescription:
      "Leadpages builds landing pages. MyVSL builds AI-powered quiz funnels with lead scoring and calendar routing. Compare features, pricing, and capabilities.",
    heroDescription:
      "Leadpages has been a leading landing page builder for over a decade. MyVSL takes a fundamentally different approach: instead of static landing pages, you get AI-generated quiz funnels that score leads and route them to calendar bookings automatically. Here is how they stack up for modern lead generation.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Landing page templates", myvsl: false, competitor: true },
          { name: "Quiz funnel templates", myvsl: true, competitor: false },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Drag-and-drop page builder", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: false },
          { name: "Lead scoring with points", myvsl: true, competitor: false },
          { name: "Tier-based routing", myvsl: true, competitor: false },
          { name: "Opt-in forms", myvsl: true, competitor: true },
          { name: "Pop-up forms", myvsl: true, competitor: true },
          { name: "Alert bars", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Checkout / payments", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: "Basic" },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "Built-in email delivery", myvsl: true, competitor: "Limited" },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: "Basic" },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Real-time conversion data", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: "Limited" },
          { name: "Free plan available", myvsl: true, competitor: false },
          { name: "WordPress integration", myvsl: false, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Standard", price: "$49/mo" },
          { name: "Pro", price: "$99/mo" },
          { name: "Advanced", price: "$697/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Leadpages Works",
        body: "Leadpages is a veteran landing page builder designed to help small businesses create high-converting pages without coding. The platform offers a drag-and-drop editor, a large template library, and built-in tools for pop-ups, alert bars, and basic email delivery. Leadpages integrates with major email marketing platforms and CRMs, and pages can be published to custom domains or embedded on WordPress sites.\n\nThe platform focuses on simplicity and speed for creating traditional landing pages, opt-in forms, and sales pages. Leadpages also includes A/B testing and basic analytics, along with checkout functionality for selling digital products or services directly from a landing page.",
      },
      {
        heading: "Static Pages vs Interactive Quiz Funnels",
        body: "The fundamental difference between Leadpages and MyVSL is the approach to lead capture. Leadpages creates static landing pages where visitors fill out a form and submit their information. MyVSL creates interactive quiz experiences where visitors answer questions, receive a personalized score, and get routed to the most relevant next step based on their qualification level.\n\nThis interactive approach consistently outperforms static forms. Quiz funnels achieve completion rates of 40 to 60 percent compared to typical landing page conversion rates of 2 to 5 percent. The engagement of answering questions creates investment and curiosity that drives higher conversions. With MyVSL, the AI generates these quiz experiences from a simple business description, eliminating the need for copywriting or design expertise.\n\nMyVSL's lead scoring also means you understand which leads are most valuable before they reach your sales team. Rather than treating every form submission equally, tier-based routing sends your highest-scoring prospects to premium booking slots while lower-scoring leads receive nurture content. Leadpages has no equivalent to this qualification layer.",
      },
      {
        heading: "Who Should Choose Leadpages?",
        body: "Leadpages is the right tool if you need traditional landing pages for digital product sales, webinar registrations, or simple opt-in capture. If your workflow revolves around static pages with forms and you need WordPress integration, Leadpages has a mature ecosystem for that use case.\n\nTeams that sell digital products directly from landing pages will also benefit from Leadpages' built-in checkout functionality, which MyVSL does not offer. If you need alert bars, full-page sales letters, or other traditional direct-response marketing page types, Leadpages covers those formats comprehensively.",
      },
      {
        heading: "Why MyVSL Is the Better Alternative for Lead Qualification",
        body: "For service businesses, coaches, consultants, and agencies focused on booking calls with qualified prospects, MyVSL provides a more effective pipeline than Leadpages. The AI-powered quiz generation eliminates design work, lead scoring qualifies prospects automatically, and calendar routing books the right leads with the right team members.\n\nPricing also favors MyVSL for most use cases. MyVSL includes a free plan with real functionality, while Leadpages starts at $49 per month with no free tier. MyVSL's Pro plan at $49 per month includes unlimited funnels and all lead scoring features, while Leadpages' Pro plan at $99 per month still does not include quiz functionality, lead scoring, or calendar routing. For agency teams, MyVSL's $149 per month Agency plan with white-label features is a fraction of Leadpages' $697 per month Advanced plan.",
      },
    ],
    ctaHeading: "Upgrade from Landing Pages to Smart Quiz Funnels",
    ctaDescription:
      "Static forms are leaving leads on the table. Build an AI-powered quiz funnel that scores, routes, and books calls automatically.",
  },

  {
    slug: "clickfunnels",
    name: "ClickFunnels",
    tagline: "MyVSL vs ClickFunnels: The Lightweight Alternative for Quiz Funnels",
    metaTitle: "MyVSL vs ClickFunnels | Best ClickFunnels Alternative 2026",
    metaDescription:
      "ClickFunnels is powerful but complex and expensive. MyVSL builds AI-powered quiz funnels in 60 seconds with lead scoring. Compare features and pricing.",
    heroDescription:
      "ClickFunnels is the most recognized name in sales funnels. But its complexity, learning curve, and price point are overkill for many teams. MyVSL offers a focused alternative: AI-generated quiz funnels with built-in lead scoring and calendar routing, at a fraction of the cost. Here is the full comparison.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Pre-built funnel templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Full page builder (sales pages, etc.)", myvsl: false, competitor: true },
          { name: "Membership site builder", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: "Limited" },
          { name: "Lead scoring with points", myvsl: true, competitor: false },
          { name: "Tier-based routing", myvsl: true, competitor: false },
          { name: "Opt-in forms", myvsl: true, competitor: true },
          { name: "Survey funnels", myvsl: true, competitor: true },
          { name: "Order forms", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: "Via integration" },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: "Limited" },
          { name: "One-click upsells", myvsl: false, competitor: true },
          { name: "Shopping cart", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: true },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "Affiliate management", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: true },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Revenue tracking", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: true },
          { name: "API access", myvsl: true, competitor: true },
          { name: "Free plan available", myvsl: true, competitor: false },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Startup", price: "$97/mo" },
          { name: "Pro", price: "$297/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How ClickFunnels Works",
        body: "ClickFunnels is a comprehensive sales funnel platform built by Russell Brunson and his team. It covers the full spectrum of online selling: sales pages, opt-in funnels, webinar funnels, membership sites, shopping carts, order forms, one-click upsells, and affiliate management. The platform includes a page builder, email automation (Follow-Up Funnels), and a CRM.\n\nClickFunnels has a massive ecosystem including training programs, books, and a large community. For businesses selling products or running complex multi-step sales processes, ClickFunnels provides an all-in-one solution. The trade-off is complexity: the learning curve is steep, the page builder can feel dated compared to modern tools, and the pricing reflects the platform's breadth.",
      },
      {
        heading: "The Complexity Problem",
        body: "For teams that specifically need quiz funnels with lead qualification and calendar booking, ClickFunnels is significantly more tool than necessary. You are paying for membership sites, shopping carts, affiliate systems, and other features you may never use. Setting up a quiz funnel in ClickFunnels requires building individual pages, configuring logic manually, and connecting external tools for lead scoring.\n\nMyVSL eliminates this complexity entirely. Describe your business, and the AI generates a complete quiz funnel with scoring logic, tier-based calendar routing, and email follow-up sequences. The entire process takes under 60 seconds. In ClickFunnels, building an equivalent funnel with proper scoring and routing could take days of configuration.\n\nMyVSL also provides purpose-built analytics for quiz funnels: waterfall conversion tracking shows exactly where leads drop off, device breakdown reveals mobile versus desktop behavior, and lead timelines show the complete journey from first touch to calendar booking. ClickFunnels' analytics are designed for e-commerce metrics like revenue and cart abandonment, which are less relevant for service businesses booking calls.",
      },
      {
        heading: "Who Should Choose ClickFunnels?",
        body: "ClickFunnels remains the right choice for businesses selling products online, running webinar funnels, managing membership sites, or needing one-click upsell capabilities. If you need a shopping cart, order bumps, and affiliate management, ClickFunnels covers all of that in one platform.\n\nTeams already deeply embedded in the ClickFunnels ecosystem with existing funnels, training, and workflows may also prefer to stay. The community and educational resources around ClickFunnels are extensive and can be valuable for teams learning direct-response marketing.",
      },
      {
        heading: "Why MyVSL Is the Better ClickFunnels Alternative for Service Businesses",
        body: "If your primary goal is booking qualified sales calls through quiz funnels, MyVSL does that specific job dramatically better and cheaper than ClickFunnels. The AI generation removes the technical barrier, lead scoring automates qualification, and tier-based routing ensures the right leads reach the right calendars.\n\nThe pricing difference is substantial. ClickFunnels starts at $97 per month with no free plan, while MyVSL starts free and offers its full Pro feature set at $49 per month. That is a savings of at least $576 per year, and you get purpose-built quiz funnel features that ClickFunnels does not offer natively. For agencies, MyVSL's $149 per month Agency plan with white-label features costs half of ClickFunnels' Pro plan at $297 per month.",
      },
    ],
    ctaHeading: "Get the Funnel Power Without the Complexity",
    ctaDescription:
      "ClickFunnels is great for selling products. For booking qualified calls, MyVSL is faster, simpler, and more affordable.",
  },

  {
    slug: "unbounce",
    name: "Unbounce",
    tagline: "MyVSL vs Unbounce: AI Landing Pages vs AI Quiz Funnels",
    metaTitle: "MyVSL vs Unbounce | Best Unbounce Alternative for Lead Gen 2026",
    metaDescription:
      "Unbounce builds AI-optimized landing pages. MyVSL builds AI-generated quiz funnels with lead scoring and calendar routing. See how they compare.",
    heroDescription:
      "Unbounce pioneered the dedicated landing page builder category and has recently added AI-powered features like Smart Traffic and Smart Copy. MyVSL uses AI differently: generating entire quiz funnels from business descriptions with built-in lead scoring. Here is how these two AI-powered approaches compare.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "AI copywriting assistance", myvsl: true, competitor: true },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Pre-built templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Smart Traffic (AI optimization)", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: false },
          { name: "Lead scoring with points", myvsl: true, competitor: false },
          { name: "Tier-based routing", myvsl: true, competitor: false },
          { name: "Form builder", myvsl: true, competitor: true },
          { name: "Dynamic text replacement", myvsl: false, competitor: true },
          { name: "Multi-step forms", myvsl: true, competitor: "Limited" },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Sticky bars", myvsl: false, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: "Basic" },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Smart Traffic AI optimization", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: true },
          { name: "API access", myvsl: true, competitor: true },
          { name: "Free plan available", myvsl: true, competitor: false },
          { name: "WordPress plugin", myvsl: false, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Build", price: "$99/mo" },
          { name: "Experiment", price: "$149/mo" },
          { name: "Optimize", price: "$249/mo" },
          { name: "Concierge", price: "$649/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Unbounce Works",
        body: "Unbounce is a landing page platform that has been at the forefront of conversion rate optimization since 2009. The platform offers a powerful drag-and-drop builder, an extensive template library, and features specifically designed for PPC marketers including dynamic text replacement for ad personalization. Unbounce has invested heavily in AI with Smart Traffic, which automatically routes visitors to the page variant most likely to convert them, and Smart Copy for AI-generated copywriting.\n\nUnbounce's strength is in creating high-converting landing pages for paid advertising campaigns. The combination of A/B testing, Smart Traffic optimization, and detailed conversion analytics makes it a popular choice for marketing teams running Google Ads, Facebook Ads, and other paid channels.",
      },
      {
        heading: "Two Different AI Approaches",
        body: "Both MyVSL and Unbounce leverage AI, but in fundamentally different ways. Unbounce uses AI to optimize existing landing pages by routing traffic and generating copy variants. You still need to design the page, write the initial copy, and set up the conversion flow manually. Smart Traffic then optimizes which variant each visitor sees.\n\nMyVSL uses AI to generate the entire funnel from scratch. Describe your coaching business, agency, or service, and the AI creates a complete quiz funnel including questions, answer options, scoring weights, tier definitions, calendar routing rules, and email follow-up sequences. The AI does not just optimize -- it builds.\n\nThis means a team with zero design or marketing experience can have a complete, conversion-optimized quiz funnel live in under a minute. With Unbounce, you need existing marketing expertise to create the initial page that Smart Traffic can then optimize. MyVSL lowers the barrier to entry dramatically while still producing effective lead generation funnels.",
      },
      {
        heading: "Who Should Choose Unbounce?",
        body: "Unbounce is the stronger choice for PPC-focused marketing teams running high-volume paid advertising campaigns across landing pages. If you need dynamic text replacement to match ad copy, Smart Traffic optimization across dozens of page variants, and sticky bars for sitewide promotions, Unbounce has mature solutions for these needs.\n\nTeams with dedicated designers and marketers who want pixel-level control over landing page layouts will also prefer Unbounce's builder. The platform gives you more design flexibility for traditional landing pages than MyVSL's quiz-focused approach. If your marketing strategy revolves around static landing pages rather than interactive quiz experiences, Unbounce is purpose-built for that workflow.",
      },
      {
        heading: "Why MyVSL Is the Better Alternative for Quiz-Based Lead Generation",
        body: "For service businesses that generate leads through qualification and booking, MyVSL provides a more complete and affordable solution. Quiz funnels with lead scoring consistently outperform static landing pages for service businesses because they engage prospects, build investment, and automatically identify the most qualified leads.\n\nUnbounce's pricing starts at $99 per month with no free tier, and the AI optimization features require the $249 per month Optimize plan. MyVSL starts free and includes AI generation, lead scoring, and calendar routing at $49 per month. The annual cost difference is significant: $2,988 for Unbounce Optimize versus $588 for MyVSL Pro. For agencies needing white-label capabilities, MyVSL's $149 per month plan includes features that Unbounce does not offer at any price point.",
      },
    ],
    ctaHeading: "Let AI Build Your Funnel, Not Just Optimize It",
    ctaDescription:
      "Unbounce optimizes pages you build. MyVSL builds the entire funnel for you. Describe your business, get a quiz funnel in 60 seconds.",
  },

  {
    slug: "interact",
    name: "Interact Quiz",
    tagline: "MyVSL vs Interact: Quiz Builders with a Key Difference",
    metaTitle: "MyVSL vs Interact Quiz | Best Interact Alternative 2026",
    metaDescription:
      "Both MyVSL and Interact build quizzes. But MyVSL adds AI generation, lead scoring, and calendar routing that Interact lacks. See the full comparison.",
    heroDescription:
      "Interact is one of the original quiz builder platforms, popular with coaches and content creators for personality quizzes and lead magnets. MyVSL builds on the quiz concept with AI generation, point-based lead scoring, and tier-based calendar routing that turns quizzes into a full sales pipeline. Here is how they compare.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: "AI quiz generation" },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Quiz templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Personality quiz type", myvsl: "Via scoring tiers", competitor: true },
          { name: "Scored quiz type", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: "Basic" },
          { name: "Tier-based calendar routing", myvsl: true, competitor: false },
          { name: "Branching logic", myvsl: true, competitor: true },
          { name: "Lead segmentation", myvsl: true, competitor: true },
          { name: "Email gate before results", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: false },
          { name: "Popup campaigns", myvsl: true, competitor: "Embed popups only" },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Custom results pages", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: "Facebook only" },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "Mailchimp/ActiveCampaign integration", myvsl: "Via webhooks", competitor: true },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: "Basic" },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Quiz completion rate", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: "Paid plans only" },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: false },
          { name: "API access", myvsl: true, competitor: false },
          { name: "Free plan available", myvsl: true, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Lite", price: "$39/mo" },
          { name: "Growth", price: "$99/mo" },
          { name: "Pro", price: "$209/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Interact Works",
        body: "Interact has been in the quiz builder space since 2014, making it one of the most established platforms for creating online quizzes. The platform focuses on two primary quiz types: personality quizzes that sort respondents into categories, and scored quizzes that assign numerical results. Interact provides a template library organized by industry, a visual builder for customizing quiz design, and integrations with major email marketing platforms like Mailchimp, ActiveCampaign, and ConvertKit.\n\nInteract's primary use case is lead generation through shareable quizzes. The typical workflow involves creating an engaging quiz, gating the results behind an email capture form, and segmenting leads into email lists based on their quiz outcome. The platform recently added AI-assisted quiz generation to help users create quiz content faster.",
      },
      {
        heading: "Beyond Quiz Building to Full-Funnel Conversion",
        body: "Interact stops at quiz creation and email segmentation. Once a lead completes your quiz and enters your email list, Interact's job is done. Everything after that point -- nurturing sequences, calendar booking, sales follow-up -- requires separate tools and manual connections.\n\nMyVSL continues where Interact ends. After the AI generates your quiz, it also creates point-based scoring logic that assigns values to each answer, defines tier thresholds for lead quality, routes high-value leads directly to premium calendar booking slots, and enrolls all leads in automated email sequences tailored to their score tier. The quiz is not a standalone lead magnet -- it is the first step in an automated sales pipeline.\n\nMyVSL also includes A/B testing that Interact lacks entirely. You can test different quiz variants, scoring thresholds, and routing rules to continuously optimize conversion rates. With Interact, you would need to manually create and compare quiz versions without built-in statistical analysis.",
      },
      {
        heading: "Who Should Choose Interact?",
        body: "Interact is a good choice if you specifically want personality-style quizzes for content marketing and audience segmentation. If your goal is creating BuzzFeed-style shareable quizzes that drive social media traffic and segment subscribers into email funnels, Interact has deep expertise in that format.\n\nTeams heavily invested in email marketing platforms like Mailchimp or ConvertKit may also prefer Interact's native integrations over MyVSL's webhook-based approach. If quiz results feed directly into complex email automation workflows in a dedicated email platform, Interact's direct integrations can simplify the connection.",
      },
      {
        heading: "Why MyVSL Is the Better Interact Alternative for Revenue Generation",
        body: "If your quizzes are designed to book sales calls and generate revenue rather than grow an email list, MyVSL provides the complete pipeline that Interact cannot match. Lead scoring, calendar routing, and email sequences transform a quiz from a content marketing tactic into a revenue-generating machine.\n\nMyVSL's free plan includes 100 submissions per month, comparable to Interact's free tier. But MyVSL's Pro plan at $49 per month includes everything -- unlimited funnels, lead scoring, A/B testing, email sequences, and analytics -- while Interact's Growth plan at $99 per month still does not include calendar booking, email sequences, or A/B testing. For agencies managing multiple client quizzes, MyVSL's $149 per month Agency plan with white-label features and team workspaces costs less than Interact's $209 per month Pro plan without those capabilities.",
      },
    ],
    ctaHeading: "Turn Your Quiz Into a Sales Pipeline",
    ctaDescription:
      "Interact builds quizzes. MyVSL builds quiz funnels that score leads, book calls, and close deals. Start free.",
  },

  {
    slug: "outgrow",
    name: "Outgrow",
    tagline: "MyVSL vs Outgrow: Interactive Content vs AI Quiz Funnels",
    metaTitle: "MyVSL vs Outgrow | Best Outgrow Alternative for Quiz Funnels 2026",
    metaDescription:
      "Outgrow builds calculators and quizzes. MyVSL builds AI-powered quiz funnels with lead scoring and calendar routing. Compare features and pricing here.",
    heroDescription:
      "Outgrow specializes in interactive content including calculators, quizzes, assessments, and polls. MyVSL focuses specifically on quiz-to-calendar funnels powered by AI. If you are choosing between these platforms for lead generation, here is what matters.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Quiz templates", myvsl: true, competitor: true },
          { name: "Calculator builder", myvsl: false, competitor: true },
          { name: "Assessment builder", myvsl: "Via quiz scoring", competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: "Via calculators" },
          { name: "Tier-based calendar routing", myvsl: true, competitor: false },
          { name: "Conditional logic", myvsl: true, competitor: true },
          { name: "Lead segmentation", myvsl: true, competitor: true },
          { name: "Polls and surveys", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Chatbot builder", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: true },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: true },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Content performance analytics", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: "Paid plans" },
          { name: "White-label for agencies", myvsl: true, competitor: "Enterprise only" },
          { name: "Team workspaces", myvsl: true, competitor: "Business plan" },
          { name: "API access", myvsl: true, competitor: "Business plan" },
          { name: "Free plan available", myvsl: true, competitor: "7-day trial" },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Freelancer", price: "$22/mo" },
          { name: "Essentials", price: "$95/mo" },
          { name: "Business", price: "$600/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Outgrow Works",
        body: "Outgrow is an interactive content platform that goes beyond quizzes to include calculators, assessments, polls, chatbots, and recommendation engines. The platform positions itself as a way to create engaging, interactive marketing experiences that capture leads and provide personalized results. Outgrow's builder supports complex calculation logic, making it popular for ROI calculators, pricing estimators, and diagnostic assessments.\n\nOutgrow offers a large template library and integrates with CRMs and email platforms through native connections and Zapier. The platform focuses on creating standalone interactive content pieces that can be embedded on websites, shared on social media, or used in advertising campaigns.",
      },
      {
        heading: "Breadth vs Depth in Quiz Funnels",
        body: "Outgrow covers a wide range of interactive content types but does not go deep on the quiz-to-booking pipeline. You can build a quiz in Outgrow, capture a lead, and send that data to your CRM. But the scoring is designed for content personalization rather than sales qualification, and there is no native path from quiz completion to calendar booking.\n\nMyVSL goes deep on the specific workflow that matters for service businesses: quiz, score, route, book, follow up. The AI generates the entire pipeline from a business description. Lead scoring is designed specifically for sales qualification with configurable point values and tier thresholds. Calendar routing sends the right leads to the right booking pages automatically. Email sequences nurture leads based on their qualification tier.\n\nOutgrow's calculator and assessment builders are more powerful for creating complex interactive tools with mathematical formulas. But if your goal is booking qualified sales calls through quizzes, that breadth adds complexity without addressing the core need. MyVSL's focused approach means every feature is designed to increase your booked-call conversion rate.",
      },
      {
        heading: "Who Should Choose Outgrow?",
        body: "Outgrow is the right choice if you need a variety of interactive content types beyond quizzes. ROI calculators, pricing tools, diagnostic assessments with complex formulas, and chatbot builders are all areas where Outgrow has capabilities that MyVSL does not offer. Content marketing teams that create multiple types of interactive assets will benefit from Outgrow's breadth.\n\nIf your use case requires mathematical calculations, financial modeling, or complex conditional formulas in the interactive experience, Outgrow's calculator builder is significantly more powerful than what any quiz-focused platform provides.",
      },
      {
        heading: "Why MyVSL Is the Better Outgrow Alternative for Booking Calls",
        body: "For coaches, consultants, and agencies focused on booking qualified calls, MyVSL delivers a more complete solution at a lower price. Outgrow's Freelancer plan at $22 per month offers limited content types and low traffic limits. To access the features you would need for proper lead generation, Outgrow's Essentials plan at $95 per month is more realistic, and the Business plan at $600 per month is required for white-label and team features.\n\nMyVSL's Pro plan at $49 per month includes unlimited funnels, lead scoring, A/B testing, email sequences, and full analytics. The Agency plan at $149 per month includes white-label branding and team workspaces. The annual savings compared to Outgrow Business is over $5,400. More importantly, MyVSL provides the complete quiz-to-booking pipeline that Outgrow requires multiple integrations to replicate.",
      },
    ],
    ctaHeading: "Focus on What Converts: Quiz Funnels That Book Calls",
    ctaDescription:
      "Outgrow builds many types of interactive content. MyVSL builds the one that books revenue. Start free.",
  },

  {
    slug: "involve-me",
    name: "involve.me",
    tagline: "MyVSL vs involve.me: Form Builder vs AI Funnel Builder",
    metaTitle: "MyVSL vs involve.me | Best involve.me Alternative 2026",
    metaDescription:
      "involve.me builds forms, quizzes, and calculators. MyVSL builds AI-powered quiz funnels with lead scoring and calendar routing. Compare them side by side.",
    heroDescription:
      "involve.me is an interactive content builder that combines forms, quizzes, calculators, and payment collection in one platform. MyVSL takes a different approach by using AI to generate complete quiz-to-calendar funnels with built-in lead scoring. Here is a detailed comparison to help you choose.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: "AI form generation" },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Quiz templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Calculator builder", myvsl: false, competitor: true },
          { name: "Payment collection forms", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: "Basic scoring" },
          { name: "Tier-based calendar routing", myvsl: true, competitor: false },
          { name: "Conditional logic", myvsl: true, competitor: true },
          { name: "Lead segmentation", myvsl: true, competitor: true },
          { name: "Multi-step forms", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: false },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Stripe payments", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: "Basic autoresponder" },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: "Basic" },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Submission analytics", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: "Paid plans" },
          { name: "White-label for agencies", myvsl: true, competitor: "Business plan" },
          { name: "Team workspaces", myvsl: true, competitor: "Paid plans" },
          { name: "API access", myvsl: true, competitor: true },
          { name: "Free plan available", myvsl: true, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Free", price: "$0/mo (100 submissions)" },
          { name: "Starter", price: "$29/mo" },
          { name: "Professional", price: "$59/mo" },
          { name: "Business", price: "$149/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How involve.me Works",
        body: "involve.me is a versatile interactive content platform based in Vienna, Austria. The platform offers a visual builder for creating forms, quizzes, calculators, surveys, and payment pages. It supports conditional logic, custom outcomes, and integrations with popular marketing tools. involve.me positions itself as an all-in-one interactive content builder that can handle everything from simple contact forms to complex pricing calculators with Stripe payment processing.\n\nThe platform recently added AI-assisted form generation, allowing users to describe what they need and get a starting template. involve.me also supports embedding content as popups, inline elements, or full-page experiences, giving flexibility in how you deploy interactive content on your website.",
      },
      {
        heading: "General Purpose vs Purpose-Built for Lead Qualification",
        body: "involve.me and MyVSL both support quiz creation, but they are designed for different outcomes. involve.me is a general-purpose interactive content builder that covers forms, surveys, calculators, and quizzes. MyVSL is purpose-built for the quiz-to-booking pipeline that service businesses use to generate qualified sales calls.\n\nWith involve.me, you can build a quiz, capture leads, and display results. But there is no native lead scoring system designed for sales qualification, no tier-based routing to different calendar booking pages, no built-in email sequence automation, and no A/B testing for quiz variants. These capabilities are exactly what MyVSL was built to provide.\n\nMyVSL's AI generation is also more comprehensive than involve.me's AI form builder. MyVSL generates not just the quiz questions but the entire funnel: scoring logic, tier definitions, calendar routing rules, and email follow-up sequences. The AI understands your business context and creates conversion-optimized content tailored to your industry and target audience.",
      },
      {
        heading: "Who Should Choose involve.me?",
        body: "involve.me is a solid choice for teams that need a variety of interactive content beyond quizzes. If you need payment collection forms, pricing calculators, customer satisfaction surveys, or interactive product recommendation tools, involve.me covers those use cases in a single platform.\n\nThe platform's free tier is comparable to MyVSL's at 100 submissions per month, making it worth trying if you are not sure what type of interactive content will work best for your business. Teams that need Stripe payment integration directly within their interactive content will also find involve.me more suitable, as MyVSL does not include payment processing.",
      },
      {
        heading: "Why MyVSL Is the Better involve.me Alternative for Service Businesses",
        body: "For any service business whose primary goal is booking qualified sales calls, MyVSL's focused feature set is more effective. The AI generates a complete funnel in 60 seconds versus manually building one in involve.me. Built-in lead scoring qualifies every lead automatically. Tier-based routing ensures high-value prospects see your premium booking calendar. Email sequences nurture leads who are not ready to book immediately.\n\nAt comparable pricing tiers, MyVSL includes significantly more lead generation features. involve.me's Professional plan at $59 per month lacks A/B testing, email sequences, and calendar routing. MyVSL's Pro plan at $49 per month includes all of these plus unlimited funnels. For agencies, both platforms offer business-tier plans at $149 per month, but MyVSL includes white-label branding, team workspaces, and client management that are specifically designed for agency workflows.",
      },
    ],
    ctaHeading: "Skip the Form Builder. Build a Complete Funnel.",
    ctaDescription:
      "involve.me builds forms. MyVSL builds the entire lead qualification pipeline. Describe your business and launch in 60 seconds.",
  },

  {
    slug: "bucket-io",
    name: "Bucket.io",
    tagline: "MyVSL vs Bucket.io: Two Quiz Funnel Builders Compared",
    metaTitle: "MyVSL vs Bucket.io | Best Bucket.io Alternative 2026",
    metaDescription:
      "Bucket.io and MyVSL both build quiz funnels. But MyVSL adds AI generation, built-in email sequences, and a free plan. See the full comparison.",
    heroDescription:
      "Bucket.io is a quiz funnel builder designed specifically for segmenting and qualifying leads through interactive quizzes. MyVSL shares that focus but adds AI-powered generation, built-in email sequences, and a free tier. Here is how these two quiz funnel specialists compare.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Quiz funnel templates", myvsl: true, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Multi-outcome funnels", myvsl: true, competitor: true },
          { name: "Generate funnel from website URL", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: true },
          { name: "Tier-based calendar routing", myvsl: true, competitor: false },
          { name: "Branching logic", myvsl: true, competitor: true },
          { name: "Lead segmentation by outcome", myvsl: true, competitor: true },
          { name: "Email gate before results", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: "Via redirect" },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: false },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Exit-intent triggers", myvsl: true, competitor: false },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "Zapier integration", myvsl: "Via webhooks", competitor: true },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: true },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Quiz completion tracking", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: "Enterprise" },
          { name: "Team workspaces", myvsl: true, competitor: false },
          { name: "API access", myvsl: true, competitor: false },
          { name: "Free plan available", myvsl: true, competitor: false },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Starter", price: "$59/mo" },
          { name: "Pro", price: "$129/mo" },
          { name: "Premium", price: "$197/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How Bucket.io Works",
        body: "Bucket.io was built specifically for quiz funnels, making it one of the most focused competitors in this space. The platform lets you create multi-step quizzes that segment respondents into different \"buckets\" based on their answers. Each bucket can lead to a different outcome page, making it effective for personalized recommendations, product matching, and lead segmentation.\n\nBucket.io offers a visual quiz builder with branching logic, scoring capabilities, and the ability to create different pathways through the quiz based on responses. The platform integrates with email marketing tools and CRMs through Zapier and native connections. Templates are available for common quiz funnel use cases including coaching qualification, product recommendations, and assessment-style quizzes.",
      },
      {
        heading: "Similar Focus, Different Execution",
        body: "MyVSL and Bucket.io share the same core mission: building quiz funnels that qualify and segment leads. The execution differs in several important ways. First, MyVSL uses AI to generate the entire funnel from a business description. With Bucket.io, you start from a template or blank canvas and build manually. This means the time from idea to live funnel is measured in seconds with MyVSL versus hours with Bucket.io.\n\nSecond, MyVSL includes built-in email sequences that Bucket.io lacks. After a lead completes your quiz and books a call (or does not), they automatically enter a follow-up sequence tailored to their score tier. With Bucket.io, you need a separate email platform and an integration to handle post-quiz follow-up.\n\nThird, MyVSL's calendar routing is native and tier-based. High-scoring leads see your premium booking calendar, mid-tier leads see a different calendar, and low-scoring leads can receive content instead of a booking option. Bucket.io can redirect to external booking pages but does not offer the same granular routing based on qualification scores.",
      },
      {
        heading: "Who Should Choose Bucket.io?",
        body: "Bucket.io is a reasonable choice for teams that want maximum control over quiz funnel design and branching logic and do not mind a longer setup time. If you need complex multi-path quiz journeys with highly customized outcome pages for each branch, Bucket.io's manual builder gives you granular control over every pathway.\n\nTeams that already use Bucket.io with established funnels and proven conversion data may prefer to optimize their existing setup rather than rebuild on a new platform. Bucket.io's A/B testing capabilities also allow you to iterate on existing quiz funnels effectively.",
      },
      {
        heading: "Why MyVSL Is the Better Bucket.io Alternative",
        body: "MyVSL offers more features at a lower price point for quiz funnel builders. The AI generation removes the biggest bottleneck in quiz funnel creation: the time and expertise needed to write questions, assign scores, and configure logic. Built-in email sequences eliminate the need for a separate email tool. Popup campaigns and exit-intent triggers provide additional lead capture that Bucket.io does not offer.\n\nMyVSL also starts free, while Bucket.io's cheapest plan is $59 per month. MyVSL's Pro plan at $49 per month includes more features than Bucket.io's Pro plan at $129 per month. For agencies, MyVSL's $149 per month Agency plan with white-label branding and team workspaces undercuts Bucket.io's Premium plan at $197 per month while offering more agency-specific features. The analytics dashboard is also more comprehensive, with waterfall tracking and device breakdown that Bucket.io does not provide.",
      },
    ],
    ctaHeading: "Build Better Quiz Funnels in Less Time",
    ctaDescription:
      "Bucket.io requires hours of manual setup. MyVSL generates your quiz funnel in 60 seconds with AI. Free to start.",
  },

  {
    slug: "convertflow",
    name: "ConvertFlow",
    tagline: "MyVSL vs ConvertFlow: Conversion Tools vs AI Quiz Funnels",
    metaTitle: "MyVSL vs ConvertFlow | Best ConvertFlow Alternative 2026",
    metaDescription:
      "ConvertFlow offers CTAs, popups, and forms. MyVSL offers AI-generated quiz funnels with lead scoring and calendar routing. See how they compare.",
    heroDescription:
      "ConvertFlow is an all-in-one conversion platform offering CTAs, popups, landing pages, forms, and surveys for personalized website experiences. MyVSL focuses specifically on AI-generated quiz funnels with lead scoring and calendar routing. Here is how to choose between them.",
    features: [
      {
        category: "Funnel Building",
        items: [
          { name: "AI-powered funnel generation", myvsl: true, competitor: false },
          { name: "No-code visual builder", myvsl: true, competitor: true },
          { name: "Quiz funnel templates", myvsl: true, competitor: "Limited" },
          { name: "Landing page builder", myvsl: false, competitor: true },
          { name: "Mobile-responsive output", myvsl: true, competitor: true },
          { name: "Site-wide personalization", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Lead Capture",
        items: [
          { name: "Quiz builder", myvsl: true, competitor: true },
          { name: "Lead scoring with points", myvsl: true, competitor: "Via integrations" },
          { name: "Tier-based calendar routing", myvsl: true, competitor: false },
          { name: "Conditional logic", myvsl: true, competitor: true },
          { name: "Progressive profiling", myvsl: false, competitor: true },
          { name: "CTA builder", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Conversion",
        items: [
          { name: "Calendar booking integration", myvsl: true, competitor: false },
          { name: "A/B testing", myvsl: true, competitor: true },
          { name: "Popup campaigns", myvsl: true, competitor: true },
          { name: "Embed widgets", myvsl: true, competitor: true },
          { name: "Sticky bars", myvsl: false, competitor: true },
          { name: "Exit-intent triggers", myvsl: true, competitor: true },
        ],
      },
      {
        category: "Marketing",
        items: [
          { name: "Email sequences", myvsl: true, competitor: false },
          { name: "Webhook integrations", myvsl: true, competitor: true },
          { name: "Facebook/TikTok pixel tracking", myvsl: true, competitor: true },
          { name: "UTM parameter tracking", myvsl: true, competitor: true },
          { name: "GoHighLevel integration", myvsl: true, competitor: false },
          { name: "HubSpot deep integration", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Analytics",
        items: [
          { name: "Funnel analytics dashboard", myvsl: true, competitor: true },
          { name: "Waterfall conversion tracking", myvsl: true, competitor: false },
          { name: "Device breakdown", myvsl: true, competitor: false },
          { name: "Lead timeline", myvsl: true, competitor: false },
          { name: "Revenue attribution", myvsl: false, competitor: true },
        ],
      },
      {
        category: "Platform",
        items: [
          { name: "Custom domains", myvsl: true, competitor: true },
          { name: "White-label for agencies", myvsl: true, competitor: false },
          { name: "Team workspaces", myvsl: true, competitor: true },
          { name: "API access", myvsl: true, competitor: true },
          { name: "Free plan available", myvsl: true, competitor: true },
        ],
      },
    ],
    pricing: {
      myvsl: { free: "$0/mo (1 funnel, 100 submissions)", pro: "$49/mo", agency: "$149/mo" },
      competitor: {
        plans: [
          { name: "Free", price: "$0/mo (limited)" },
          { name: "Pro", price: "$99/mo" },
          { name: "Teams", price: "$300/mo" },
        ],
      },
    },
    sections: [
      {
        heading: "How ConvertFlow Works",
        body: "ConvertFlow positions itself as a conversion marketing platform that replaces multiple point solutions with a unified system. The platform offers CTAs (calls to action), popups, landing pages, forms, surveys, and quizzes, all managed from a single dashboard. A key differentiator is ConvertFlow's visitor-level personalization, which uses data from your CRM, email platform, or previous interactions to show different content to different visitors.\n\nConvertFlow integrates deeply with platforms like HubSpot, ActiveCampaign, and Salesforce, pulling contact data to personalize on-site experiences. The platform supports progressive profiling, where you gradually collect information from returning visitors across multiple interactions rather than asking everything at once.",
      },
      {
        heading: "Personalization Platform vs Focused Funnel Builder",
        body: "ConvertFlow and MyVSL solve different problems with some overlap. ConvertFlow is a website personalization and conversion optimization platform. It helps you show the right popups, CTAs, and forms to the right visitors based on their profile and behavior. MyVSL is a quiz funnel builder that generates complete lead qualification pipelines with AI.\n\nConvertFlow's quiz functionality exists but is not its primary focus. The quiz builder is one of many content types you can create, and the platform does not include purpose-built lead scoring, calendar routing, or post-quiz email sequences. You would need to connect ConvertFlow to your CRM for scoring and to a separate calendar tool for booking.\n\nMyVSL handles the entire quiz-to-booking flow natively. The AI generates quiz questions optimized for your industry, assigns scoring weights, creates tier-based routing rules, and builds follow-up email sequences. Every feature is designed to move a lead from quiz taker to booked call as efficiently as possible.",
      },
      {
        heading: "Who Should Choose ConvertFlow?",
        body: "ConvertFlow is the better choice for teams that need site-wide conversion optimization beyond quiz funnels. If you want personalized CTAs across your blog, targeted popups for different audience segments, progressive profiling over multiple visits, and deep CRM integration for visitor-level personalization, ConvertFlow's breadth is valuable.\n\nTeams already using HubSpot or Salesforce as their primary CRM will benefit from ConvertFlow's native integrations, which allow real-time data sync for personalized experiences. If your conversion strategy involves multiple touchpoints across your website rather than a single quiz funnel, ConvertFlow's multi-tool approach may be more appropriate.",
      },
      {
        heading: "Why MyVSL Is the Better ConvertFlow Alternative for Quiz Funnels",
        body: "If quiz-based lead qualification and calendar booking is your primary conversion mechanism, MyVSL provides a more powerful and affordable solution. The AI-powered generation means you can launch a complete quiz funnel in 60 seconds instead of spending hours configuring ConvertFlow's quiz builder, CRM integrations, and follow-up automation.\n\nConvertFlow's Pro plan at $99 per month still does not include email sequences, calendar routing, or AI funnel generation. MyVSL's Pro plan at $49 per month includes all of these features. For teams managing multiple clients, MyVSL's Agency plan at $149 per month with white-label features costs half of ConvertFlow's Teams plan at $300 per month. MyVSL's focused approach delivers more value for quiz funnel use cases at every price point.",
      },
    ],
    ctaHeading: "Stop Patching Together Conversion Tools",
    ctaDescription:
      "ConvertFlow does many things well. MyVSL does one thing exceptionally: AI-powered quiz funnels that book qualified calls. Start free.",
  },
];

export function getCompetitorBySlug(slug: string): CompetitorData | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return competitors.map((c) => c.slug);
}
