import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/utils/google';

export async function GET() {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
}
