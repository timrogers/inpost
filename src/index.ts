import fetch from 'cross-fetch';

import { ResponseError } from './errors';
import { Location, LockerSize, LockerAvailabilityLevel, ListedLocation } from './types';

// Re-export these types, which are part of the module's public API
export { ResponseError, LockerSize, Location, LockerAvailabilityLevel, ListedLocation };

/*
 * Extracts the location name from the "building number" returned by InPost's
 * API, e.g. "24/7 InPost Locker - TESCO Romford Extra" => "TESCO Romford Extra"
 */
const transformBuildingNumberToName = (buildingNumber: string): string => {
  return buildingNumber.split(' - ')[1];
};

interface LooseObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const getErrorMessage = (responseBody: LooseObject, responseStatus: number) => {
  if ('error' in responseBody) {
    return responseBody.error;
  } else if ('message' in responseBody) {
    return responseBody.message;
  } else {
    return `Got status code ${responseStatus}, expected 200`;
  }
};

/*
 * Process a response returned by InPost's API, throwing an error if the response
 * is an error, or otherwise returning the parsed JSON
 */
const processResponse = async (response: Response): Promise<LooseObject> => {
  if (response.ok) {
    return response.json();
  } else {
    const responseBody = await response.json();
    const error = getErrorMessage(responseBody, response.status);

    throw new ResponseError(error, response);
  }
};

/*
 * Fetches an InPost location by its ID
 */
export const getLocation = async (locationId: string): Promise<Location> => {
  const response = await fetch(
    `https://api-uk-global-points.easypack24.net/v1/points/${locationId}`,
  );

  const responseBody = await processResponse(response);

  return serializeLocation(responseBody);
};

const serializeLocation = (location: LooseObject): Location => {
  return {
    id: location.name,
    name: transformBuildingNumberToName(location.address_details.building_number),
    latitude: location.location.latitude,
    longitude: location.location.longitude,
    smallLockerAvailability: location.locker_availability.details.A,
    mediumLockerAvailability: location.locker_availability.details.B,
    largeLockerAvailability: location.locker_availability.details.C,
    overallLockerAvailability: location.locker_availability.status,
  };
};

const serializeListedLocation = (location: LooseObject): ListedLocation => {
  const singleLocation = serializeLocation(location);

  const lastUpdatedAtMilliseconds = location.last_updated_date.seconds * 1_000;

  return { ...singleLocation, lastUpdatedAt: new Date(lastUpdatedAtMilliseconds) };
};

/*
 * Fetches a list of InPost locations near to the provided latitude and longitude
 * coordinates
 */
export const findLocationsByCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<ListedLocation[]> => {
  const params = new URLSearchParams({
    relative_point: `${latitude},${longitude}`,
    limit: '10',
    max_distance: '16000',
    // TODO: Figure out what the new values beyond "Operating" do
    status: 'Operating NonOperating Disabled',
    // TODO: Figure out what this parameter does
    virtual: '0',
  });

  const response = await fetch(
    `https://api-uk-global-points.easypack24.net/v1/points?${params.toString()}`,
  );

  const responseBody = await processResponse(response);

  return responseBody.items.map(serializeListedLocation);
};

/*
 * Fetches a list of InPost locations near to the provided postcode
 */
export const findLocationsByPostcode = async (
  postcode: string,
): Promise<ListedLocation[]> => {
  const params = new URLSearchParams({
    relative_post_code: postcode,
    limit: '10',
    max_distance: '16000',
    // TODO: Figure out what the new values beyond "Operating" do
    status: 'Operating NonOperating Disabled',
    // TODO: Figure out what this parameter does
    virtual: '0',
  });

  const response = await fetch(
    `https://api-uk-global-points.easypack24.net/v1/points?${params.toString()}`,
  );

  const responseBody = await processResponse(response);

  return responseBody.items.map(serializeListedLocation);
};
