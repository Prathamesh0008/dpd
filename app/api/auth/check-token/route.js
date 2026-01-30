// app/api/auth/check-token/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    // Here you should validate the token with DPD API
    // For now, let's assume it's valid if it exists
    // You should implement actual token validation
    
    return NextResponse.json({ 
      isValid: !!token, 
      message: token ? 'Token exists' : 'No token found' 
    });
  } catch (error) {
    return NextResponse.json({ 
      isValid: false, 
      message: error.message 
    }, { status: 500 });
  }
}