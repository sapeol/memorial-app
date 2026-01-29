import Link from "next/link";
import { redirect } from "next/navigation";
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

export default async function Home({ searchParams }: {
  searchParams: Promise<{ code?: string; redirect?: string }>
}) {
  const params = await searchParams;

  // Handle OAuth callback if code is present (from Google sign-in)
  if (params.code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(params.code);
    const redirectTo = params.redirect || '/dashboard';
    redirect(redirectTo);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
              <Heart className="w-4 h-4 text-brand-foreground" />
            </div>
            <span className="font-semibold text-foreground">Memorial</span>
          </Link>
          <nav className="flex items-center gap-4">
            <AuthHeader />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 mb-8">
              <Shield className="w-3 h-3 text-brand-foreground" />
              <span className="text-xs font-medium text-brand-foreground">Private • Secure • Permanent</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
              A beautiful place to remember
              <span className="block text-brand-foreground">those you love</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Create a lasting digital tribute where family and friends come together to share memories,
              photos, stories, and messages of love. Private, respectful, and designed to honor a life well lived.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/memorials/new">
                <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand-hover min-w-[180px]">
                  Create a Memorial
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-border">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Emotional Appeal Section */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <p className="text-xl text-muted-foreground italic">
              "What we have once enjoyed deeply we can never lose. All that we love deeply becomes a part of us."
            </p>
            <p className="text-sm text-muted-foreground">— Helen Keller</p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 bg-muted/30">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Creating a memorial is simple. In just a few minutes, you can build a lasting tribute that brings comfort and connection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
              description="Add photos to the timeline, write in the guestbook, light virtual candles, and create rituals."
              icon={<Heart className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Thoughtful Features</h2>
            <p className="text-muted-foreground">Everything you need to create a meaningful memorial</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-brand-foreground" />}
              title="Life Story Timeline"
              description="Capture their journey—from early years to cherished memories. Add milestones, photos, and stories that define who they were."
            />
            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-brand-foreground" />}
              title="Shared Photo Gallery"
              description="A beautiful space where everyone can contribute photos. Each image can include captions and the story behind the moment."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-brand-foreground" />}
              title="Guestbook Messages"
              description="Friends and family leave messages, share memories, and express what your loved one meant to them."
            />
            <FeatureCard
              icon={<Flame className="w-6 h-6 text-brand-foreground" />}
              title="Digital Rituals"
              description="Light a virtual candle, leave flowers, send love, or create personal remembrance rituals on special dates."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-brand-foreground" />}
              title="Private Circles"
              description="Control who sees and contributes to the memorial. Invite family, close friends, and create a safe private space."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-brand-foreground" />}
              title="Forever Secure"
              description="No ads, no data selling, no algorithm. Your memories are private, secure, and accessible for generations."
            />
          </div>
        </section>

        {/* Privacy Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Lock className="w-8 h-8 text-brand-foreground" />
              <h2 className="text-3xl font-semibold text-foreground">Your Privacy Matters</h2>
            </div>
            <p className="text-center text-muted-foreground mb-12">
              We built Memorial with privacy at its core. Your memories are sacred, and we treat them that way.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <PrivacyItem
                title="No Data Harvesting"
                description="We never sell your data or use it for advertising. Your memories belong to you."
              />
              <PrivacyItem
                title="Private by Default"
                description="Memorials are only accessible to people you invite. No public indexing, no search engines."
              />
              <PrivacyItem
                title="Secure Storage"
                description="All data is encrypted and stored securely. We use industry-standard security practices."
              />
              <PrivacyItem
                title="You're in Control"
                description="Export your data anytime. Delete memorials when you choose. Complete control."
              />
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Perfect For</h2>
            <p className="text-muted-foreground">Creating meaningful tributes for every occasion</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <UseCaseCard
              emoji="🕯️"
              title="Passing of a Loved One"
              description="Create a central place for family and friends to share memories, photos, and condolences after a loss."
            />
            <UseCaseCard
              emoji="💐"
              title="Anniversaries & Memorials"
              description="Honor milestone anniversaries with a tribute that grows and evolves as more people contribute."
            />
            <UseCaseCard
              emoji="🌟"
              title="Celebrating a Life"
              description="Share the story of someone special—their achievements, their impact, the moments that mattered."
            />
            <UseCaseCard
              emoji="👨‍👩‍👧‍👦"
              title="Family Heritage"
              description="Build a living archive of family history, connecting generations through shared stories and photos."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <Card className="max-w-2xl mx-auto p-12 bg-gradient-to-br from-brand/10 to-muted/30 border-border text-center">
            <Heart className="w-12 h-12 text-brand-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Start creating a lasting tribute today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Free to create. No credit card required. Your memories will be preserved securely, forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/memorials/new">
                <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand-hover min-w-[160px]">
                  Create Memorial
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-border">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-foreground" />
              <span className="font-semibold text-foreground">Memorial</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Crafted with care • Private & Secure • {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
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
    <Card className="p-6 bg-card border-border hover:border-brand/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xs text-brand-foreground font-semibold mb-1">Step {number}</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Card>
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
    <Card className="p-6 bg-card/50 backdrop-blur border-border hover:bg-muted/30 transition-colors h-full">
      <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Card>
  );
}

function PrivacyItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
        <Shield className="w-3 h-3 text-brand-foreground" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 bg-card border-border hover:bg-muted/30 transition-colors">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Card>
  );
}
