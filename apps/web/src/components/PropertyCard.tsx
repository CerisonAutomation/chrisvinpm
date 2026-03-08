import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Bed, Bath, MapPin, Star, ArrowRight } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

export const PropertyCard = ({ listing, checkIn, checkOut, guests, viewMode = "grid" }) => {
  const {
    _id,
    title,
    propertyType,
    accommodates,
    bedrooms,
    bathrooms,
    picture,
    pictures,
    prices,
    address,
    nightlyRates,
    reviews,
    publicDescription,
  } = listing;

  // Compute display price - use MINIMUM from nightlyRates for "From" label
  const displayPrice = useMemo(() => {
    // If nightlyRates is a date->rate map, use min (better "From" than avg)
    if (nightlyRates && Object.keys(nightlyRates).length) {
      const rates = Object.values(nightlyRates).filter(
        (v) => Number.isFinite(v) && v > 0
      );
      if (rates.length) return Math.min(...rates);
    }
    // Fallback to basePrice
    return Number.isFinite(prices?.basePrice) ? prices.basePrice : 0;
  }, [nightlyRates, prices?.basePrice]);

  // Get currency with validation
  const currency = useMemo(() => {
    const curr = prices?.currency;
    return typeof curr === "string" && curr.length === 3 ? curr : "EUR";
  }, [prices?.currency]);

  // Format price with proper locale handling
  const formatPrice = (price, curr) => {
    const validCurrency = typeof curr === "string" && curr.length === 3 ? curr : "EUR";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: validCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price || 0);
    } catch {
      return `€${Math.round(price || 0)}`;
    }
  };

  // Build location text safely (avoid "undefined")
  const locationText = useMemo(() => {
    return [address?.city || address?.neighborhood, address?.country]
      .filter(Boolean)
      .join(", ");
  }, [address]);

  // Build link with all search context
  const buildLink = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    const queryString = params.toString();
    return `/property/${_id}${queryString ? `?${queryString}` : ""}`;
  };

  // Get image sources with srcset for responsive loading
  const mainImage = picture?.large || picture?.original || pictures?.[0]?.large || pictures?.[0]?.original;
  
  const imageSrcSet = useMemo(() => {
    const sources = [
      picture?.thumbnail && `${picture.thumbnail} 240w`,
      picture?.regular && `${picture.regular} 480w`,
      picture?.large && `${picture.large} 1024w`,
      picture?.original && `${picture.original} 1600w`,
    ].filter(Boolean);
    return sources.length > 0 ? sources.join(", ") : undefined;
  }, [picture]);

  // Format count with proper pluralization (handles decimals)
  const formatCount = (n, singular, plural) => {
    if (!Number.isFinite(n)) return null;
    // Handle fractional bathrooms like 1.5
    if (n === 1) return `1 ${singular}`;
    return `${n} ${plural}`;
  };

  // Handle image error
  const handleImageError = (e) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.srcset = "";
  };

  // Aria label for accessibility
  const ariaLabel = useMemo(() => {
    const parts = [title];
    if (locationText) parts.push(locationText);
    if (displayPrice > 0) parts.push(`From ${formatPrice(displayPrice, currency)} per night`);
    return parts.join(". ");
  }, [title, locationText, displayPrice, currency]);

  // List view layout
  if (viewMode === "list") {
    return (
      <Link
        to={buildLink()}
        className="property-card group flex bg-[#161618] overflow-hidden card-gold-border"
        data-testid={`property-card-${_id}`}
        aria-label={ariaLabel}
      >
        {/* Image */}
        <div className="relative w-72 flex-shrink-0 overflow-hidden bg-[#27272A]">
          {mainImage ? (
            <img
              src={mainImage}
              srcSet={imageSrcSet}
              sizes="288px"
              alt={title || "Property"}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className="property-image w-full h-full object-cover"
            />
          ) : (
            <img
              src={PLACEHOLDER_IMAGE}
              alt={title || "Property"}
              loading="lazy"
              decoding="async"
              className="property-image w-full h-full object-cover"
            />
          )}
          {/* Property Type Badge */}
          {propertyType && (
            <div className="absolute top-4 left-4">
              <span className="text-xs uppercase tracking-widest bg-[#0F0F10]/80 backdrop-blur-sm text-[#F5F5F0] px-3 py-1.5">
                {propertyType}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Title & Location */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {title || "Untitled Property"}
                </h3>
                {locationText && (
                  <div className="flex items-center gap-2 text-[#A1A1AA] text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{locationText}</span>
                  </div>
                )}
              </div>
              {/* Rating */}
              {reviews?.avg > 0 && (
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{reviews.avg.toFixed(1)}</span>
                  {reviews.total > 0 && (
                    <span className="text-[#A1A1AA] text-sm">({reviews.total})</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {publicDescription?.summary && (
              <p className="text-[#A1A1AA] text-sm line-clamp-2 mb-4">
                {publicDescription.summary}
              </p>
            )}

            {/* Features */}
            <div className="flex items-center gap-6 text-[#A1A1AA] text-sm">
              {Number.isFinite(accommodates) && accommodates > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{accommodates} guests</span>
                </div>
              )}
              {Number.isFinite(bedrooms) && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span>{formatCount(bedrooms, "bedroom", "bedrooms")}</span>
                </div>
              )}
              {Number.isFinite(bathrooms) && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  <span>{formatCount(bathrooms, "bathroom", "bathrooms")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/5">
            <div>
              {displayPrice > 0 ? (
                <>
                  <span className="text-xs uppercase tracking-widest text-[#A1A1AA] block mb-1">
                    From
                  </span>
                  <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                    {formatPrice(displayPrice, currency)}
                  </span>
                  <span className="text-sm text-[#A1A1AA] ml-1">/night</span>
                </>
              ) : (
                <span className="text-sm text-[#A1A1AA]">Price on request</span>
              )}
            </div>
            <span className="flex items-center gap-2 text-sm uppercase tracking-widest text-[#D4AF37] group-hover:gap-3 transition-all">
              View Details
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view layout (default)
  return (
    <Link
      to={buildLink()}
      className="property-card group block bg-[#161618] overflow-hidden card-gold-border"
      data-testid={`property-card-${_id}`}
      aria-label={ariaLabel}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#27272A]">
        {mainImage ? (
          <img
            src={mainImage}
            srcSet={imageSrcSet}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={title || "Property"}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="property-image w-full h-full object-cover"
          />
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt={title || "Property"}
            loading="lazy"
            decoding="async"
            className="property-image w-full h-full object-cover"
          />
        )}
        {/* Property Type Badge */}
        {propertyType && (
          <div className="absolute top-4 left-4">
            <span className="text-xs uppercase tracking-widest bg-[#0F0F10]/80 backdrop-blur-sm text-[#F5F5F0] px-3 py-1.5">
              {propertyType}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Title */}
        <h3 className="font-['Playfair_Display'] text-lg md:text-xl text-[#F5F5F0] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
          {title || "Untitled Property"}
        </h3>

        {/* Location */}
        {locationText && (
          <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {/* Features */}
        <div className="flex items-center gap-4 text-[#A1A1AA] text-sm mb-5 pb-5 border-b border-white/5">
          {Number.isFinite(accommodates) && accommodates > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{accommodates}</span>
            </div>
          )}
          {Number.isFinite(bedrooms) && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{formatCount(bedrooms, "Bed", "Beds")}</span>
            </div>
          )}
          {Number.isFinite(bathrooms) && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{formatCount(bathrooms, "Bath", "Baths")}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {displayPrice > 0 ? (
              <>
                <span className="text-xs uppercase tracking-widest text-[#A1A1AA] block mb-1">
                  From
                </span>
                <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                  {formatPrice(displayPrice, currency)}
                </span>
                <span className="text-sm text-[#A1A1AA] ml-1">/night</span>
              </>
            ) : (
              <span className="text-sm text-[#A1A1AA]">Price on request</span>
            )}
          </div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] group-hover:underline underline-offset-4">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};
