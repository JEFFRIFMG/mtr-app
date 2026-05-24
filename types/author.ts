export type SocialPlatform =
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  avatarUrl: string | null;
  avatarAlt: string | null;
  role: string | null;
  bio: string | null;
  socialLinks: SocialLink[] | null;
}
