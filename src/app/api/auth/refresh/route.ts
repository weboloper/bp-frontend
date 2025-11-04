import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found', detail: 'Please log in again' },
        { status: 401 }
      );
    }

    // Call Django refresh endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/accounts/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Django returned HTML error page instead of JSON (likely 500)
      console.error(
        'Django returned non-JSON response:',
        response.status,
        jsonError
      );
      return NextResponse.json(
        {
          error: 'Server error',
          detail: 'Backend server encountered an error',
        },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      // Refresh token invalid or expired
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');

      return NextResponse.json(
        { error: 'Refresh token expired', detail: data.detail || 'Please log in again' },
        { status: 401 }
      );
    }

    // Update access token
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    // If new refresh token provided, update it too
    if (data.refresh) {
      cookieStore.set('refresh_token', data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed',
    });

  } catch (error: any) {
    console.error('Refresh error:', error);

    // Network error: Django offline, connection refused, timeout, etc.
    if (
      error.cause?.code === 'ECONNREFUSED' ||
      error.message?.includes('fetch failed')
    ) {
      return NextResponse.json(
        {
          error: 'Unable to connect to server',
          detail: 'Backend service is unavailable',
          isNetworkError: true,
        },
        { status: 503 }
      );
    }

    // Unexpected error
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
