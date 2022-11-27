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
exports.findLocationsByPostcode = exports.getAvailabilityForLocation = exports.LockerSize = exports.ResponseError = void 0;
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
 * Fetches current locker availability for a specific InPost location
 */
const getAvailabilityForLocation = (locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams();
    params.append('apm', locationId);
    const response = yield (0, cross_fetch_1.default)(`https://api.inpost247.uk/locker-capacity?${params.toString()}`);
    if (response.ok) {
        const responseBody = yield response.json();
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
    }
    else {
        const responseBody = yield response.json();
        const error = getErrorMessage(responseBody, response.status);
        throw new errors_1.ResponseError(error, response);
    }
});
exports.getAvailabilityForLocation = getAvailabilityForLocation;
/*
 * Fetches a list of InPost locations near to the provided postcode
 */
const findLocationsByPostcode = (postcode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = new URLSearchParams();
    params.append('relative_post_code', postcode);
    params.append('max_distance', '16000');
    params.append('status', 'Operating');
    params.append('limit', '10');
    const response = yield (0, cross_fetch_1.default)(`https://api-uk-points.easypack24.net/v1/points?${params.toString()}`);
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
        throw new errors_1.ResponseError(error, response);
    }
});
exports.findLocationsByPostcode = findLocationsByPostcode;
