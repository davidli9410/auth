import pool from './models/userSchema';
import jwt from 'jsonwebtoken';
import createAuthTokens from './createTokens';
import bcrypt from 'bcrypt';

const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-secret-key';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  refresh_token?: string;
  token_expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash' | 'refresh_token' | 'token_expires_at'>;
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { username, email, password } = data;

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query('INSERT INTO users (username,email,password_hash) VALUES($1,$2,$3) RETURNING *', [username, email, hashedPassword]);

    const { accessToken, refreshToken } = createAuthTokens({ id: user.rows[0].id, email: user.rows[0].email });

    await pool.query(
      'UPDATE users SET refresh_token = $1, token_expires_at = $2 WHERE id = $3',
      [refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.rows[0].id]
    );

    return {
        user: {
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            is_active: user.rows[0].is_active,
            created_at: user.rows[0].created_at,
            updated_at: user.rows[0].updated_at
        },
        access_token: accessToken,
        refresh_token: refreshToken,
    };
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [data.email]);
    if (user.rows.length == 0){
        throw new Error("User not found");
    }
    if (!user.rows[0].is_active){
        throw new Error("User is not active");
    }

    const validPassword = await bcrypt.compare(data.password, user.rows[0].password_hash);
    if (!validPassword){
        throw new Error("Invalid password");
    }
    const accessToken = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret", {expiresIn: "5m"});
    const refreshToken = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret", {expiresIn: "10d"});

    await pool.query(
        'UPDATE users SET refresh_token = $1, token_expires_at = $2 WHERE id = $3',
        [refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.rows[0].id]
      );
    return {
        user: {
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            is_active : user.rows[0].is_active,
            created_at: user.rows[0].created_at,
            updated_at: user.rows[0].updated_at
        },
        access_token : accessToken,
        refresh_token: refreshToken
    };
  }

  static async logout(userId: number): Promise<void> {
    await pool.query('UPDATE users SET refresh_token = NULL, token_expires_at = NULL WHERE id = $1',[userId] );
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const decodedUser = await jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    const userResult = await pool.query('SELECT * FROM users WHERE id=$1 and refresh_token = $2', [decodedUser.id, refreshToken]);
    
    if (userResult.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }
    
    const user = userResult.rows[0];
    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret", {expiresIn: "5m"});
    const newRefreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret", {expiresIn: "10d"});
    
    await pool.query('UPDATE users SET refresh_token = $1, token_expires_at = $2 WHERE id = $3', [newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.id]);

    return {
      access_token: newAccessToken,
      refresh_token : newRefreshToken
    };
  }


  static async getUserById(userId: number): Promise<Omit<User, 'password_hash' | 'refresh_token' | 'token_expires_at'> | null> {

    const user = await pool.query('SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE id=$1', [userId]);
    if (user.rows.length == 0) {
        return null;
    }
    return user.rows[0];
  }


  static async updateProfile(userId: number, data: { username?: string; email?: string }): Promise<User> {

    const username = data.username;
    const email = data.email;
    if (username !== undefined) {
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        if (username.length > 50) {
          throw new Error('Username must be less than 50 characters');
        }
      }
      
      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }
      }

    const updates : string[] = [];
    const values : any[] = [];
    let paramCount = 1;

    if(username) {
        updates.push(`username = $${paramCount}`);
        values.push(username);
        paramCount ++;
    }
    if(email) {
        updates.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('At least one field (username or email) must be provided');
    }
    
    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`, values);

    const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    return userResult.rows[0];
  }


  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret");
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
