# HelpingHands – Backend API

HelpingHands is a Social Development Events Platform. This repository contains the backend API built with Express.js, TypeScript, MongoDB, and Better Auth.

## Features

- RESTful API development using Express.js.
- MongoDB database integration.
- User authentication with Better Auth.
- Google OAuth authentication.
- JWT-based API protection.
- Create and manage social development events.
- Update and delete events with creator authorization.
- Join upcoming events.
- View joined events.
- Input validation using Zod.
- Secure protected API routes.
- Error handling and JSON responses.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Better Auth
- JWT
- Zod
- dotenv
- CORS

## Project Structure


src/
├── auth/
│   └── auth.ts
├── config/
│   └── db.ts
├── middleware/
│   └── auth.middleware.ts
├── routes/
│   └── event.routes.ts
├── scripts/
│   └── reset-events.ts
└── server.ts


## Installation

Clone the repository:


git clone YOUR_SERVER_REPOSITORY_URL
cd helping-hands-server


Install dependencies:


npm install


## Environment Variables

Create a `.env` file in the root directory:

env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_better_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


Never upload your actual `.env` file or secret credentials to GitHub.

## Run Locally

Development:


npm run dev


Build:


npm run build


Production:


npm start


## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get upcoming events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |
| POST | `/api/events/:id/join` | Join an event |
| GET | `/api/events/joined/me` | Get joined events |

## Authentication

Authentication is handled using Better Auth with MongoDB and Google OAuth. Protected API routes use JWT verification.

## Developer

Joy Gopal Dhar

