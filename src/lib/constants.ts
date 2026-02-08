// Kenyan cities and towns for location filter
export const KENYAN_LOCATIONS = [
  "Nairobi",
  "Mombasa", 
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Nyeri",
  "Machakos",
  "Meru",
  "Lamu",
  "Naivasha",
  "Nanyuki",
  "Kakamega",
  "Kericho",
  "Embu",
  "Isiolo",
  "Kilifi",
  "Westlands",
  "Karen",
  "Lavington",
  "Kilimani",
  "Lang'ata",
  "Kileleshwa",
  "Parklands",
  "Eastleigh",
  "South B",
  "South C",
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
