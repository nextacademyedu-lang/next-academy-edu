import * as React from 'react';
import {
    Html,
    Body,
    Head,
    Heading,
    Container,
    Preview,
    Text,
    Hr,
    Link,
    Tailwind
} from '@react-email/components';

interface ContactReplyProps {
    name: string;
}

export const ContactReply = ({ name }: ContactReplyProps) => {
    return (
        <Html>
            <Head />
            <Preview>I've received your message</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Message Received
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hi {name},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thanks for reaching out! I've received your inquiry and I'll get back to you personally within the next 24-48 hours.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            If you need immediate assistance, feel free to reply directly to this email or message me on WhatsApp.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                            Muhammed Mekky — Marketing Automation Strategist
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ContactReply;
