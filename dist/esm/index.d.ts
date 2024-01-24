import { ResponseError } from './errors';
import { Location, LockerSize, LockerAvailabilityLevel, ListedLocation } from './types';
export { ResponseError, LockerSize, Location, LockerAvailabilityLevel, ListedLocation };
export declare const getLocation: (locationId: string) => Promise<Location>;
export declare const findLocationsByCoordinates: (latitude: number, longitude: number) => Promise<ListedLocation[]>;
export declare const findLocationsByPostcode: (postcode: string) => Promise<ListedLocation[]>;
