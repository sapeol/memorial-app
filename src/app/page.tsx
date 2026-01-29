import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function AuthHeader() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            Dashboard
          </Button>
        </Link>
        <span className="text-zinc-400 text-sm">{session.user.email}</span>
        <form action="/auth/sign-out" method="post">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/5" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
        Features
      </Link>
      <Link href="/sign-in">
        <Button variant="ghost" size="sm" className="text-white">
          Sign In
        </Button>
      </Link>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
              <span className="text-slate-900 text-sm">✦</span>
            </div>
            <span className="text-white font-medium">Memorial</span>
          </Link>
          <nav className="flex items-center">
            <AuthHeader />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-amber-200 text-xs font-medium">Private • Secure • Permanent</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-white mb-6 tracking-tight">
            Honor those who shaped your life
          </h1>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
            Create a beautiful digital memorial where friends and family can share memories,
            photos, and stories in a private, respectful space.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/memorials/new">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 min-w-[160px]">
                Create a Memorial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white mb-4">Everything you need to remember</h2>
            <p className="text-zinc-400">Thoughtful features for meaningful memorials</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="◷"
              title="Life Story Timeline"
              description="Capture the journey with photos and milestones—from childhood to cherished moments."
            />
            <FeatureCard
              icon="🖼️"
              title="Media Gallery"
              description="Share photos, videos, and voice recordings. Contributors can add their own memories."
            />
            <FeatureCard
              icon="📝"
              title="Guestbook"
              description="Friends and family leave messages, share stories, and express their condolences."
            />
            <FeatureCard
              icon="🕯️"
              title="Digital Rituals"
              description="Light a virtual candle, leave flowers, or create personal remembrance rituals."
            />
            <FeatureCard
              icon="🔒"
              title="Private Circles"
              description="Only invited contributors can access. No ads, no data harvesting, complete privacy."
            />
            <FeatureCard
              icon="✨"
              title="Beautiful Design"
              description="Thoughtful, respectful design that honors the memory of your loved one."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <Card className="max-w-2xl mx-auto p-12 bg-gradient-to-br from-white/5 to-transparent border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Start creating a lasting tribute
            </h2>
            <p className="text-zinc-400 mb-8">
              Free to create. No credit card required. Your memorials are yours forever.
            </p>
            <Link href="/memorials/new">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-zinc-100">
                Get Started Free
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-zinc-500">
          <p>Crafted with care • Private & Secure • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </Card>
  );
}
