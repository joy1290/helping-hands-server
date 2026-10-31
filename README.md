# HelpingHands – Backend API

HelpingHands is a social development events platform. This repository contains the backend REST API, authentication system, and database integration for the application.

## 🌐 Live API

https://helping-hands-server-liard.vercel.app/

## 📂 Repositories

- **Client:** https://github.com/joy1290/helping-hands-client
- **Server:** https://github.com/joy1290/helping-hands-server

## ✨ Key Features

- **Authentication:** Secure user authentication using Better Auth.
- **Google Login:** Supports Google OAuth authentication.
- **JWT Verification:** Protects private API routes using JSON Web Tokens.
- **Event Management:** Create, retrieve, update, and delete events.
- **Upcoming Events:** Retrieve upcoming events sorted by date.
- **Join Events:** Allow authenticated users to join events.
- **Joined Events:** Retrieve events joined by the logged-in user.
- **Ownership Protection:** Only event creators can update or delete their own events.
- **Input Validation:** Validates event data before database operations.
- **MongoDB Integration:** Stores users, authentication data, and events.

## 🛠️ Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Better Auth
- JSON Web Token (JWT)
- JOSE
- Zod
- CORS

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/joy1290/helping-hands-server.git
```

### 2. Navigate to the project directory

```bash
cd helping-hands-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Replace the placeholder values with your own credentials. Never commit your `.env` file.

### 5. Run the development server

```bash
npm run dev
```

The API will run at:

http://localhost:5000

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get upcoming events |
| GET | `/api/events/home` | Get six upcoming events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create an event |
| POST | `/api/events/:id/join` | Join an event |
| GET | `/api/events/joined/me` | Get joined events |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

Protected endpoints require a valid authentication token.

## 📌 Project Purpose

HelpingHands aims to make community participation easier by connecting people through meaningful social development events.

## 👨‍💻 Developer

**Joy Gopal Dhar**

GitHub: [joy1290](https://github.com/joy1290)

---

© 2026 HelpingHands. All rights reserved.
