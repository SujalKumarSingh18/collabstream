/**
 * Task: Create a standardized API response structure helper.
 * 
 * TODO:
 * 1. Define a class `ApiResponse`.
 * 2. Define a constructor taking:
 *    - statusCode
 *    - data
 *    - message (default: "Success")
 * 3. Assign properties: statusCode, data, message, and success.
 * 4. success should be a boolean set to true if statusCode is less than 400, else false.
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // Standard HTTP success statuses are between 100-399
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
