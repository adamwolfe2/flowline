import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service | MyVSL",
  description: "Terms of Service for the MyVSL platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-instrument-sans)" }}>
      <nav className="border-b border-[#E5E7EB] py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MyVSL" width={20} height={20} />
            <span className="font-semibold text-[#111827] text-sm">MyVSL</span>
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-instrument-serif)" }}>Terms of Service</h1>
        <p className="text-sm text-[#9CA3AF] mb-8">Last updated: March 17, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-[#6B7280]">
          <section>
            <h2 className="text-lg font-semibold text-[#111827]">1. Acceptance of Terms</h2>
            <p>By accessing or using MyVSL (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">2. Description of Service</h2>
            <p>MyVSL is a platform that lets you create VSL (Video Sales Letter) quiz funnels, collect leads, and view analytics. The Service includes a funnel builder, hosting for your published funnels, lead collection, and a dashboard for managing your funnels and leads.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">3. Plans and Pricing</h2>
            <p>MyVSL offers a free plan with limited features and paid plans with additional capabilities. Paid plans are billed monthly through Stripe. Pricing is subject to change with 30 days notice to existing subscribers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate account information.</li>
              <li>Not use the Service to send spam, phishing, or unsolicited communications.</li>
              <li>Not publish funnels containing illegal, fraudulent, or misleading content.</li>
              <li>Not attempt to reverse-engineer, exploit, or disrupt the Service.</li>
              <li>Comply with all applicable laws, including data protection regulations, when collecting leads.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">5. Lead Data Ownership</h2>
            <p>You own the lead data collected through your funnels. MyVSL acts as a data processor on your behalf. You are responsible for how you use the leads you collect, including compliance with CAN-SPAM, GDPR, and other applicable regulations. We do not contact your leads or share them with third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">6. Limitation of Liability</h2>
            <p>MyVSL is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">7. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms or use the Service in a way that harms other users or the platform. You may cancel your account at any time from your dashboard. Upon termination, your funnels will be unpublished and your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">8. Refund Policy</h2>
            <p>Paid plans include a 7-day refund window from the date of purchase, no questions asked. To request a refund, contact us at support@getmyvsl.com within 7 days of your initial payment. Refunds are not available after the 7-day window or for renewal charges.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. If we make material changes, we will notify you via email or through the Service. Continued use after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827]">10. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:support@getmyvsl.com" className="text-[#2D6A4F] underline">support@getmyvsl.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
