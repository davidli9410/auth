import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './authService';



export async function register(request: NextRequest) {
    try {
      const body = await request.json();
      const {username, email, password} = body;

      if (!username || !email || !password) {

        return errorResponse("Error, one of the fields is NULL","VALIDATION_ERROR", 400);
        }


      const result = await AuthService.register({username, email, password});
      
      // Set refresh token in HttpOnly cookie
      const response = successResponse(result, 'User registered successfully');
      return setRefreshTokenCookie(response, result.refresh_token);

    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Registration Failed", "INTERNAL_ERROR", 500);

    }
    
}

export async function login(request: NextRequest) {
    try {
      const body = await request.json();
      const {email, password} = body;

      if (!email || !password) {
        return errorResponse("Email or password is NULL", "VALIDATION_ERROR", 400);
      }

      const result = await AuthService.login({email,password});
      
      // Set refresh token in HttpOnly cookie
      const response = successResponse(result,"Login successful");
      return setRefreshTokenCookie(response,result.refresh_token);

    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Login failed", "INTERNAL_ERROR", 500);
    }
    
}

export async function logout(request: NextRequest) {
    try {
      const userId = extractUserId(request);
      await AuthService.logout(userId);
      
      // Clear refresh token cookie
      const response = successResponse(null,"Logout successful");
      response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0 // Expire immediately
      });
      
      return response;
    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Logout failed", "INTERNAL_ERROR", 500);
    }
}

export async function refresh(request: NextRequest) {
    try {
      const refreshToken = request.cookies.get('refreshToken')?.value;
      
      if (!refreshToken) {
        return errorResponse("Refresh token is required", "VALIDATION_ERROR", 400);
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      // Set new refresh token in HttpOnly cookie
      const response = successResponse(result, "Token refreshed successfully");
      return setRefreshTokenCookie(response,result.refresh_token);
    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Token refresh failed", "INTERNAL_ERROR", 500);
    }
}

export async function getUser(request: NextRequest) {
    try {
      const userId = extractUserId(request);  

      if (!userId) {
        return errorResponse("User ID is required", "VALIDATION_ERROR", 400);
      }
      const result = await AuthService.getUserById(userId);
      return successResponse(result, 'User retrieved successfully');

    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to get user", "INTERNAL_ERROR", 500);
    }
    
}

export async function updateProfile(request: NextRequest) {
    try {

      const body = await request.json();
      const {username,email} = body;
      const userId = extractUserId(request);

      if(!userId) {
        return errorResponse("User ID required", "VALIDATION_ERROR", 400);

      }
      const result = await AuthService.updateProfile(userId, {username,email});
      return successResponse(result,"Profile updated successfully");

    }
    catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to update profile", "INTERNAL_ERROR", 500);
    }
    
}

function extractUserId(request: NextRequest): number {
    const authHeader = request.headers.get('authorization');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
        throw new Error('No authorization token provided');
    }
    
    const decoded = AuthService.verifyAccessToken(token);
    return decoded.id;
}


function successResponse(data: any, message: string = 'Success') {
    return NextResponse.json({
      success: true,
      message,
      data
    });
  }
  
function errorResponse(message: string, code: string = 'INTERNAL_ERROR', status: number = 500) {
    return NextResponse.json({
      success: false,
      error: {
        code,
        message
      }
    }, { status });
  }

function setRefreshTokenCookie(response: NextResponse, refreshToken: string) {
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });
    return response;
  }