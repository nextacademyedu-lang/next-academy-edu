'use client';

import { useState, useEffect } from 'react';
import { getAvailableSlots, submitBooking } from '../api/bookings/actions';
import styles from './BookClient.module.css';

export interface EventType {
    id: string;
    title: string;
    duration_minutes: number;
    price: number;
    description: string;
}

interface BookClientProps {
    initialEventTypes: EventType[];
}

export default function BookClient({ initialEventTypes }: BookClientProps) {
    const [step, setStep] = useState(1);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedEvent = initialEventTypes.find(e => e.id === selectedEventId);

    // Fetch slots when date or event changes
    useEffect(() => {
        if (!selectedDate || !selectedEvent) return;

        const fetchSlots = async () => {
            setIsSlotsLoading(true);
            setTimeSlots([]);
            try {
                const slots = await getAvailableSlots(selectedDate, selectedEvent.duration_minutes);
                setTimeSlots(slots);
            } catch (err) {
                console.error("Error fetching slots", err);
            } finally {
                setIsSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, selectedEvent]);

    const handleNext = () => {
        setError(null);
        setStep(s => s + 1);
    };
    const handleBack = () => {
        setError(null);
        setStep(s => s - 1);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedEventId || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.append('event_type_id', selectedEventId);
        formData.append('date', selectedDate);
        formData.append('time', selectedTime);
        formData.append('duration_minutes', selectedEvent?.duration_minutes.toString() || '30');

        const result = await submitBooking(formData);

        setIsSubmitting(false);

        if (result?.error) {
            setError(result.error);
        } else {
            setStep(4); // Success step
        }
    };

    return (
        <div className={styles.bookSection}>
            {step === 1 && (
                <div>
                    <h2 className={styles.stepTitle}>1. Choose a Session Type</h2>
                    <div className={styles.eventGrid}>
                        {initialEventTypes.map((event) => (
                            <div
                                key={event.id}
                                className={`${styles.eventCard} ${selectedEventId === event.id ? styles.selected : ''}`}
                                onClick={() => setSelectedEventId(event.id)}
                            >
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                <p className={styles.eventDesc}>{event.description}</p>
                                <div className={styles.eventMeta}>
                                    <span>{event.duration_minutes} Minutes</span>
                                    <span>{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.navigation} style={{ justifyContent: 'flex-end' }}>
                        <button
                            className={styles.btnNext}
                            onClick={handleNext}
                            disabled={!selectedEventId}
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && selectedEvent && (
                <div>
                    <h2 className={styles.stepTitle}>2. Select Date & Time ({selectedEvent.title})</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Select Date</label>
                        <input
                            type="date"
                            className={`${styles.input} ${styles.dateInput}`}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {selectedDate && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Available Times (Your Local Time)</label>
                            {isSlotsLoading ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading available slots...</p>
                            ) : timeSlots.length > 0 ? (
                                <div className={styles.timeGrid}>
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            className={`${styles.timeSlot} ${selectedTime === time ? styles.selected : ''}`}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: '#f87171' }}>No available slots for this date. Please select another day.</p>
                            )}
                        </div>
                    )}

                    <div className={styles.navigation}>
                        <button className={styles.btnBack} onClick={handleBack}>Back</button>
                        <button
                            className={styles.btnNext}
                            onClick={handleNext}
                            disabled={!selectedDate || !selectedTime}
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && selectedEvent && (
                <form onSubmit={handleSubmit}>
                    <h2 className={styles.stepTitle}>3. Your Details</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input type="text" name="name" required className={styles.input} placeholder="John Doe" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input type="email" name="email" required className={styles.input} placeholder="john@example.com" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Please share a brief overview of what you'd like to discuss.</label>
                        <textarea name="notes" className={styles.input} rows={4} placeholder="Your current challenges, goals, etc..."></textarea>
                    </div>

                    {error && (
                        <div style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.navigation}>
                        <button type="button" className={styles.btnBack} onClick={handleBack} disabled={isSubmitting}>Back</button>
                        <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            )}

            {step === 4 && (
                <div className={styles.successMessage}>
                    <div className={styles.successIcon}>✓</div>
                    <h2 className={styles.stepTitle} style={{ border: 'none', marginBottom: '1rem' }}>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Thank you for booking. A confirmation email with the meeting details has been sent to your inbox.
                    </p>
                </div>
            )}
        </div>
    );
}
