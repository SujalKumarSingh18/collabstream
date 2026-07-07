# CollabStream Backend & Frontend Engineering Log 🚀

Welcome to your comprehensive full-stack study guide for **CollabStream**. This log serves as your detailed reference for architectural choices, coding style, security mitigation, database schema designs, and frontend systems design. Use this to prepare for full-stack engineering interviews!

---

## 📂 Table of Contents
1. [Phase 1: Project Initialization & Core Skeletons](#phase-1-project-initialization--core-skeletons)
2. [Phase 2: Global Utilities Design](#phase-2-global-utilities-design)
3. [Phase 3: Database Models & Security Mechanics](#phase-3-database-models--security-mechanics)
4. [Phase 4: Middleware Pipeline Architecture](#phase-4-middleware-pipeline-architecture)
5. [Phase 5: Onboarding & Authentication Controllers](#phase-5-onboarding--authentication-controllers)
6. [Phase 6: Kanban Tasks & Dashboard Analytics](#phase-6-kanban-tasks--dashboard-analytics)
7. [Phase 7: Content Interactions Management](#phase-7-content-interactions-management)
8. [Phase 8: Frontend System Design & Routing Layouts](#phase-8-frontend-system-design--routing-layouts)

---

## Phase 1: Project Initialization & Core Skeletons

### 1. File Structure Architecture
Based on production standards, we separate concerns using a clean modular layout:
```text
collabstream/
├── backend/
│   ├── public/
│   │   └── temp/               # Temporary disk storage for Multer uploads
│   ├── src/
│   │   ├── database/
│   │   │   └── index.js        # Mongoose database connection setup
│   │   ├── models/
│   │   │   ├── user.models.js  # User schema & credentials
│   │   │   ├── video.models.js # Video content schema
│   │   │   ├── task.models.js  # Kanban task studio schema
│   │   │   ├── subscription.models.js # Subscriber relation mappings
│   │   │   ├── comment.models.js # Video comment collections
│   │   │   ├── post.models.js  # Creator text update posts
│   │   │   └── like.models.js  # Polymorphic like records
│   │   ├── utils/
│   │   │   ├── asyncHandler.js # Express router promise wrapper
│   │   │   ├── ApiError.js     # Standardized API error structure
│   │   │   ├── ApiResponse.js  # Standardized API success response
│   │   │   └── cloudinary.js   # Cloudinary integration utility
│   │   ├── app.js              # Express app declaration & middlewares
│   │   ├── constants.js        # Global constant definitions (e.g. DB_NAME)
│   │   └── index.js            # Server entry point (starts server post-DB link)
│   ├── .env.sample             # Environment template
│   └── package.json            # Node configuration
```

### 2. Connection Logic: Why Appending `DB_NAME` Matters
In `src/database/index.js`, we establish connection using:
```javascript
await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
```
* **The "Why":** A single MongoDB instance can host multiple databases. If you do not specify the database name at the end of the URI, MongoDB defaults to routing your requests to a database called `test`. By explicitly appending `DB_NAME` (`collabstream`), we partition our collections under their own database namespace, preventing data pollution across different local or production projects.

### 3. Middleware Enforcements & Security Limits
In `src/app.js`, we set up standard parsing limits:
```javascript
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
```
* **Vulnerability Mitigation:** Without explicit limits, the server will parse request payloads of arbitrary sizes. If an attacker sends a massive 50MB JSON object, it will cause:
  1. **Memory Exhaustion:** Express loads the raw body into the server’s RAM.
  2. **Event Loop Blocking:** The V8 engine has to parse the heavy string into JSON synchronously, blocking other requests.
* Enforcing `16kb` limits acts as an early gatekeeper to reject excessively large bodies.

---

## Phase 2: Global Utilities Design

### 1. `asyncHandler` Promise Chain Wrapper
Express does not automatically forward errors thrown inside async route handlers to the error-handling middleware unless you explicitly call `next(err)`. This leads to bloated code:
```javascript
// AVOID THIS REPETITIVE PATTERN
app.get("/route", async (req, res, next) => {
    try {
        const data = await Model.find();
        res.json(data);
    } catch (error) {
        next(error);
    }
});
```
Instead, we use a custom promise wrapper:
```javascript
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
```
* **How it works:** It receives the async handler, returns a standard Express middleware callback, wraps the handler execution inside `Promise.resolve()`, and catches any rejected promise error automatically by passing it to `next(err)`.

### 2. Standardizing API Failures with `ApiError`
In production applications, frontend clients expect consistent error payload structures. Our custom `ApiError` extends the built-in JavaScript `Error` class:
```javascript
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
```
* **Why we use `Error.captureStackTrace`:** It generates the `.stack` property pointing to the file and line number where this specific `new ApiError(...)` was instantiated. Passing `this.constructor` as the second argument prunes the internal constructor call itself from the stack trace, keeping logs clean.

### 3. File Uploads & Memory Cleanup Lifecycle
When managing user files (e.g. video thumbnails, avatars):
1. **Multer (Disk Storage):** Temporarily saves files on the server's local storage inside `./public/temp`.
2. **Cloudinary Upload:** We upload the file from `./public/temp` to Cloudinary's remote media servers.
3. **Local Deletion:** We delete the local file using `fs.unlinkSync(localFilePath)`.

```javascript
// MUST BE IN BOTH TRY AND CATCH
try {
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    fs.unlinkSync(localFilePath); // SUCCESS CLEANUP
    return response;
} catch (error) {
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath); // FAILURE CLEANUP
    }
    return null;
}
```
* **Vulnerability Mitigation:** If the Cloudinary upload fails, the local file remains on our server disk. If we fail to delete it in the `catch` block, failed uploads will consume local storage until the server runs out of disk space, leading to Denial of Service.

---

## Phase 3: Database Models & Security Mechanics

### 1. Password Hashing & The `isModified` Gatekeeper
In Mongoose, we hash passwords using `bcrypt` in a pre-save hook.
* **Critical Requirement:** We must check `this.isModified("password")`.
* **The "Why":** The `pre("save")` hook triggers *every single time* the user document is saved. If a user updates their profile picture, bio, or ad spend budget, and we do not check if the password field was modified, the hook will hash the already-hashed password again! This locks the user out of their account permanently since the original password will no longer match the twice-hashed hash.

### 2. Access Tokens vs. Refresh Tokens (JWT)
We use a two-token system for secure, stateless authentication:

| Feature | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Lifespan** | Short-lived (e.g., 15 minutes - 1 day) | Long-lived (e.g., 7 days - 30 days) |
| **Payload Scope** | Large (ID, email, username, fullName) | Minimal (ID only) |
| **Client Storage** | Memory or secure HTTP-only cookies | Secure HTTP-only cookies |
| **Purpose** | Sent with every API request to authenticate the user | Used to request a new Access Token without asking for credentials |

* **Security Advantage:** If an attacker steals an Access Token, the damage is restricted to its short lifespan. If they attempt to intercept requests, the Refresh Token is stored securely in an `httpOnly` cookie, making it inaccessible to client-side scripts (preventing Cross-Site Scripting - XSS).

### 3. Understanding Pagination & The Aggregate Paginate Plugin
In the Video pipeline model, we attach the `mongooseAggregatePaginate` plugin.
* **What is Pagination?** When a database contains thousands or millions of records, returning all of them in a single query is extremely slow, hogs server memory, and freezes client browsers. Pagination is the technique of breaking down large datasets into small, manageable chunks (called "pages") (e.g., fetching 10 videos per page).
* **The "Why":** Creator studio dashboards require complex aggregation operations (such as joining video data, counting views per creator, calculating average duration, sorting, and matching keywords). Standard `find().populate()` is inefficient and lacks advanced query manipulation. The `mongoose-aggregate-paginate-v2` plugin allows us to paginate directly inside Mongoose aggregation pipelines, ensuring fast page load speeds.

### 4. Creator Studio Statistical Junction Models
To enable creator analytics and studio statistics (views, engagement rates, subscriber growth), we designed specific database models:
* **Subscription Model (`subscriber` ➔ `channel`)**: Tracks the connection between users. By indexing the `channel` field, we can perform highly efficient counts (`countDocuments`) of how many subscribers a channel has, or aggregate subscriber retention rates over time.
* **Comment Model**: Allows users to post feedback on videos. Paginated using the aggregate pagination plugin to load comments progressively below videos.
* **Post Model**: Allows creators to communicate with their audience directly (tweets/community text updates).
* **Like Model**: A polymorphic link mapping a user's like reaction to a specific target (`video`, `comment`, or `post`), storing optional ObjectIds to track engagement statistics dynamically.

---

## Phase 4: Middleware Pipeline Architecture

### 1. Authentication Middleware (`verifyJWT`)
Secures routes by inspecting headers or cookies, decrypting user IDs, fetching the user profile from the database (excluding sensitive fields), and mounting it to the Express request object (`req.user = user`). This ensures subsequent controller steps have instant, authenticated access to the user details.

### 2. File Upload Middleware (`multer`)
Intercepts incoming multipart/form-data requests, parses files, and writes them temporarily to disk (`./public/temp`) before they are handed off to controllers to be sent to Cloudinary.

### 3. Centralized Error Handling Middleware (`errorHandler`)
Acts as the fallback terminal node in the Express routing tree. Any error passed to `next(err)` gets handled here, converted into an instance of `ApiError` if it isn't one already, and sent back as a uniform JSON payload with appropriate HTTP status codes (e.g., 400, 401, 403, 404, 500).

---

## Phase 5: Onboarding & Authentication Controllers

### 1. User Registration Workflow
The registration process follows a multi-step sequence:
1. **Validation**: Check that the input fields (`fullName`, `email`, `username`, `password`) are provided and not empty (using `.trim()`).
2. **Uniqueness Check**: Query MongoDB using `$or` to ensure no existing user has the same `email` or `username`.
3. **File Handling**: Extract temporary local file paths from `req.files` (avatar and optional coverImage) parsed by Multer, and upload them to Cloudinary.
4. **Creation**: Save the user in MongoDB. The password is automatically hashed by our model pre-save hook.
5. **Projection**: Query the created user back, projecting out security credentials (`-password -refreshToken`) before returning the resource.

### 2. Secure Cookie-based Login Authentication
Authentication uses secure, HTTP-only cookies to deliver JWTs:
```javascript
const cookieOptions = {
    httpOnly: true, // Prevents Javascript (XSS) from reading cookies
    secure: true    // Enforces HTTPS-only transmission
};
res.cookie("accessToken", accessToken, cookieOptions);
res.cookie("refreshToken", refreshToken, cookieOptions);
```
* **Cookie-based login** is highly secure because it completely prevents client-side scripts (e.g., malicious NPM packages or browser extensions) from reading the access token, neutralizing token theft vulnerabilities.

### 3. Logout & Refresh Tokens Clearance
* **Logout**: We remove the `refreshToken` from the user's document in MongoDB (using `$unset`) and clear the cookie headers from the client using `res.clearCookie()`.
* **Token Refresh**: When the access token expires, the client's request fails with `401 Unauthorized`. The frontend makes a request to `/refresh-token` sending the refresh token. We verify the refresh token signature, match it against the database to prevent reuse/leakage, and issue a fresh token pair.

---

## Phase 6: Kanban Tasks & Creator Dashboard Analytics

### 1. Scoping Queries to the Logged-In User
To prevent creators from seeing or updating other creators' task cards, all routes query and filter records matching `assignedTo: req.user._id` (set securely in middleware). For updates and deletes, the controller explicitly verifies:
```javascript
if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized modification request");
}
```

### 2. Performing Performant Multi-Collection Dashboard Statistics
Instead of pulling entire tables of likes or video views into Node memory and looping over them, we run Mongoose aggregation pipelines:
* **Lookup Joining**: We use `$lookup` stage to join `videos` with their corresponding `likes` records to count the total likes per creator.
* **Server-side grouping**: Using `$match` and `$group` with `$sum` calculates total views directly inside MongoDB's indexing tree, keeping responses fast.

---

## Phase 7: Content Interactions Management

### 1. Video Publishing & Cloudinary Metadata Integration
During publishing, we parse file paths via Multer and transfer files to Cloudinary. In addition to extracting URLs, Mongoose retrieves file duration (`duration: videoUpload.duration`) dynamically from Cloudinary's response payload, storing it as numerical seconds to drive client view timelines.

### 2. Polymorphic Likes & Subscriptions Mappings
Likes are stored polymorphicly using optional references (`video`, `comment`, `post`) inside the `Like` model. Subscriptions are indexed uniquely using a compound index:
```javascript
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
```
This compound index prevents duplicate subscriptions and speeds up queries for subscriber feeds.

---

## Phase 8: Frontend System Design & Routing Layouts

### 1. Vite & Tailwind v4 Integration
The client is scaffolded as a single-page app using **Vite**. Styling uses **Tailwind CSS v4** via the `@tailwindcss/vite` compiler plugin, removing the need for a legacy `tailwind.config.js` file. Custom color theme variables are configured directly inside `index.css`:
```css
@import "tailwindcss";
:root {
  background-color: #0c0a0f; /* custom dark background */
}
```

### 2. Local Proxy Routing Configuration
To bypass Cross-Origin Resource Sharing (CORS) roadblocks, we configure Vite's built-in dev server to proxy request flows:
```javascript
server: {
  proxy: {
    '/api/v1': {
      target: 'http://localhost:8000', // Redirect local API requests to Express server
      changeOrigin: true,
      secure: false
    }
  }
}
```

### 3. Client-Side Routing and Layout Structures
Using `react-router-dom`'s `createBrowserRouter`, we configure a shared wrapper layout:
- `Layout.jsx` renders a fixed left-side Navigation Sidebar, a top header, and uses `<Outlet />` to mount child routes.
- Component views:
  - `Dashboard.jsx`: Pulls stats and video uploads using Axios concurrent calls (`Promise.all`).
  - `Kanban.jsx`: Harnesses native HTML5 drag-and-drop (`onDragStart`, `onDrop`) to trigger API PATCH updates on task cards.
  - `Converter.jsx`: Calculates estimated yields for campaign conversions.
