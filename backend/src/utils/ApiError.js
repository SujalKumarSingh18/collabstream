/**
 * Task: Create a custom API Error class that extends the default JS Error class.
 * 
 * TODO:
 * 1. Define a class `ApiError` extending `Error`.
 * 2. Define a constructor taking:
 *    - statusCode
 *    - message (default: "Something went wrong")
 *    - errors (default: [])
 *    - stack (default: "")
 * 3. Call super(message) to pass message to base Error.
 * 4. Assign properties: statusCode, data (set to null), message, success (set to false), and errors.
 * 5. Handle the stack trace: if stack is passed, set this.stack = stack, otherwise use Error.captureStackTrace().
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Holds no payload data since it's an error class
        this.message = message;
        this.success = false;
        this.errors = errors;

        // Custom stack trace captures where the error was instantiated for easy debugging
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
