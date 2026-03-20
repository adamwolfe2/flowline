import { AppNav } from "@/components/AppNav";

export const metadata = {
  title: "Settings | MyVSL",
  description: "Manage your MyVSL account and subscription.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
