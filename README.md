This is a authentication system built from scratch using JWTs(access and refresh tokens) It uses postgreSQL to store user data and also uses HttpOnly cookies. It also uses docker containers for frontend and authentication services.

To use this project, git clone the repository and then:

1. **Set up environment variables:**
   Create a `.env` file in the root directory with:
   ```
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_NAME=auth_db
   DB_PORT=5432
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   ```

2. **Start the entire application:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Secure password hashing with bcrypt
- PostgreSQL database for user storage
- HttpOnly cookies for token storage
- Protected dashboard route
- Modern React/Next.js frontend

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens are stored in HttpOnly cookies
- Refresh tokens are stored in the database
- Access tokens have short expiration times
- Refresh tokens are rotated on use

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/profile` - Get user profile 