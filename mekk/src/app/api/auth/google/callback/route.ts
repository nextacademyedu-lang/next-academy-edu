import { NextResponse } from 'next/server';
import { authorizeWithCode } from '@/utils/google';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        await authorizeWithCode(code);
        // Redirect back to integrations page on success
        return NextResponse.redirect(new URL('/admin/integrations', request.url));
    } catch (error) {
        console.error('Callback Error:', error);
        return NextResponse.json({ error: 'Failed to authorize' }, { status: 500 });
    }
}
