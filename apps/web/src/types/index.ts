// ==================== PRIMITIVE TYPES ====================
export type EntityId = string;
export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // ISO 8601 datetime

// ==================== ENUMS / UNIONS ====================

export type SearchMode = 'simple' | 'advanced';

export type ListingKind = 'SINGLE' | 'MTL' | (string & {});

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'LOFT'
  | 'BOAT'
  | 'CAMPER_RV'
  | 'CONDOMINIUM'
  | 'BED_AND_BREAKFAST'
  | 'CABIN'
  | 'TOWNHOUSE'
  | 'HUT'
  | 'DORM'
  | 'TREEHOUSE'
  | 'YURT'
  | 'CASTLE'
  | 'STUDIO'
  | 'BUNGALOW'
  | 'CHALET'
  | 'VILLA'
  | 'TENT'
  | (string & {});

export type TaxType =
  | 'LOCAL_TAX'
  | 'CITY_TAX'
  | 'VAT'
  | 'GOODS_AND_SERVICES_TAX'
  | 'TOURISM_TAX'
  | 'OTHER'
  | (string & {});

export type CurrencyCode =
  | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'JPY' | 'ILS' | 'GBP' | 'HKD'
  | 'NOK' | 'CZK' | 'BRL' | 'THB' | 'ZAR' | 'MYR' | 'KRW' | 'IDR'
  | 'PHP' | 'INR' | 'NZD' | 'TWD' | 'PLN' | 'SGD' | 'TRY' | 'SEK'
  | 'VND' | 'ARS' | 'CNY' | 'DKK' | 'MXN'
  | (string & {});

export type GuestyEnvironment = 'production' | 'sandbox';

export type ReservationStatus =
  | 'confirmed'
  | 'pending'
  | 'pending_auth'
  | 'canceled'
  | 'declined'
  | (string & {});

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'payment_received_booking_failed'
  | 'canceled'
  | (string & {});

// ==================== GUESTY ERROR CODES ====================
export type GuestyErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'WRONG_REQUEST_PARAMETERS'
  | 'LISTING_CALENDAR_BLOCKED'
  | 'MIN_NIGHT_MISMATCH'
  | 'COUPON_NOT_FOUND'
  | 'COUPON_IS_DISABLED'
  | 'COUPON_MIN_NIGHT_MISMATCH'
  | 'COUPON_MAXIMUM_USES_EXCEEDED'
  | 'COUPON_EXPIRATION_DATE_EXCEEDED'
  | 'COUPON_OUT_OF_CHECKIN_RANGE'
  | 'COUPON_UNEXPECTED_ERROR'
  | 'QUOTE_EXPIRED'
  | 'UNAVAILABLE'
  | 'SERVICE_ERROR'
  | 'UNKNOWN';

// ==================== CORE TYPES ====================

export interface Address {
  full?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
}

export interface Picture {
  _id: EntityId;
  original: string;
  thumbnail?: string;
  caption?: string;
}

export interface CalendarDay {
  date: ISODateString;
  available: boolean;
  price?: number;
  minNights?: number;
  status?: string;
}

export interface CalendarRules {
  defaultAvailability?: string;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Listing {
  _id: EntityId;
  title: string;
  type?: ListingKind;
  propertyType?: PropertyType;
  roomType?: string;
  accommodates?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  amenities?: string[];
  address?: Address;
  pictures?: Picture[];
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    neighborhood?: string;
    transit?: string;
    notes?: string;
    houseRules?: string;
  };
  calendarRules?: CalendarRules;
  prices?: {
    basePrice?: number;
    currency?: CurrencyCode;
    cleaningFee?: number;
    weeklyPriceFactor?: number;
    monthlyPriceFactor?: number;
  };
  terms?: {
    cancellationPolicy?: string;
  };
}

export interface ListingsResponse {
  results: Listing[];
  count?: number;
  cursor?: string;
  hasMore?: boolean;
}

// ==================== QUOTE TYPES ====================

export interface Money {
  currency: CurrencyCode;
  fareAccommodation?: number;
  fareCleaning?: number;
  totalFees?: number;
  totalTaxes?: number;
  subTotalPrice?: number;
  hostPayout?: number;
}

export interface RatePlan {
  _id: EntityId;
  name?: string;
  money?: Money;
  days?: Array<{
    date: ISODateString;
    price?: number;
  }>;
}

export interface Quote {
  _id: EntityId;
  listingId: EntityId;
  checkInDateLocalized: ISODateString;
  checkOutDateLocalized: ISODateString;
  guestsCount: number;
  status?: string;
  rates?: {
    ratePlans?: Array<{
      ratePlan?: RatePlan;
      money?: Money;
      days?: Array<{ date: ISODateString; price?: number }>;
    }>;
  };
  coupon?: {
    code?: string;
    discount?: number;
  };
}

// ==================== GUEST & RESERVATION ====================

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Reservation {
  _id: EntityId;
  confirmationCode?: string;
  status: ReservationStatus;
  listingId?: EntityId;
  checkInDateLocalized?: ISODateString;
  checkOutDateLocalized?: ISODateString;
  guestsCount?: number;
  guest?: GuestInfo;
  money?: Money;
  errors?: Array<{ code: GuestyErrorCode; message: string }>;
  createdAt?: ISODateTimeString;
}

// ==================== TRANSACTIONS ====================

export interface Transaction {
  id: EntityId;
  session_id: string;
  quote_id: EntityId;
  amount: number;
  currency: CurrencyCode;
  guest: GuestInfo;
  status: TransactionStatus;
  reservation_id?: EntityId;
  confirmation_code?: string;
  environment?: GuestyEnvironment;
  created_at: ISODateTimeString;
  confirmed_at?: ISODateTimeString;
  error?: string;
}

// ==================== ADMIN & CONFIG ====================

export interface AdminStats {
  contacts: number;
  owner_inquiries: number;
  total_transactions: number;
  confirmed_bookings: number;
  failed_bookings: number;
  environment: GuestyEnvironment;
  sdk_contract_version: string;
  redis_status: 'connected' | 'unavailable';
}

export interface AdminConfig {
  guesty: {
    client_id: string;
    client_secret: string;
    environment: GuestyEnvironment;
    webhook_secret: string;
  };
  stripe: {
    api_key: string;
    publishable_key: string;
  };
  redis: {
    url: string;
    status: 'connected' | 'unavailable';
  };
  firebase: {
    project_id: string;
    configured: boolean;
  };
}

export interface PublicConfig {
  stripe_publishable_key: string;
  google_maps_api_key: string;
  environment: GuestyEnvironment;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
}

// ==================== CONTACT & INQUIRIES ====================

export interface ContactSubmission {
  id: EntityId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: ISODateTimeString;
}

export interface PropertyOwnerInquiry {
  id: EntityId;
  propertyType: string;
  location: string;
  bedrooms?: string;
  bathrooms?: string;
  maxGuests?: string;
  name: string;
  email: string;
  phone: string;
  servicesInterested?: string;
  currentlyListed?: string;
  additionalInfo?: string;
  status: 'new' | 'contacted' | 'converted';
  created_at: ISODateTimeString;
}

// ==================== API ERROR ====================

export interface AppError {
  code: GuestyErrorCode | string;
  message: string;
  userMessage?: string;
  requestId?: string;
  data?: unknown;
}

// ==================== SEARCH PARAMS ====================

export interface SearchParams {
  checkIn?: ISODateString;
  checkOut?: ISODateString;
  guests?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  propertyType?: PropertyType;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface QuoteRequest {
  listingId: EntityId;
  checkInDateLocalized: ISODateString;
  checkOutDateLocalized: ISODateString;
  guestsCount: number;
  guest?: GuestInfo;
  coupons?: string;
}

export interface CheckoutRequest {
  quoteId: EntityId;
  ratePlanId?: EntityId;
  guest: GuestInfo;
  origin_url: string;
}

export interface CheckoutResponse {
  url: string;
  session_id: string;
  amount: number;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
