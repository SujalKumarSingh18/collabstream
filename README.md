# CollabStream: Creator Project Studio & Video Pipeline 🎬

CollabStream is a premium, fully decoupled full-stack Web Application designed for creators to manage their production pipelines, track statistical metrics, convert ad campaign values in real-time, upload and play video content, and post community updates. 

This repository implements a production-grade, secure architecture separating a **Node/Express REST API** (Backend) from a **React/Vite Single Page Application** (Frontend).

---

## 🏗️ Architectural Overview

CollabStream uses a **decoupled Client-Server architecture** to maximize scalability, security, and independent service deployment:
* **Frontend (`/frontend`)**: A React Single Page Application (SPA) powered by Vite and styled with Tailwind CSS v4. Operates entirely in the client browser and compiles into static HTML/JS/CSS assets ready for CDN deployment.
* **Backend (`/backend`)**: A Node.js and Express REST API. Manages database transactions via Mongoose schemas, processes multipart file uploads using Multer, handles video transcoding metadata via Cloudinary, and manages authentication using JWTs in secure HTTP-only cookies.

---

## ⏳ Chronological Development Milestones

Below is the sequential, detailed history of the project's implementation from skeleton initialization to production-ready deployment:

### 1. Repository Scaffolding & Initial Settings (Phase 1)
* **Monorepo Structuring**: Partitioned the repository into independent `/backend` and `/frontend` workspaces, each with its own package configuration and dependency tree.
* **Express & Database Bindings**: Established the Express app framework inside `app.js` and wired Mongoose database connections in `database/index.js`.
* **Database Namespace Scoping**: Appended the database name (`collabstream`) to the MongoDB Atlas URI string to prevent collection pollution.
* **Payload Size Limits**: Enforced size limits (`16kb`) on incoming JSON and URL-encoded payloads inside Express to mitigate memory-exhaustion and Denial-of-Service (DoS) vulnerabilities.

### 2. Global Utilities & Asset Cleanup Flows (Phase 2)
* **Express Promise Wrapper (`asyncHandler`)**: Wrote a global helper using `Promise.resolve().catch(next)` to automatically catch asynchronous errors and forward them to Express error handlers without repeating try-catch blocks.
* **Unified Error Mapping (`ApiError`)**: Standardized server error payloads by extending the JS `Error` class and capturing clean stack traces.
* **Uniform API Response (`ApiResponse`)**: Standardized success responses so the React client receives predictable payloads.
* **Multer/Cloudinary Lifecycle Cleanup**: Integrated Cloudinary uploads with local disk cleanups. Created fail-safes using `fs.unlinkSync(localFilePath)` to delete temporary uploads inside `/public/temp` if Cloudinary uploads fail, avoiding disk space depletion.

### 3. Database Collection Schemas (Phase 3)
Designed and deployed schemas inside `/models`:
* **User**: Credentials, profiles, password hashing hook (using `bcrypt` in Mongoose pre-save hooks), and JWT token generators.
* **Video**: Cloudinary asset URLs, views track, publication flag, and duration tracking. Added pagination with the `mongoose-aggregate-paginate-v2` plugin.
* **Task**: Kanban card variables (Title, Description, Status, Priority, AssignedTo reference).
* **Subscription**: Map subscriber-to-creator channel relations. Enforced unique compound indexes `{ subscriber: 1, channel: 1 }` to prevent duplicate subscriptions.
* **Comment**: Nested comment lists attached to video items.
* **Post**: Text updates for creator community feeds.
* **Like**: Polymorphic schema using optional references to videos, comments, or posts.

### 4. Middleware Pipeline Architecture (Phase 4)
* **JWT Access Guard (`verifyJWT`)**: Custom authorization middleware that extracts, decodes, and verifies Access Tokens from cookies or headers, attaching the authenticated user details securely to the request object (`req.user`).
* **Multipart File Parser (`upload` middleware)**: Configured Multer disk storage properties to handle incoming avatar, cover, and video thumbnail uploads.
* **Central Error Handler**: Integrated a global error handler in Express to convert unexpected exceptions into `ApiError` payloads.

### 5. Backend REST Controllers & Routers (Phase 5)
* **User Authentication**: Built registration (handles multiple image uploads), login (issues secure cookies), logout, and refresh token validation.
* **Video Pipeline**: Handled multi-gigabyte video uploads, metadata parsing, and deletion.
* **Kanban Studio**: Enabled creation, updates, and drag-and-drop status migrations.
* **Dashboard Aggregations**: Implemented advanced aggregation pipelines using MongoDB `$lookup` and `$group` stages to fetch subscriber counts, like aggregates, and view analytics concurrently.
* **Likes, Comments, & Subscriptions**: Polymorphic liking controllers, paginated comment threads, and subscription toggle controllers.

### 6. Git Infrastructure Integration (Phase 6)
* **Ignored Files**: Configured `.gitignore` to prevent committing node modules, build files, and local `.env` configuration files containing MongoDB or Cloudinary secrets.
* **Remote Binding & Initial Commits**: Binded the local repository to GitHub and pushed the completed backend.

### 7. Frontend Client Scaffolding & Routing (Phase 7)
* **Vite + Tailwind v4**: Initialized the client workspace using Vite. Configured Tailwind CSS v4 using the `@tailwindcss/vite` compiler plugin, removing legacy config files.
* **React Router Layouts**: Set up dynamic route mappings inside `main.jsx` with root `<Route>` elements, including nested client screens.
* **CORS Developer Proxy**: Integrated a local proxy inside `vite.config.js` pointing `/api/v1` to `http://localhost:8000` to prevent cross-origin blocks during local development.

### 8. Frontend Pages & Components (Phase 8)
* **Onboarding Forms**: Built Register and Login pages handling multi-part form payloads using the browser's `FormData` API.
* **Creator Dashboard**: Renders statistics (Total views, subscribers, video stats) and recent video lists.
* **Kanban Board**: Implemented a responsive columns UI featuring native HTML5 drag-and-drop handlers (using `onDragStart` and `onDrop`) to migrate task statuses seamlessly in the DB.
* **Ad-Spend Converter**: Connected to live, real-time exchange rates using the public ExchangeRate-API.
* **Video Gallery & Playback**: Viewport showing views, duration badges, and uploading modals. Player page displays native HTML5 video streams with comments, likes, and subscription states.
* **Community Hub**: Community text posts where creators write and manage updates.

### 9. Security Guards, Attributions, & Vercel Prep (Phase 9)
* **Authorization Router Guards**: Added session check validations on mount in `Layout.jsx` targeting `/api/v1/users/current-user` to automatically redirect unauthenticated visits to `/login`.
* **Self-Subscription Safeguard**: Disabled self-subscription buttons on the Video Player UI if the logged-in creator is watching their own video.
* **Production Axios Defaults**: Configured Axios globally with `axios.defaults.baseURL` and `axios.defaults.withCredentials = true` in `main.jsx` to ensure session cookies are sent securely in production.
* **Vercel Serverless Configurations**: Wrote `vercel.json` routing configurations and created the `backend/api/index.js` serverless handler file.

---

## 🛠️ Tech Stack & Dependencies

### Backend
* **Runtime**: Node.js
* **Framework**: Express (v5)
* **Database**: MongoDB Atlas (Mongoose v9 ODM)
* **Media Handling**: Cloudinary SDK & Multer
* **Security**: JWT (jsonwebtoken) & bcrypt hashing
* **CORS**: cors & cookie-parser

### Frontend
* **Core**: React v18 & Vite
* **Styling**: Tailwind CSS v4 (Vanilla CSS variables)
* **Icons**: lucide-react
* **Routing**: react-router-dom
* **API Client**: Axios (configured with credentials)

---

## 🚀 Deployed URLs
* **Frontend Client**: `https://collabstream-frontend.vercel.app`
* **Backend API**: `https://collabstream-backend.vercel.app`
