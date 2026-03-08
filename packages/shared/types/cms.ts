import { EntityId, ISODateTimeString } from './index';

export type Slug = string;
export type LocaleCode = 'en' | 'en-US' | 'mt-MT' | (string & {});

export type PageStatus = 'draft' | 'published' | 'archived';

export type SectionType =
  | 'hero'
  | 'featureGrid'
  | 'testimonialList'
  | 'propertyHighlight'
  | 'areaGuide'
  | 'faq'
  | 'richText'
  | 'ctaBanner'
  | 'logoCloud'
  | 'pricingTable'
  | 'comparisonTable'
  | 'howItWorks'
  | 'propertyCollection'
  | 'statsBand'
  | 'newsletter'
  | (string & {});

export interface GlobalSettings {
  id: EntityId;
  siteName: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
  logoUrl: string;
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
  navigation: NavItem[];
  footerLinks: NavItem[];
  defaultSeo: SeoMeta;
}

export interface NavItem {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogImageUrl?: string;
}

export interface Page {
  id: EntityId;
  slug: Slug;
  title: string;
  status: PageStatus;
  locale: LocaleCode;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  publishedAt?: ISODateTimeString;
  seo: SeoMeta;
  sections: CmsSection[];
  version: number;
}

export interface CmsSection {
  id: EntityId;
  type: SectionType;
  order: number;
  data: any;
}

export interface CmsUser {
  id: EntityId;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface ContentVersion {
  id: EntityId;
  entityType: 'page' | 'globalSettings';
  entityId: EntityId;
  version: number;
  createdAt: ISODateTimeString;
  createdBy: EntityId;
  snapshot: any;
}
