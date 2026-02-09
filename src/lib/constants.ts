// Official 47 Counties of Kenya + High-traffic neighborhoods
export const KENYAN_LOCATIONS = [
  // --- 47 Counties ---
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", 
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", 
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", 
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", 
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", 
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", 
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", 
  "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",

  // --- Major Towns & Specific Neighborhoods ---
  "Eldoret", "Thika", "Malindi", "Kitale", "Naivasha", "Nanyuki",
  "Westlands", "Karen", "Lavington", "Kilimani", "Lang'ata", 
  "Kileleshwa", "Parklands", "Eastleigh", "South B", "South C"
] as const;

export const COMPLEXION_OPTIONS = [
  { value: "Fair", label: "Fair" },
  { value: "Brown", label: "Brown" },
  { value: "Dark", label: "Dark" },
  { value: "Olive", label: "Olive" },
] as const;

export const HEIGHT_OPTIONS = [
  "4'10\" - 5'0\"",
  "5'1\" - 5'3\"",
  "5'4\" - 5'6\"",
  "5'7\" - 5'9\"",
  "5'10\" - 6'0\"",
  "6'1\" - 6'3\"",
  "6'4\"+",
] as const;

export const BOOKING_TYPES = [
  { value: "hourly", label: "Hourly", description: "Per hour rate" },
  { value: "daily", label: "Daily", description: "Full day rate" },
  { value: "weekly", label: "Weekly", description: "Weekly rate" },
] as const;

export type ComplexionType = typeof COMPLEXION_OPTIONS[number]["value"];
export type BookingType = typeof BOOKING_TYPES[number]["value"];
export type KenyanLocation = typeof KENYAN_LOCATIONS[number];