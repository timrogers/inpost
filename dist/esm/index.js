var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from 'cross-fetch';
import { ResponseError } from './errors';
import { LockerSize } from './types';
// Re-export these types, which are part of the module's public API
export { ResponseError, LockerSize };
/*
 * Extracts the location name from the "building number" returned by InPost's
 * API, e.g. "24/7 InPost Locker - TESCO Romford Extra" => "TESCO Romford Extra"
 */
const transformBuildingNumberToName = (buildingNumber) => {
    return buildingNumber.split(' - ')[1];
};
const getErrorMessage = (responseBody, responseStatus) => {
    if ('error' in responseBody) {
        return responseBody.error;
    }
    else if ('message' in responseBody) {
        return responseBody.message;
    }
    else {
        return `Got status code ${responseStatus}, expected 200`;
    }
};
/*
 * Fetches current locker availability for a specific InPost location
 */
export const getAvailabilityForLocation = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams();
    params.append('apm', locationId);
    const response = yield fetch(`https://api.inpost247.uk/locker-capacity?${params.toString()}`);
    if (response.ok) {
        const responseBody = yield response.json();
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
    }
    else {
        const responseBody = yield response.json();
        const error = getErrorMessage(responseBody, response.status);
        throw new ResponseError(error, response);
    }
});
/*
 * Fetches a list of InPost locations near to the provided postcode
 */
export const findLocationsByPostcode = (postcode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams();
    params.append('relative_post_code', postcode);
    params.append('max_distance', '16000');
    params.append('status', 'Operating');
    params.append('limit', '10');
    const response = yield fetch(`https://api-uk-points.easypack24.net/v1/points?${params.toString()}`);
    if (response.ok) {
        const responseBody = yield response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return responseBody.items.map((item) => {
            return {
                id: item.name,
                name: transformBuildingNumberToName(item.address_details.building_number),
                latitude: item.location.latitude,
                longitude: item.location.longitude,
            };
        });
    }
    else {
        const responseBody = yield response.json();
        const error = getErrorMessage(responseBody, response.status);
        throw new ResponseError(error, response);
    }
});
