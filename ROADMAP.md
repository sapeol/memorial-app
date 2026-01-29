# Memorial App - Feature Roadmap

A private digital memorial app for honoring loved ones.

## Tech Stack

- **Framework**: Next.js 16 (App Router + Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **PWA**: next-pwa (installable, offline-capable)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (planned)

---

## Progress Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Project Setup | ✅ Complete | Next.js + TypeScript + Tailwind |
| PWA Configuration | ✅ Complete | Manifest, service worker ready |
| UI Components | ✅ Complete | shadcn/ui base components installed |
| Landing Page | ✅ Complete | Hero, features, CTA sections |
| Type Definitions | ✅ Complete | Memorial, Milestone, MediaItem, etc. |
| Database Setup | ✅ Complete | Supabase project, tables, RLS, storage |
| Authentication | ✅ Complete | Sign in/up, middleware, session management |
| Memorial Creation UI | ⏳ Pending | Form with cover photo, bio, dates |
| Life Story Timeline | ⏳ Pending | Milestones with approval queue |
| Media Gallery | ⏳ Pending | Photos, videos, audio with tagging |
| Guestbook | ⏳ Pending | Messages from contributors |
| Digital Rituals | ⏳ Pending | Candles, flowers, hearts |
| Invitation System | ⏳ Pending | Email, SMS, access codes |

---

## Detailed Features

### ✅ Completed

#### 1. Project Infrastructure
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS v4 for styling
- shadcn/ui component library
- PWA configuration with next-pwa

#### 2. Landing Page
- Hero section with app value proposition
- Feature showcase (6 cards)
- Call-to-action buttons
- Responsive design
- Dark theme optimized

#### 3. Data Models
```typescript
// Core types defined in src/types/memorial.ts and database.ts
- Memorial: The person being honored
- MemorialParticipant: Access control (owner/contributor/visitor)
- Milestone: Timeline events with approval workflow
- MediaItem: Photos, videos, audio
- GuestbookEntry: Messages from contributors
- Ritual: Digital rituals (candles, flowers)
- Invitation: Invitation system
```

#### 4. Database (Supabase)
- **Project**: `memorial-app` (us-west-1)
- **Tables**:
  - `memorials` - Core memorial data
  - `memorial_participants` - Access control with 3 tiers
  - `milestones` - Timeline events (pending/approved/rejected)
  - `media_items` - Gallery (photo/video/audio)
  - `guestbook_entries` - Messages from contributors
  - `rituals` - Digital rituals (candle/flower/heart/custom)
  - `invitations` - Invitation tracking with access codes
- **RLS**: All tables secured with row-level security
- **Storage**: `memorial-media` bucket with 10MB limit

#### 5. Authentication
- **Sign In/Up pages**: Client components with form validation
- **Auth Context**: React context for client-side auth state
- **Middleware**: Route protection for `/dashboard` and `/memorials/*`
- **Session Management**: Supabase auth with JWT handling
- **Sign Out**: Server action for clean logout

---

### 🚧 In Progress

#### Memorial Creation
- Multi-step form
- Cover photo upload
- Name, dates, bio input
- Theme customization
- Unique memorial ID/slug

#### Life Story Timeline
- Milestone creation form
- Timeline display (vertical)
- Contributor submissions
- Owner approval queue
- Photo attachments

#### Media Gallery
- Upload interface
- Image optimization
- Face tagging (AI)
- Chronological view
- Contributor filter

#### Guestbook
- Message composition
- Relationship field
- Display with avatars
- Timestamps
- Notification system

#### Digital Rituals
- Candle lighting (animation)
- Virtual flowers
- Heart tributes
- Custom rituals
- Expiration options

#### Invitation System
- Email invitations
- SMS invitations
- Access code generation
- Invitation tracking
- Acceptance workflow

---

## Next Steps

1. **Database Setup** (Current)
   - Create Supabase project
   - Design schema
   - Configure RLS policies

2. **Authentication**
   - Implement auth context
   - Create sign-in/sign-up pages
   - Protect routes

3. **Memorial Creation**
   - Build multi-step form
   - Implement file upload
   - Create memorial detail page

---

## Design Principles

1. **Privacy First**: Private circles only, no public-by-default
2. **Respectful Design**: Calm colors, gentle animations
3. **Collaborative**: Contributors can add content with owner approval
4. **Permanent**: Data designed to last generations
5. **Simple**: Easy for non-technical users

---

## License

Private project - All rights reserved
