'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { ImageUpload } from '@/components/image-upload'
import { useMemorialFormStore } from '@/lib/store/memorial-form'
import { ArrowLeft, ArrowRight, Check, Heart, User, Calendar, Image as ImageIcon, Palette, BookOpen } from 'lucide-react'

const THEME_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Navy', value: '#1e1b4b' },
  { name: 'Sage', value: '#14532d' },
  { name: 'Earth', value: '#451a03' },
  { name: 'Stone', value: '#292524' },
]

/**
 * Steps for the memorial creation wizard.
 * Removed Sparkle icons as per accessibility and brand requirements.
 */
const STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Dates', icon: Calendar },
  { id: 3, title: 'Tribute', icon: ImageIcon },
  { id: 4, title: 'Aesthetic', icon: Palette },
  { id: 5, title: 'Legacy', icon: BookOpen },
  { id: 6, title: 'Preserve', icon: Check },
]

export default function NewMemorialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const {
    step,
    name,
    birthDate,
    passingDate,
    bio,
    coverImage,
    themeColor,
    nextStep,
    prevStep,
    setData,
    reset
  } = useMemorialFormStore()

  useEffect(() => {
    if (user) setUserId(user.id)
  }, [user])

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      const { data: memorial, error: memorialError } = await supabase
        .from('memorials')
        .insert({
          name,
          birth_date: birthDate || null,
          passing_date: passingDate || null,
          bio,
          cover_image: coverImage || null,
          theme_color: themeColor,
          owner_id: user.id,
        })
        .select()
        .single()

      if (memorialError) throw memorialError

      await supabase.from('memorial_participants').insert({
        memorial_id: memorial.id,
        user_id: user.id,
        access_level: 'owner',
        invited_by: user.id,
        accepted_at: new Date().toISOString(),
      })

      reset()
      router.push(`/memorials/${memorial.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create memorial')
      setLoading(false)
    }
  }

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 30 : -30,
      opacity: 0
    })
  }

  const [direction, setDirection] = useState(0)

  const handleNext = () => {
    if (step === 1 && !name) {
      setError('Please enter a name')
      return
    }
    setError(null)
    setDirection(1)
    nextStep()
  }

  const handlePrev = () => {
    setError(null)
    setDirection(-1)
    prevStep()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1) handlePrev()
              else router.back()
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Step {step} of 6</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="w-full h-1 bg-secondary/30">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto px-6 py-8 md:py-12 w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full"
          >
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                {STEPS.find(s => s.id === step)?.title}
              </h1>
              <p className="text-muted-foreground font-semibold">
                {step === 1 && "Who are we honoring today?"}
                {step === 2 && "When were they with us?"}
                {step === 3 && "Choose a primary photo for their memorial."}
                {step === 4 && "Choose a tone that reflects their spirit."}
                {step === 5 && "Share a few words about their life story."}
                {step === 6 && "Everything is ready to preserve their legacy."}
              </p>
            </div>

            <Card className="p-6 md:p-8 bg-card border border-border rounded-3xl shadow-sm">
              {step === 1 && (
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Jane Mary Doe"
                    value={name}
                    onChange={(e) => setData({ name: e.target.value })}
                    required
                    className="bg-background border-border text-foreground h-14 rounded-xl text-lg font-medium"
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                    <DatePicker
                      value={birthDate ? new Date(birthDate) : undefined}
                      onChange={(d) => setData({ birthDate: d?.toISOString() })}
                      placeholder="Select birth date"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Passing Date</Label>
                    <DatePicker
                      value={passingDate ? new Date(passingDate) : undefined}
                      onChange={(d) => setData({ passingDate: d?.toISOString() })}
                      placeholder="Select passing date"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <ImageUpload
                    value={coverImage}
                    onChange={(url) => setData({ coverImage: url })}
                    onRemove={() => setData({ coverImage: '' })}
                    uploadPath="covers"
                    userId={userId || ''}
                    maxSize={5}
                  />
                  <div className="pt-4 border-t border-border/50">
                    <Label htmlFor="coverImage" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 block">Or Direct Image URL</Label>
                    <Input
                      id="coverImage"
                      type="url"
                      placeholder="https://..."
                      value={coverImage}
                      onChange={(e) => setData({ coverImage: e.target.value })}
                      className="bg-background border-border text-foreground h-12 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap justify-center gap-4">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setData({ themeColor: color.value })}
                        className={`w-14 h-14 rounded-full border-4 transition-all relative group cursor-pointer ${
                          themeColor === color.value
                            ? 'border-primary scale-110 shadow-md'
                            : 'border-transparent hover:scale-105 opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {themeColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-black text-center text-muted-foreground uppercase tracking-[0.2em] mt-4">
                    Current Selection: {THEME_COLORS.find(c => c.value === themeColor)?.name}
                  </p>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Brief Life Story</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write a brief biography..."
                    value={bio}
                    onChange={(e) => setData({ bio: e.target.value })}
                    rows={6}
                    className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed text-lg font-medium"
                    autoFocus
                  />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center gap-5">
                    <div 
                      className="w-16 h-16 rounded-xl bg-cover bg-center border border-border shrink-0 bg-background"
                      style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'none' }}
                    >
                      {!coverImage && <Heart className="w-full h-full p-5 text-muted-foreground/20" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-tight">{name}</h3>
                      <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                        {birthDate ? new Date(birthDate).getFullYear() : '—'} — {passingDate ? new Date(passingDate).getFullYear() : '—'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Theme</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeColor }} />
                        <span className="text-xs font-bold uppercase">{THEME_COLORS.find(c => c.value === themeColor)?.name}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Story</p>
                      <span className="text-xs font-bold uppercase">{bio.length} characters</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 shake">
                  <p className="text-destructive text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="border-border rounded-full flex-1 h-14 text-lg font-bold cursor-pointer"
                  >
                    Back
                  </Button>
                )}
                
                {step < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm group cursor-pointer"
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preserving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-6 h-6" /> Create Memorial
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={className}
    >
      <Check className="w-full h-full" />
    </motion.div>
  )
}