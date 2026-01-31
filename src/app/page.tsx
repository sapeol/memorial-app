import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Flame,
  Users,
  Lock,
  Shield,
  Calendar,
  Sparkles,
} from "lucide-react";

async function AuthHeader() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground hidden sm:inline">{session.user.email}</span>
        <form action="/auth/sign-out" method="post">
          <Button variant="outline" size="sm" className="border-border" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        How It Works
      </Link>
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-lg tracking-tight">Memorial</span>
          </Link>
          <nav className="flex items-center gap-6">
            <AuthHeader />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 md:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-10">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Private • Secure • Permanent</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-foreground mb-8 tracking-tight leading-[1.1]">
              A serene space to <br className="hidden md:block" />
              <span className="text-primary">honor those you love</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Create a lasting digital tribute where family and friends come together to share memories,
              photos, and stories. Private, respectful, and designed to honor a life well lived.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/memorials/new">
                <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 min-w-[200px] h-14 text-lg rounded-full">
                  Create a Memorial
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-border min-w-[200px] h-14 text-lg rounded-full">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Emotional Appeal Section */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-y border-border/50">
          <div className="text-center space-y-8">
            <p className="text-2xl md:text-3xl text-foreground font-medium italic leading-relaxed">
              "What we have once enjoyed deeply we can never lose. All that we love deeply becomes a part of us."
            </p>
            <p className="text-base text-muted-foreground tracking-widest uppercase">— Helen Keller</p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 bg-muted/20">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">Simple & Respectful</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Build a lasting tribute in minutes. Focus on what matters: the memories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <StepCard
              number="1"
              title="Create the Memorial"
              description="Add their name, dates, a photo, and write a brief biography celebrating their life."
              icon={<Sparkles className="w-6 h-6" />}
            />
            <StepCard
              number="2"
              title="Invite Family & Friends"
              description="Send private invitations to loved ones. Choose who can contribute and who can simply visit."
              icon={<Users className="w-6 h-6" />}
            />
            <StepCard
              number="3"
              title="Share Memories Together"
              description="Add photos to the timeline, write in the guestbook, and light virtual candles."
              icon={<Heart className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">Thoughtful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to create a meaningful, lasting legacy.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Life Story Timeline"
              description="Capture their journey—from early years to cherished memories. Add milestones, photos, and stories."
            />
            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-primary" />}
              title="Shared Photo Gallery"
              description="A beautiful space where everyone can contribute photos. Each image can include captions and stories."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-primary" />}
              title="Guestbook Messages"
              description="Friends and family leave messages, share memories, and express what your loved one meant to them."
            />
            <FeatureCard
              icon={<Flame className="w-6 h-6 text-primary" />}
              title="Digital Rituals"
              description="Light a virtual candle, leave flowers, or create personal remembrance rituals on special dates."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Private Circles"
              description="Control who sees and contributes. Invite family and close friends to a safe, private space."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Forever Secure"
              description="No ads, no tracking. Your memories are private, secure, and preserved for future generations."
            />
          </div>
        </section>

        {/* Privacy Section */}
        <section className="max-w-6xl mx-auto px-6 py-24 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">Privacy at the Core</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                We believe memories are sacred. Your data is never sold, and your privacy is always the priority.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-10">
              <PrivacyItem
                title="No Data Harvesting"
                description="Your memories belong to you. We never sell your data or use it for advertising."
              />
              <PrivacyItem
                title="Private by Default"
                description="Memorials are only accessible via private invites. No search engine indexing."
              />
              <PrivacyItem
                title="Secure Storage"
                description="All data is encrypted and stored using industry-standard security practices."
              />
              <PrivacyItem
                title="Complete Control"
                description="Export your data or delete your memorial at any time. You are always in control."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto p-12 bg-card border border-border rounded-3xl text-center shadow-sm">
            <Heart className="w-12 h-12 text-primary mx-auto mb-8" />
            <h2 className="text-3xl font-semibold text-foreground mb-6">
              Start creating a lasting tribute today
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Preserve their legacy in a private, secure, and beautiful space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/memorials/new">
                <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 min-w-[180px] h-14 rounded-full">
                  Create Memorial
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-border min-w-[180px] h-14 rounded-full">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground text-lg">Memorial</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Crafted with Care • Private & Secure • {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-6 text-primary">
        {icon}
      </div>
      <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mb-3">Step {number}</div>
      <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-colors h-full">
      <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function PrivacyItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-5">
      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Shield className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
