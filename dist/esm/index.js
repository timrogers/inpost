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
import { LockerSize, LockerAvailabilityLevel } from './types';
// Re-export these types, which are part of the module's public API
export { ResponseError, LockerSize, LockerAvailabilityLevel };
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
 * Process a response returned by InPost's API, throwing an error if the response
 * is an error, or otherwise returning the parsed JSON
 */
const processResponse = (response) => __awaiter(void 0, void 0, void 0, function* () {
    if (response.ok) {
        return response.json();
    }
    else {
        const responseBody = yield response.json();
        const error = getErrorMessage(responseBody, response.status);
        throw new ResponseError(error, response);
    }
});
/*
 * Fetches an InPost location by its ID
 */
export const getLocation = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`https://api-uk-global-points.easypack24.net/v1/points/${locationId}`);
    const responseBody = yield processResponse(response);
    return serializeLocation(responseBody);
});
const serializeLocation = (location) => {
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
const serializeListedLocation = (location) => {
    const singleLocation = serializeLocation(location);
    const lastUpdatedAtMilliseconds = location.last_updated_date.seconds * 1000;
    return Object.assign(Object.assign({}, singleLocation), { lastUpdatedAt: new Date(lastUpdatedAtMilliseconds) });
};
/*
 * Fetches a list of InPost locations near to the provided latitude and longitude
 * coordinates
 */
export const findLocationsByCoordinates = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams({
        relative_point: `${latitude},${longitude}`,
        limit: '10',
        max_distance: '16000',
        // TODO: Figure out what the new values beyond "Operating" do
        status: 'Operating NonOperating Disabled',
        // TODO: Figure out what this parameter does
        virtual: '0',
    });
    const response = yield fetch(`https://api-uk-global-points.easypack24.net/v1/points?${params.toString()}`);
    const responseBody = yield processResponse(response);
    return responseBody.items.map(serializeListedLocation);
});
/*
 * Fetches a list of InPost locations near to the provided postcode
 */
export const findLocationsByPostcode = (postcode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams({
        relative_post_code: postcode,
        limit: '10',
        max_distance: '16000',
        // TODO: Figure out what the new values beyond "Operating" do
        status: 'Operating NonOperating Disabled',
        // TODO: Figure out what this parameter does
        virtual: '0',
    });
    const response = yield fetch(`https://api-uk-global-points.easypack24.net/v1/points?${params.toString()}`);
    const responseBody = yield processResponse(response);
    return responseBody.items.map(serializeListedLocation);
});
