import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, X, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCompanions } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { KENYAN_LOCATIONS, COMPLEXION_OPTIONS, BOOKING_TYPES } from "@/lib/constants";

export default function Explore() {
  const [filters, setFilters] = useState({
    location: "",
    complexion: [] as string[],
    minAge: 18,
    maxAge: 60,
    bookingType: "",
  });

  const { data: companions, isLoading } = useCompanions(filters);

  const clearFilters = () => {
    setFilters({
      location: "",
      complexion: [],
      minAge: 18,
      maxAge: 60,
      bookingType: "",
    });
  };

  const activeFilterCount = [
    filters.location,
    filters.complexion.length > 0,
    filters.minAge !== 18 || filters.maxAge !== 60,
    filters.bookingType,
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Explore Companions</h1>
            <p className="text-muted-foreground">
              Find verified companions across Kenya
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                className="pl-10"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Companions</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => setFilters({ ...filters, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All locations</SelectItem>
                        {KENYAN_LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Complexion */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Complexion</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPLEXION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={filters.complexion.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  complexion: [...filters.complexion, option.value],
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  complexion: filters.complexion.filter(
                                    (c) => c !== option.value
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Age Range: {filters.minAge} - {filters.maxAge}
                    </label>
                    <Slider
                      value={[filters.minAge, filters.maxAge]}
                      min={18}
                      max={60}
                      step={1}
                      onValueChange={([min, max]) =>
                        setFilters({ ...filters, minAge: min, maxAge: max })
                      }
                    />
                  </div>

                  {/* Booking Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available for</label>
                    <Select
                      value={filters.bookingType}
                      onValueChange={(value) =>
                        setFilters({ ...filters, bookingType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any type</SelectItem>
                        {BOOKING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                {filters.location}
                <button
                  onClick={() => setFilters({ ...filters, location: "" })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.complexion.map((c) => (
              <Badge key={c} variant="secondary" className="gap-1">
                {c}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      complexion: filters.complexion.filter((x) => x !== c),
                    })
                  }
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.bookingType && (
              <Badge variant="secondary" className="gap-1">
                {BOOKING_TYPES.find((t) => t.value === filters.bookingType)?.label}
                <button
                  onClick={() => setFilters({ ...filters, bookingType: "" })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-4 space-y-4">
                <Skeleton className="aspect-[4/5] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : companions && companions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companions.map((companion, index) => (
              <motion.div
                key={companion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/companion/${companion.id}`}
                  className="block rounded-2xl border border-border bg-card overflow-hidden hover-lift"
                >
                  <div className="aspect-[4/5] bg-muted flex items-center justify-center">
                    {companion.avatar_url ? (
                      <img
                        src={companion.avatar_url}
                        alt={companion.full_name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">
                          {companion.full_name || "Anonymous"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {companion.location || "Kenya"}
                        </p>
                      </div>
                      {companion.age && (
                        <Badge variant="secondary">{companion.age} yrs</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {companion.complexion && (
                        <Badge variant="outline" className="text-xs">
                          {companion.complexion}
                        </Badge>
                      )}
                      {companion.height && (
                        <Badge variant="outline" className="text-xs">
                          {companion.height}
                        </Badge>
                      )}
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-primary font-medium">
                        From KES {companion.rate_hourly?.toLocaleString() || "---"}/hr
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No companions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
