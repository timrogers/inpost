"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = void 0;
class ResponseError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
    }
}
exports.ResponseError = ResponseError;
