'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import { ContactReply } from '@/emails/ContactReply'
import { NewsletterWelcome } from '@/emails/NewsletterWelcome'
import { TestimonialsReply } from '@/emails/TestimonialsReply'
import { CaseStudyReply } from '@/emails/CaseStudyReply'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    if (!name || !email || !message) {
        return { error: 'All fields are required.' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('contacts')
        .insert([{ name, email, message, source: 'contact_page' }])

    if (error) {
        console.error('Contact submission error:', error)
        return { error: 'Failed to submit form. Please try again.' }
    }

    const { data: setting } = await supabase
        .from('email_settings')
        .select('*')
        .eq('source', 'contact_page')
        .single()

    try {
        const mailOptions: any = {
            from: setting?.sender_email || 'Muhammed Mekky <contact@muhammedmekky.com>',
            to: email,
            subject: setting?.subject || 'Message Received',
        }

        if (setting?.body_text?.trim()) {
            let htmlContent = setting.body_text;
            htmlContent = htmlContent.replace(/\{\{\s*name\s*\}\}/gi, name);
            htmlContent = htmlContent.replace(/\{\{\s*email\s*\}\}/gi, email);
            mailOptions.html = htmlContent;
        } else {
            mailOptions.react = ContactReply({ name });
        }

        await resend.emails.send(mailOptions)
    } catch (emailError) {
        console.error('Failed to send contact reply email:', emailError)
    }

    return { success: true }
}

export async function submitNewsletter(formData: FormData, source: string = 'newsletter') {
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required.' }
    }

    const supabase = await createClient()

    // We no longer rely on unique constraint across all sources because a user 
    // can subscribe from different sources (Data Lineage).
    const { error } = await supabase
        .from('subscriptions')
        .insert([{ email, source }])

    if (error) {
        // If unique constraint is on (email, source) combination, we silently succeed
        if (error.code === '23505') {
            return { success: true }
        }
        console.error('Newsletter submission error:', error)
        return { error: 'Failed to subscribe. Please try again.' }
    }

    try {
        const { data: setting } = await supabase
            .from('email_settings')
            .select('*')
            .eq('source', source)
            .single()

        // Decide template based on source
        let Template = NewsletterWelcome({ source, email })
        let subject = setting?.subject || 'Welcome to the Newsletter'
        let from = setting?.sender_email || 'Muhammed Mekky <newsletter@muhammedmekky.com>'

        if (source === 'case_studies') {
            Template = CaseStudyReply()
        }

        const mailOptions: any = {
            from,
            to: email,
            subject,
        }

        if (setting?.body_text?.trim()) {
            let htmlContent = setting.body_text;
            htmlContent = htmlContent.replace(/\{\{\s*email\s*\}\}/gi, email);
            htmlContent = htmlContent.replace(/\{\{\s*source\s*\}\}/gi, source);
            mailOptions.html = htmlContent;
        } else {
            mailOptions.react = Template;
        }

        await resend.emails.send(mailOptions)
    } catch (emailError) {
        console.error('Failed to send newsletter email:', emailError)
    }

    return { success: true }
}

export async function submitTestimonialInquiry(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required.' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('contacts')
        .insert([{ email, source: 'testimonials_talk' }])

    if (error) {
        console.error('Testimonial inquiry submission error:', error)
        return { error: 'Failed to submit inquiry. Please try again.' }
    }

    const { data: setting } = await supabase
        .from('email_settings')
        .select('*')
        .eq('source', 'testimonials_talk')
        .single()

    try {
        const mailOptions: any = {
            from: setting?.sender_email || 'Muhammed Mekky <hello@muhammedmekky.com>',
            to: email,
            subject: setting?.subject || "Let's Talk Systems",
        }

        if (setting?.body_text?.trim()) {
            let htmlContent = setting.body_text;
            htmlContent = htmlContent.replace(/\{\{\s*email\s*\}\}/gi, email);
            mailOptions.html = htmlContent;
        } else {
            mailOptions.react = TestimonialsReply();
        }

        await resend.emails.send(mailOptions)
    } catch (emailError) {
        console.error('Failed to send testimonial reply email:', emailError)
    }

    return { success: true }
}
