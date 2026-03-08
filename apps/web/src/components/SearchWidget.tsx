import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Search, ChevronDown, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { apiGet } from "@/lib/api";

export const SearchWidget = ({ variant = "hero", initialFilters = {} as any }) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn ? new Date(initialFilters.checkIn) : null);
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut ? new Date(initialFilters.checkOut) : null);
  const [guests, setGuests] = useState(initialFilters.guests || 2);
  const [location, setLocation] = useState(initialFilters.city || "");
  const [locationInput, setLocationInput] = useState(initialFilters.city || "");
  const [locations, setLocations] = useState<any[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const locationRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiGet<any[]>('/locations');
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };
    fetchLocations();
  }, []);

  // Filter locations based on input
  const filteredLocations = locations.filter(loc =>
    loc.city.toLowerCase().includes(locationInput.toLowerCase()) ||
    loc.region.toLowerCase().includes(locationInput.toLowerCase())
  ).slice(0, 8);

  const popularLocations = locations.filter(loc => loc.popular);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (range: any) => {
    if (range?.from) {
      setCheckIn(range.from);
      if (range?.to) {
        setCheckOut(range.to);
        setIsCalendarOpen(false);
      }
    }
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc.city);
    setLocationInput(loc.city);
    setShowLocationDropdown(false);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    if (guests) params.set("guests", guests.toString());
    if (location) params.set("city", location);
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));
    setIsSearching(false);
    navigate(`/properties?${params.toString()}`);
  };

  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="bg-[#161618] border border-white/10 p-4 rounded-none" data-testid="search-widget-compact">
        <div className="space-y-4">
          {/* Location */}
          <div className="relative" ref={locationRef}>
            <label className="block text-xs uppercase tracking-widest text-[#D4AF37] mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="Where in Malta?"
                className="w-full bg-transparent border border-white/10 pl-10 pr-4 py-3 text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
            
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#161618] border border-white/10 max-h-64 overflow-y-auto z-50">
                {locationInput === "" ? (
                  <>
                    <p className="px-4 py-2 text-xs text-[#71717A] uppercase tracking-widest">Popular</p>
                    {popularLocations.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => handleLocationSelect(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <p className="text-[#F5F5F0]">{loc.city}</p>
                          <p className="text-xs text-[#71717A]">{loc.region}</p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  filteredLocations.map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#A1A1AA]" />
                      <div>
                        <p className="text-[#F5F5F0]">{loc.city}</p>
                        <p className="text-xs text-[#71717A]">{loc.region}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="w-full text-left" data-testid="date-picker-compact">
                <label className="block text-xs uppercase tracking-widest text-[#D4AF37] mb-2">
                  Dates
                </label>
                <div className="flex items-center gap-3 border border-white/10 px-4 py-3 hover:border-[#D4AF37]/50 transition-colors">
                  <Calendar className="w-4 h-4 text-[#A1A1AA]" />
                  <span className={checkIn ? "text-[#F5F5F0]" : "text-[#71717A]"}>
                    {checkIn && checkOut
                      ? `${format(checkIn, "MMM d")} - ${format(checkOut, "MMM d, yyyy")}`
                      : "Select dates"}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#161618] border-white/10" align="start">
              <CalendarComponent
                mode="range"
                selected={{ from: checkIn, to: checkOut }}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                disabled={{ before: new Date() }}
                className="bg-[#161618] text-[#F5F5F0]"
              />
            </PopoverContent>
          </Popover>

          {/* Guests */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#D4AF37] mb-2">
              Guests
            </label>
            <div className="flex items-center justify-between border border-white/10 px-4 py-3">
              <span className="text-[#F5F5F0]">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-none border-white/20 hover:border-[#D4AF37]"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-none border-white/20 hover:border-[#D4AF37]"
                  onClick={() => setGuests(Math.min(20, guests + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest py-4 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass p-4 md:p-6 rounded-none"
      data-testid="search-widget"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 md:gap-6">
        {/* Location Picker */}
        <div className="relative" ref={locationRef}>
          <div
            className="flex items-center gap-3 text-left w-full group border-b border-white/20 focus-within:border-[#D4AF37] transition-colors pb-1"
          >
            <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-0.5">
                Location
              </label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="Where in Malta?"
                className="w-full bg-transparent text-[#F5F5F0] placeholder:text-white/30 focus:outline-none text-sm"
              />
            </div>
          </div>
          
          {showLocationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161618] border border-white/10 max-h-72 overflow-y-auto z-50 shadow-2xl">
              {locationInput === "" ? (
                <>
                  <p className="px-4 py-2 text-xs text-[#71717A] uppercase tracking-widest border-b border-white/5">Popular Destinations</p>
                  {popularLocations.map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#D4AF37]/10 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <div>
                        <p className="text-[#F5F5F0] font-medium">{loc.city}</p>
                        <p className="text-xs text-[#71717A]">{loc.region}, Malta</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : filteredLocations.length > 0 ? (
                filteredLocations.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#D4AF37]/10 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#A1A1AA]" />
                    <div>
                      <p className="text-[#F5F5F0]">{loc.city}</p>
                      <p className="text-xs text-[#71717A]">{loc.region}, Malta</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-[#71717A]">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-3 text-left w-full group border-b border-white/20 hover:border-[#D4AF37]/50 transition-colors pb-1"
              data-testid="date-picker-trigger"
            >
              <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-0.5">
                  Check-in / Check-out
                </span>
                <span className="block text-[#F5F5F0] truncate group-hover:text-[#D4AF37] transition-colors text-sm">
                  {checkIn && checkOut
                    ? `${format(checkIn, "MMM d")} - ${format(checkOut, "MMM d")}`
                    : "Add dates"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-[#161618] border-white/10"
            align="start"
          >
            <CalendarComponent
              mode="range"
              selected={{ from: checkIn, to: checkOut }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              className="bg-[#161618] text-[#F5F5F0]"
              data-testid="date-calendar"
            />
          </PopoverContent>
        </Popover>

        {/* Guests Selector */}
        <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-3 text-left w-full group border-b border-white/20 hover:border-[#D4AF37]/50 transition-colors pb-1"
              data-testid="guests-trigger"
            >
              <Users className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <div className="flex-1">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-0.5">
                  Guests
                </span>
                <span className="block text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors text-sm">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 bg-[#161618] border-white/10 p-4"
            align="start"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#F5F5F0] font-medium">Adults</span>
                  <p className="text-xs text-[#71717A]">Ages 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-white/20 hover:border-[#D4AF37] hover:bg-transparent"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    data-testid="guests-minus"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-[#F5F5F0] font-medium">{guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-white/20 hover:border-[#D4AF37] hover:bg-transparent"
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    data-testid="guests-plus"
                  >
                    +
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#71717A] pt-2 border-t border-white/5">
                Eco-tax: €0.50/adult/night (exempt under 18)
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10 self-stretch" />

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.2em] px-10 py-7 font-bold btn-gold-glow disabled:opacity-50 transition-all duration-300"
          data-testid="search-btn"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <Search className="w-5 h-5 mr-3" />
          )}
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
};
