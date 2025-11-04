import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated', detail: 'No access token found' },
        { status: 401 }
      );
    }

    // Call Django /me endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/accounts/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
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
      // Token might be expired, try to refresh
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token expired', detail: 'Access token is invalid or expired', shouldRefresh: true },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch user', detail: data.detail || 'Unknown error' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Get user error:', error);

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

export async function PATCH(request: NextRequest) {
  try {
    // Get FormData from request
    const formData = await request.formData();

    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'No access token found' },
        { status: 401 }
      );
    }

    // Call Django backend with FormData
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/accounts/me/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let fetch set it with boundary for multipart/form-data
      },
      body: formData,
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

    // Return response as-is (success or Django validation errors)
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.detail || 'Profile update failed', ...data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Profile update error:', error);

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

    // Unexpected error (request body parse error, etc.)
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
