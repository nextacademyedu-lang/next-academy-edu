'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateEmailSettings(formData: FormData) {
    const id = formData.get('id') as string;
    const sender_email = formData.get('sender_email') as string;
    const subject = formData.get('subject') as string;
    const body_text = formData.get('body_text') as string;

    const supabase = await createClient();
    const { error } = await supabase
        .from('email_settings')
        .update({ sender_email, subject, body_text, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Update setting error:', error);
        return { error: 'Failed to update settings.' };
    }

    revalidatePath('/admin/email-settings');
    return { success: true };
}
