import { ResponseError } from './errors';
import { Location, LockerSize, LocationAvailability } from './types';
export { ResponseError, LockerSize, Location, LocationAvailability };
export declare const getAvailabilityForLocation: (locationId: string) => Promise<LocationAvailability>;
export declare const getLocation: (locationId: string) => Promise<Location>;
export declare const findLocationsByPostcode: (postcode: string) => Promise<Location[]>;
