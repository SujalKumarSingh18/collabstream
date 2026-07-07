/**
 * Task: Create a promise-based wrapper to catch errors in Express routes.
 * 
 * TODO:
 * 1. Implement a wrapper function `asyncHandler` that takes an Express route handler function (`requestHandler`).
 * 2. Return a standard Express middleware function signature: (req, res, next).
 * 3. Inside the returned function, resolve the `requestHandler` as a Promise.
 * 4. Catch any errors and forward them using `next(err)`.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Resolve the request handler Promise and catch any errors by passing them to next()
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
