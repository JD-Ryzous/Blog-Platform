# BlogSpace - Blog Platform with Comments

A beginner-friendly full-stack blog app. Users can register, log in, publish posts, edit or delete their own posts, and comment on any post.

**Stack:** HTML, CSS, JavaScript (frontend) | Node.js + Express (backend) | MongoDB + Mongoose (database)

## Features
- Register and log in (passwords hashed with bcrypt, sessions via JWT)
- Home page with blog cards (title, description, author, date)
- Create, edit and delete posts (owner only, enforced on the server)
- Blog detail page with full article and comments
- Logged-in users can comment; authors can delete their own comments
- Input validation on every endpoint, central error handling
- Responsive design with a mobile menu

## Folder structure
```
blog-platform/
├── server.js              App entry point
├── .env.example           Environment variable template
├── config/db.js           MongoDB connection
├── models/                User, Post, Comment schemas
├── middleware/            auth (JWT), validate, errorHandler
├── routes/                auth, posts, comments (REST API)
└── public/                Frontend (served by Express)
    ├── index.html  post.html  editor.html  login.html
    ├── css/style.css
    └── js/                api.js (shared), home.js, post.js, editor.js, auth.js
```

## Run locally

**Requirements:** Node.js 18+ and MongoDB (local install, or a free MongoDB Atlas cluster).

1. Open a terminal in the project folder and install dependencies:
   ```
   npm install
   ```
2. Create your environment file (a ready-to-use `.env` is included; edit it if needed):
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` - local MongoDB: `mongodb://127.0.0.1:27017/blog_platform`, or paste your Atlas connection string
   - `JWT_SECRET` - change this to any long random string
3. Make sure MongoDB is running (local install: `mongod`, or `sudo systemctl start mongod` on Linux).
4. Start the app:
   ```
   npm start
   ```
5. Open http://localhost:3000

Use `npm run dev` to auto-restart on file changes.

## How to try it
1. Click **Login** > **Create account**, register, and you are logged in.
2. Click **Create Blog**, write a post, and publish it.
3. Open the post from the Home page. Edit or delete it using the buttons shown to you as the author.
4. Add a comment. Register a second user to confirm they can comment but cannot edit your post.

## REST API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Log in, returns token |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/posts | No | List all posts |
| GET | /api/posts/:id | No | Single post |
| POST | /api/posts | Yes | Create post |
| PUT | /api/posts/:id | Owner | Update post |
| DELETE | /api/posts/:id | Owner | Delete post and its comments |
| GET | /api/posts/:postId/comments | No | List comments |
| POST | /api/posts/:postId/comments | Yes | Add comment |
| DELETE | /api/comments/:id | Comment author | Delete comment |

Protected routes expect the header `Authorization: Bearer <token>`.

## Security notes
- Passwords are hashed with bcrypt and never returned by the API.
- Ownership is checked on the server, so hiding buttons in the UI is only a convenience.
- All user text is inserted into the page as plain text, which prevents XSS.
- Before deploying publicly, set a strong `JWT_SECRET` and consider adding `helmet` and `express-rate-limit`.
