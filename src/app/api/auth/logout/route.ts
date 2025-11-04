import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Get tokens from cookies
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Django doesn't have logout endpoint, just delete cookies
    // If you want to blacklist refresh token, you can add Django endpoint
    
    // Delete cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
