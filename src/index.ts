import fetch from 'cross-fetch';

import { ResponseError } from './errors';
import { Location, LockerSize, LocationAvailability } from './types';

// Re-export these types, which are part of the module's public API
export { ResponseError, LockerSize, Location, LocationAvailability };

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
 * Fetches current locker availability for a specific InPost location
 */
export const getAvailabilityForLocation = async (
  locationId: string,
): Promise<LocationAvailability> => {
  const params = new URLSearchParams();
  params.append('apm', locationId);

  const response = await fetch(
    `https://api.inpost247.uk/locker-capacity?${params.toString()}`,
  );

  if (response.ok) {
    const responseBody = await response.json();

    return {
      lastUpdatedAt: new Date(responseBody.lastUpdatedTime),
      availabilityByLockerSize: {
        [LockerSize.SMALL]: {
          totalCount: responseBody.A.total,
          availableCount: responseBody.A.available,
        },
        [LockerSize.MEDIUM]: {
          totalCount: responseBody.B.total,
          availableCount: responseBody.B.available,
        },
        [LockerSize.LARGE]: {
          totalCount: responseBody.C.total,
          availableCount: responseBody.C.available,
        },
      },
    };
  } else {
    const responseBody = await response.json();
    const error = getErrorMessage(responseBody, response.status);

    throw new ResponseError(error, response);
  }
};

/*
 * Fetches a list of InPost locations near to the provided postcode
 */
export const findLocationsByPostcode = async (postcode: string): Promise<Location[]> => {
  const params = new URLSearchParams();
  params.append('relative_post_code', postcode);
  params.append('max_distance', '16000');
  params.append('status', 'Operating');
  params.append('limit', '10');

  const response = await fetch(
    `https://api-uk-points.easypack24.net/v1/points?${params.toString()}`,
  );

  if (response.ok) {
    const responseBody = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return responseBody.items.map((item: any) => {
      return {
        id: item.name,
        name: transformBuildingNumberToName(item.address_details.building_number),
        latitude: item.location.latitude,
        longitude: item.location.longitude,
      };
    });
  } else {
    const responseBody = await response.json();
    const error = getErrorMessage(responseBody, response.status);

    throw new ResponseError(error, response);
  }
};
