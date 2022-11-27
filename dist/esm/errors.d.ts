export declare class ResponseError extends Error {
    response: Response;
    constructor(message: string, response: Response);
}
