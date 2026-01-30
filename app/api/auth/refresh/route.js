// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();
    
    // Call DPD authentication API to refresh token
    const response = await fetch('https://api.dpd.com/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (data.access_token) {
      return NextResponse.json({
        ok: true,
        token: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: data.error_description || 'Failed to refresh token'
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: error.message
    }, { status: 500 });
  }
}