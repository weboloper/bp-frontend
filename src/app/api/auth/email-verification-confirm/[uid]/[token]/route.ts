import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    uid: string;
    token: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // In Next.js 15, params is a Promise and must be awaited
    const { uid, token } = await params;

    // Call Django backend with uid and token in URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/accounts/auth/email-verify/${uid}/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    // Return response as-is (success or Django validation errors)
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API error:', error);

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
