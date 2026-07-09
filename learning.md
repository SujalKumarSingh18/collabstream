# CollabStream Full-Stack Engineering & Learning Log 🚀

Welcome to your comprehensive study guide for **CollabStream**. This log serves as your detailed reference for architectural choices, coding style, security mitigation, database schema designs, and full-stack systems design. Use this to prepare for engineering interviews!

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
9. [Phase 9: Key Frontend Interview Concepts & Implementations](#phase-9-key-frontend-interview-concepts--implementations)

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
* **Mongoose Async Pre-Hook Rule:** When writing an `async` pre-save hook, do NOT pass `next` or call `next()`. Mongoose automatically determines the end of execution once your async promise resolves. Calling `next()` in an async hook can trigger duplicate triggers or `TypeError: next is not a function` depending on version dependencies.
```javascript
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
```

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

---

## Phase 4: Middleware Pipeline Architecture

### 1. Authentication Middleware (`verifyJWT`)
Secures routes by inspecting headers or cookies, decrypting user IDs, fetching the user profile from the database (excluding sensitive fields), and mounting it to the Express request object (`req.user = user`). This ensures subsequent controller steps have instant, authenticated access to the user details.

### 2. File Upload Middleware (`multer`)
Intercepts incoming multipart/form-data requests, parses files, and writes them temporarily to disk (`./public/temp`) before they are handed off to controllers to be sent to Cloudinary.

### 3. Centralized Error Handling Middleware (`errorHandler`)
Central endpoint in Express. Any error passed to `next(err)` gets handled here, converted into an instance of `ApiError` if it isn't one already, and sent back as a uniform JSON payload.

---

## Phase 5: Onboarding & Authentication Controllers

### 1. User Registration Workflow
The registration process follows a multi-step sequence:
1. **Validation**: Check that the input fields (`fullName`, `email`, `username`, `password`) are provided and not empty (using `.trim()`).
2. **Uniqueness Check**: Query MongoDB using `$or` to ensure no existing user has the same `email` or `username`.
3. **File Handling**: Extract temporary local file paths from `req.files` (avatar and optional coverImage) parsed by Multer, and upload them to Cloudinary.
4. **Creation**: Save the user in MongoDB. The password is automatically hashed by our model pre-save hook.
5. **Projection**: Query the created user back, projecting out security credentials (`-password -refreshToken`) before returning the resource.

---

## Phase 6: Kanban Tasks & Creator Dashboard Analytics

### 1. Scoping Queries to the Logged-In User
To prevent creators from seeing or updating other creators' task cards, all routes query and filter records matching `assignedTo: req.user._id` (set securely in middleware).

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
The client is scaffolded as a single-page app using **Vite**. Styling uses **Tailwind CSS v4** via the `@tailwindcss/vite` compiler plugin, removing the need for a legacy `tailwind.config.js` file.

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

---

## Phase 9: Key Frontend Interview Concepts & Implementations

### 1. Multipart Form Uploads via Axios
When sending file attachments (like avatar images, cover images, video files, or thumbnails) from React to an Express backend using Multer, standard JSON payloads will not work. We must use the browser's native **`FormData`** API:
```javascript
const formData = new FormData();
formData.append("title", title);
formData.append("videoFile", fileInputRef.files[0]); // Raw file stream

await axios.post("/api/v1/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
```

### 2. Native HTML5 Drag and Drop in React
Instead of installing heavy drag-and-drop packages that add bloat to the bundle size, we can implement Kanban column migrations natively:
1. Mark the elements as draggable: `<div draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}>`.
2. Allow drop targets to accept drops: `<div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "IN_PROGRESS")}>`.
3. Read the ID on drop: `const id = e.dataTransfer.getData("taskId")` and trigger your API call.

### 3. Concurrency Optimization (Promise.all)
To render dashboards without blocking layouts or calling APIs sequentially (which creates a "waterfall" performance lag), run independent API calls concurrently:
```javascript
// Optimized concurrent load:
const [stats, videos] = await Promise.all([
    axios.get("/api/v1/dashboard/stats"),
    axios.get("/api/v1/dashboard/videos")
]);
```
This reduces the page's Time-To-Interactive (TTI) to the speed of the slowest single request, rather than the sum of all requests.

### 4. Advanced Theme Toggling with CSS Substring Attribute Selectors
When working with utility-first frameworks like Tailwind CSS, overriding hardcoded hex colors dynamically (e.g. `bg-[#0c0a0f]`) during theme switches can be challenging. Escaped CSS characters (like `\[` and `\]`) can fail to parse across various legacy browsers or Node CSS build tools.

To bypass this robustly, we use CSS **Attribute Substring Selectors** (`[class*="value"]`) to match Tailwind class strings on DOM elements:
```css
/* Selects any element whose class name contains "bg-[#0c0a0f]" */
.light-theme [class*="bg-[#0c0a0f]"] {
  background-color: #f3f4f6 !important;
  color: #1f2937 !important;
}
```
* **Interview Benefit:** This demonstrates deep knowledge of CSS selectors and represents an elegant way to implement dark/light modes on third-party libraries or utility-first structures without rewriting the class names inside JSX components.

---

## Phase 10: Production Deployments, CORS & Session Cookie Management

### 1. SPA Client-Side Routing Rewrites on Vercel
When deploying a Single Page Application (SPA) using client-side routers (like React Router), reloading the page at a custom path (e.g. `/login`) makes the browser request `/login` directly from the hosting CDN, leading to a `404 Not Found` error.
* **The Solution**: We create a `vercel.json` rewrite configuration inside `/frontend` directing all paths `/(.*)` back to `/index.html`, allowing React Router to intercept the URL and render client-side routes successfully.

### 2. Dynamic CORS Origin Echoing
Hardcoding a single `CORS_ORIGIN` string (e.g. your production frontend URL) locks down your backend, preventing it from accepting requests from localhost during testing, or from temporary Vercel preview deployment URLs.
* **The Solution**: We write a dynamic CORS validation function in `app.js` that checks incoming origin request headers against allowed origins and dynamically echoes them back in the `Access-Control-Allow-Origin` response header, keeping credentials secure and development flexible.

### 3. Cross-Origin Cookie Requirements (`SameSite=None; Secure`)
By default, modern web browsers restrict cookies sent across different domains (e.g. from `collabstream-backend.vercel.app` to `collabstream-frontend.vercel.app`) to prevent Cross-Site Request Forgery (CSRF).
* **The Solution**: To support secure HTTP-only cookies in a decoupled environment, we must configure:
  1. **`httpOnly: true`** (blocks client-side JavaScript access).
  2. **`secure: true`** (forces transfer exclusively over HTTPS).
  3. **`sameSite: "none"`** (tells the browser the cookie is safe to be sent across third-party/cross-subdomain contexts).
* **Interview Benefit**: Deep understanding of cross-domain authentication security, cookie attributes, and browser security policies.


