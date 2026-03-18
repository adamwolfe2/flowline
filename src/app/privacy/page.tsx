import { Lora } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata = {
  title: "Privacy Policy | MyVSL",
  description: "How MyVSL handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className={`${lora.variable} min-h-screen bg-white`}>
      <nav className="border-b border-[#E5E7EB] py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
            <span className="font-semibold text-[#111827] text-sm">MyVSL</span>
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-lora)" }}>Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-8">Last updated: March 17, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-[#6B7280]">
          <section>
            <h2 className="text-lg font-semibold text-[#111827]">1. Information We Collect</h2>
            <p>When you use MyVSL, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> Email address and name when you sign up.</li>
              <li><strong>Funnel data:</strong> The quiz questions, branding, and configuration you create.</li>
              <li><strong>Lead data:</strong> Email addresses and quiz responses submitted by visitors to your funnels.</li>
              <li><strong>Usage data:</strong> Page views, funnel completions, device type, and referral source for analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the MyVSL platform.</li>
              <li>To display analytics and lead data in your dashboard.</li>
              <li>To send transactional emails (lead notifications, account updates).</li>
              <li>To process payments through Stripe.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">3. Data Sharing</h2>
            <p>We do not sell your data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Clerk</strong>: authentication provider.</li>
              <li><strong>Stripe</strong>: payment processing.</li>
              <li><strong>Neon</strong>: database hosting.</li>
              <li><strong>Vercel</strong>: application hosting and file storage.</li>
              <li><strong>Resend</strong>: transactional email delivery.</li>
              <li><strong>OpenAI</strong>: AI funnel generation (your business description is sent to generate quiz content).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">4. Lead Data (Funnel Visitors)</h2>
            <p>When someone completes a funnel you created, we store their email address and quiz responses. This data belongs to you (the funnel creator). You can export it via CSV or delete it from your dashboard. We do not contact your leads directly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">5. Cookies and Tracking</h2>
            <p>We use essential cookies for authentication. Funnel analytics track page views, quiz completions, and device type. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">6. Your Rights</h2>
            <p>You can request to delete your account and all associated data at any time by contacting us at support@getmyvsl.com. Funnel visitors can request data deletion through the funnel creator.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">7. Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:support@getmyvsl.com" className="text-[#2D6A4F] underline">support@getmyvsl.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
