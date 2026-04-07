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

interface BookingConfirmationProps {
    name: string;
    date: string;
    time: string;
    meetLink?: string;
}

export const BookingConfirmation = ({ name, date, time, meetLink = 'https://meet.google.com/' }: BookingConfirmationProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your session is confirmed</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Booking Confirmed
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hi {name},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Your strategy session is officially booked for <strong>{date} at {time}</strong>.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            We will be meeting via Google Meet. Here is your meeting link:
                        </Text>
                        <Container className="text-center mt-[32px] mb-[32px]">
                            <Link
                                href={meetLink}
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
                            >
                                Join Google Meet
                            </Link>
                        </Container>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Please come prepared with any specific questions or areas of focus you have in mind. If you need to reschedule, just reply to this email at least 24 hours in advance.
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

export default BookingConfirmation;
