"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLocationsByPostcode = exports.findLocationsByCoordinates = exports.getLocation = exports.getAvailabilityForLocation = exports.LockerSize = exports.ResponseError = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const errors_1 = require("./errors");
Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function () { return errors_1.ResponseError; } });
const types_1 = require("./types");
Object.defineProperty(exports, "LockerSize", { enumerable: true, get: function () { return types_1.LockerSize; } });
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
        throw new errors_1.ResponseError(error, response);
    }
});
/*
 * Fetches current locker availability for a specific InPost location
 */
const getAvailabilityForLocation = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams({ apm: locationId });
    const response = yield (0, cross_fetch_1.default)(`https://api.inpost247.uk/locker-capacity?${params.toString()}`);
    const responseBody = yield processResponse(response);
    return {
        lastUpdatedAt: new Date(responseBody.lastUpdatedTime),
        availabilityByLockerSize: {
            [types_1.LockerSize.SMALL]: {
                totalCount: responseBody.A.total,
                availableCount: responseBody.A.available,
            },
            [types_1.LockerSize.MEDIUM]: {
                totalCount: responseBody.B.total,
                availableCount: responseBody.B.available,
            },
            [types_1.LockerSize.LARGE]: {
                totalCount: responseBody.C.total,
                availableCount: responseBody.C.available,
            },
        },
    };
});
exports.getAvailabilityForLocation = getAvailabilityForLocation;
/*
 * Fetches an InPost location by its ID
 */
const getLocation = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, cross_fetch_1.default)(`https://api-uk-points.easypack24.net/v1/points/${locationId}`);
    const responseBody = yield processResponse(response);
    return serializeLocation(responseBody);
});
exports.getLocation = getLocation;
const serializeLocation = (location) => {
    return {
        id: location.name,
        name: transformBuildingNumberToName(location.address_details.building_number),
        latitude: location.location.latitude,
        longitude: location.location.longitude,
    };
};
/*
 * Fetches a list of InPost locations near to the provided latitude and longitude
 * coordinates
 */
const findLocationsByCoordinates = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams({
        relative_point: `${latitude},${longitude}`,
        limit: '10',
        max_distance: '16000',
        status: 'Operating',
    });
    const response = yield (0, cross_fetch_1.default)(`https://api-uk-points.easypack24.net/v1/points?${params.toString()}`);
    const responseBody = yield processResponse(response);
    return responseBody.items.map(serializeLocation);
});
exports.findLocationsByCoordinates = findLocationsByCoordinates;
/*
 * Fetches a list of InPost locations near to the provided postcode
 */
const findLocationsByPostcode = (postcode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams({
        relative_post_code: postcode,
        limit: '10',
        max_distance: '16000',
        status: 'Operating',
    });
    const response = yield (0, cross_fetch_1.default)(`https://api-uk-points.easypack24.net/v1/points?${params.toString()}`);
    const responseBody = yield processResponse(response);
    return responseBody.items.map(serializeLocation);
});
exports.findLocationsByPostcode = findLocationsByPostcode;
