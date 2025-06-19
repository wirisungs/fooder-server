# Fooder Server

Backend for Fooder app using Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values.
3. Start the server:
   ```bash
   npm start
   ```

## Project Structure

- `src/` - Source code
- `src/models/` - Mongoose models
- `src/controllers/` - Route controllers
- `src/routes/` - Express routers
- `src/middlewares/` - Express middlewares
- `src/services/` - Business logic
- `src/utils/` - Utility functions
- `src/config/` - Configuration files

## API

- `GET /api/health` - Health check
- `POST /api/users/register` - Register user (sample)
