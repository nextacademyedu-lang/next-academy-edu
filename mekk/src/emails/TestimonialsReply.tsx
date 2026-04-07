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

export const TestimonialsReply = () => {
    return (
        <Html>
            <Head />
            <Preview>Let's talk about getting you similar results</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Let's Talk Systems
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thanks for reaching out! You saw the results on the site and I'm excited to discuss how we can achieve something similar for your business.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            I'll be in touch very soon to schedule a quick chat. In the meantime, feel free to reply directly to this email if you have specific questions or challenges you want to tackle immediately.
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

export default TestimonialsReply;
