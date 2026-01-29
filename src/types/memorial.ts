// Access levels for memorial participants
export type AccessLevel = "owner" | "contributor" | "visitor";

// Status for contributor-submitted milestones
export type ApprovalStatus = "pending" | "approved" | "rejected";

// A memorial represents a person being remembered
export interface Memorial {
  id: string;
  name: string;
  // Birth and passing dates (null if still living - rare but possible for memorials)
  birthDate: Date | null;
  passingDate: Date | null;
  // Basic bio/obituary
  bio: string;
  // Owner is the creator who has full control
  ownerId: string;
  // Cover image URL
  coverImage: string | null;
  // Theme customization
  themeColor: string;
  // When created
  createdAt: Date;
  // When last updated
  updatedAt: Date;
}

// A participant in a memorial with specific access
export interface MemorialParticipant {
  id: string;
  memorialId: string;
  userId: string;
  accessLevel: AccessLevel;
  invitedBy: string; // userId of who invited them
  invitedAt: Date;
  acceptedAt: Date | null; // null if invitation pending
}

// A milestone in the life story timeline
export interface Milestone {
  id: string;
  memorialId: string;
  title: string;
  description: string;
  date: Date | null; // When it happened (approximate is okay)
  location: string | null;
  // Who submitted this milestone
  submittedBy: string; // userId
  // Approval status for owner-curated milestones
  status: ApprovalStatus;
  // Attached media
  imageUrls: string[];
  createdAt: Date;
}

// A media item in the gallery
export interface MediaItem {
  id: string;
  memorialId: string;
  type: "photo" | "video" | "audio";
  url: string;
  thumbnailUrl: string | null;
  caption: string;
  // Date the media was taken (not when uploaded)
  capturedAt: Date | null;
  uploadedBy: string; // userId
  tags: string[]; // Face tags, location tags, etc.
  createdAt: Date;
}

// A message in the guestbook
export interface GuestbookEntry {
  id: string;
  memorialId: string;
  authorId: string; // userId
  authorName: string; // Display name (if not a user)
  message: string;
  // Optional relationship to deceased
  relationship: string | null;
  createdAt: Date;
}

// A digital ritual (candle, flower, etc.)
export interface Ritual {
  id: string;
  memorialId: string;
  type: "candle" | "flower" | "heart" | "custom";
  userId: string; // Who left it
  message: string | null;
  // Rituals can be temporary or permanent
  expiresAt: Date | null; // null = permanent
  createdAt: Date;
}

// An invitation to a memorial
export interface Invitation {
  id: string;
  memorialId: string;
  email: string | null;
  phone: string | null;
  accessCode: string; // For link-based access
  invitedBy: string; // userId
  expiresAt: Date | null;
  acceptedAt: Date | null;
  createdAt: Date;
}
