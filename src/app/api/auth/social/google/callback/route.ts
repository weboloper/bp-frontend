// src/app/api/auth/social/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=no_code', request.url)
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/login?error=missing_google_config', request.url)
      );
    }

    // Exchange authorization code for access token
    const redirectUri = `${request.nextUrl.origin}/api/auth/social/google/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL('/login?error=google_token_failed', request.url)
      );
    }

    // Send Google access token to Django backend
    const backendResponse = await fetch(
      `${DJANGO_API_URL}/api/accounts/auth/social/google/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
        }),
      }
    );

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('Backend authentication failed:', backendData);
      return NextResponse.redirect(
        new URL('/login?error=backend_auth_failed', request.url)
      );
    }

    // Extract tokens from backend response
    const accessToken = backendData.access_token || backendData.access;
    const refreshToken = backendData.refresh_token || backendData.refresh;

    if (!accessToken || !refreshToken) {
      console.error('Missing tokens in backend response:', backendData);
      return NextResponse.redirect(
        new URL('/login?error=missing_tokens', request.url)
      );
    }

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );

    // Set HTTPOnly cookies for tokens
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    );
  }
}
