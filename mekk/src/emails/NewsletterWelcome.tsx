import * as React from 'react';
import {
    Html,
    Body,
    Head,
    Heading,
    Container,
    Preview,
    Section,
    Text,
    Hr,
    Link,
    Tailwind
} from '@react-email/components';

interface NewsletterWelcomeProps {
    source?: string;
    email?: string;
}

export const NewsletterWelcome = ({ source = 'newsletter', email }: NewsletterWelcomeProps) => {
    const isBlog = source === 'blog';

    return (
        <Html>
            <Head />
            <Preview>{isBlog ? 'Welcome to the Weekly Insights' : 'Welcome to the Newsletter'}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Welcome to the Circle
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello there,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thank you for subscribing to the {isBlog ? 'Weekly Insights' : 'Newsletter'}.
                            I share actionable frameworks on systems, automation, and performance marketing.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Zero fluff. Just practical knowledge you can apply immediately.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            You received this email because you signed up at muhammedmekky.com.
                        </Text>
                        <Section className="text-center mt-[20px]">
                            <Link
                                href="https://muhammedmekky.com"
                                className="text-[#000000] underline"
                            >
                                Muhammed Mekky
                            </Link>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default NewsletterWelcome;
