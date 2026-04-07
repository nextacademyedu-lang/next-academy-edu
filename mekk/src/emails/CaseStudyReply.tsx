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

export const CaseStudyReply = () => {
    return (
        <Html>
            <Head />
            <Preview>Inside the Case Studies</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Behind the Scenes
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello there,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thanks for delving into the case studies. I share these deep dives to show exactly how robust systems and automation marketing can transform a business.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            As a subscriber, you'll be the first to know when a new comprehensive case study drops. Expect practical breakdowns and actionable insights.
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

export default CaseStudyReply;
