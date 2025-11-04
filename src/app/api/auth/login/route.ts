import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call Django backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/accounts/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Django returned HTML error page instead of JSON (likely 500)
      console.error('Django returned non-JSON response:', response.status, jsonError);
      return NextResponse.json(
        {
          error: 'Server error',
          detail: 'Backend server encountered an error',
        },
        { status: response.status || 500 }
      );
    }

    // If login failed, return error as-is (preserves Django's validation)
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Login successful - set HTTPOnly cookies
    const cookieStore = await cookies();

    // Set access token (15 minutes)
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    // Set refresh token (7 days)
    cookieStore.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return success (don't send tokens to client)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });

  } catch (error: any) {
    console.error('Login API error:', error);

    // Network error: Django offline, connection refused, timeout, etc.
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: 'Unable to connect to server',
          detail: 'Backend service is unavailable',
          isNetworkError: true
        },
        { status: 503 }
      );
    }

    // Unexpected error (request body parse error, etc.)
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
