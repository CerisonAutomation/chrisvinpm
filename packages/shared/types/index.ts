export type EntityId = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export type SearchMode = 'simple' | 'advanced';

export type ListingKind = 'SINGLE' | 'MTL' | (string & {});

export type PropertyType =
  | 'APARTMENT' | 'HOUSE' | 'LOFT' | 'BOAT' | 'CAMPER_RV'
  | 'CONDOMINIUM' | 'BED_AND_BREAKFAST' | 'CABIN' | 'TOWNHOUSE'
  | 'HUT' | 'DORM' | 'TREEHOUSE' | 'YURT' | 'CASTLE' | 'STUDIO'
  | 'BUNGALOW' | 'CHALET' | 'VILLA' | 'TENT' | (string & {});

export type TaxType = 'LOCAL_TAX' | 'CITY_TAX' | 'VAT' | 'GOODS_AND_SERVICES_TAX' | 'TOURISM_TAX' | 'OTHER' | (string & {});

export type CurrencyCode = 'USD' | 'EUR' | 'AUD' | 'CAD' | 'JPY' | 'ILS' | 'GBP' | 'HKD' | 'NOK' | 'CZK' | 'BRL' | 'THB' | 'ZAR' | 'MYR' | 'KRW' | 'IDR' | 'PHP' | 'INR' | 'NZD' | 'TWD' | 'PLN' | 'SGD' | 'TRY' | 'SEK' | 'VND' | 'ARS' | 'CNY' | 'DKK' | 'MXN' | (string & {});

export type AmenityCode =
  | 'ACCESSIBLE_HEIGHT_BED' | 'ACCESSIBLE_HEIGHT_TOILET' | 'AIR_CONDITIONING'
  | 'BABYSITTER_RECOMMENDATIONS' | 'BABY_BATH' | 'BABY_MONITOR' | 'BATHTUB'
  | 'BBQ_GRILL' | 'BEACH_ESSENTIALS' | 'BED_LINENS' | 'BREAKFAST' | 'CABLE_TV'
  | 'CARBON_MONOXIDE_DETECTOR' | 'CHANGING_TABLE' | 'CHILDREN_BOOKS_AND_TOYS'
  | 'CHILDREN_DINNERWARE' | 'CLEANING_BEFORE_CHECKOUT' | 'COFFEE_MAKER'
  | 'COOKING_BASICS' | 'DISABLED_PARKING_SPOT' | 'DISHES_AND_SILVERWARE'
  | 'DISHWASHER' | 'DOGS' | 'DOORMAN' | 'DRYER' | 'ELEVATOR_IN_BUILDING'
  | 'ESSENTIALS' | 'EV_CHARGER' | 'EXTRA_PILLOWS_AND_BLANKETS' | 'FIREPLACE_GUARDS'
  | 'FIRE_EXTINGUISHER' | 'FIRM_MATTRESS' | 'FIRST_AID_KIT'
  | 'FLAT_SMOOTH_PATHWAY_TO_FRONT_DOOR' | 'FREE_PARKING_ON_PREMISES'
  | 'GAME_CONSOLE' | 'GARDEN_OR_BACKYARD' | 'GRAB_RAILS_FOR_SHOWER_AND_TOILET'
  | 'GYM' | 'HAIR_DRYER' | 'HANGERS' | 'HEATING' | 'HIGH_CHAIR' | 'HOT_TUB'
  | 'HOT_WATER' | 'INDOOR_FIREPLACE' | 'INTERNET' | 'IRON' | 'KITCHEN'
  | 'LAPTOP_FRIENDLY_WORKSPACE' | 'LONG_TERM_STAYS_ALLOWED' | 'LUGGAGE_DROPOFF_ALLOWED'
  | 'MICROWAVE' | 'OTHER_PET' | 'OUTLET_COVERS' | 'OVEN' | 'PACK_N_PLAY_TRAVEL_CRIB'
  | 'PATH_TO_ENTRANCE_LIT_AT_NIGHT' | 'PATIO_OR_BALCONY' | 'PETS_ALLOWED'
  | 'PETS_LIVE_ON_THIS_PROPERTY' | 'POCKET_WIFI' | 'PRIVATE_ENTRANCE'
  | 'REFRIGERATOR' | 'ROLL_IN_SHOWER_WITH_SHOWER_BENCH_OR_CHAIR'
  | 'ROOM_DARKENING_SHADES' | 'SHAMPOO' | 'SINGLE_LEVEL_HOME' | 'SMOKE_DETECTOR'
  | 'SMOKING_ALLOWED' | 'STAIR_GATES' | 'STEP_FREE_ACCESS' | 'STOVE'
  | 'SUITABLE_FOR_INFANTS' | 'SUITABLE_FOR_CHILDREN' | 'TUB_WITH_SHOWER_BENCH'
  | 'TV' | 'WASHER' | 'WIDE_CLEARANCE_TO_BED' | 'WIDE_CLEARANCE_TO_SHOWER_AND_TOILET'
  | 'WIDE_DOORWAY' | 'WIDE_HALLWAY_CLEARANCE' | 'WINDOW_GUARDS' | 'WIRELESS_INTERNET'
  | (string & {});

export type GuestyErrorCode =
  | 'NOT_FOUND' | 'FORBIDDEN' | 'WRONG_REQUEST_PARAMETERS'
  | 'LISTING_CALENDAR_BLOCKED' | 'MIN_NIGHT_MISMATCH' | 'COUPON_NOT_FOUND'
  | 'COUPON_IS_DISABLED' | 'COUPON_MIN_NIGHT_MISMATCH' | 'COUPON_MAXIMUM_USES_EXCEEDED'
  | 'COUPON_EXPIRATION_DATE_EXCEEDED' | 'COUPON_OUT_OF_CHECKIN_RANGE'
  | 'COUPON_UNEXPECTED_ERROR' | 'QUOTE_EXPIRED' | 'UNAVAILABLE'
  | 'BOOKING_TYPE_MISMATCH';

export interface ListingSummary {
  id: EntityId;
  title: string;
  propertyType: PropertyType;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  currency: CurrencyCode;
  thumbnail: string;
  city: string;
  rating?: number;
  reviewCount?: number;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  amenities: AmenityCode[];
  pictures: { url: string; title?: string }[];
  coordinates: { lat: number; lng: number };
  terms: string;
}

export interface Quote {
  id: EntityId;
  listingId: EntityId;
  checkIn: ISODateString;
  checkOut: ISODateString;
  guests: number;
  totals: QuoteTotals;
  ratePlanId?: string;
  expiresAt: ISODateTimeString;
}

export interface QuoteTotals {
  accommodation: number;
  cleaning: number;
  fees: number;
  taxes: { type: TaxType; amount: number }[];
  discount: number;
  total: number;
  currency: CurrencyCode;
}

export interface Reservation {
  id: EntityId;
  confirmationCode: string;
  status: 'confirmed' | 'pending_auth' | 'failed' | 'canceled';
  listingId: EntityId;
  quoteId: EntityId;
  checkIn: ISODateString;
  checkOut: ISODateString;
  total: number;
  currency: CurrencyCode;
}

export * from './cms';
