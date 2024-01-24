export declare enum LockerSize {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large"
}
export declare enum LockerAvailabilityLevel {
    VERY_LOW = "VERY_LOW",
    LOW = "LOW",
    NORMAL = "NORMAL"
}
export interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    smallLockerAvailability: LockerAvailabilityLevel;
    mediumLockerAvailability: LockerAvailabilityLevel;
    largeLockerAvailability: LockerAvailabilityLevel;
    overallLockerAvailability: LockerAvailabilityLevel;
}
export type ListedLocation = Location & {
    lastUpdatedAt: Date;
};
