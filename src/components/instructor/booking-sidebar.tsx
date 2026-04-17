"use client";

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { getInstructorAvailability } from '@/app/actions/booking';
import type { DayAvailability } from '@/lib/booking-engine';
import styles from './instructor.module.css';
import { Loader2, ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';

type ConsultationType = {
  id: string;
  title: string;
  durationMinutes: number;
  price: number;
  currency: string;
};

interface BookingSidebarProps {
  instructor: {
    id: string;
    slug: string;
    name: string;
  };
  consultationTypes: ConsultationType[];
}

export function BookingSidebar({ instructor, consultationTypes }: BookingSidebarProps) {
  const locale = useLocale();
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string; isoStart: string } | null>(null);

  const handleTypeSelect = async (type: ConsultationType) => {
    setSelectedType(type);
    setSelectedDate(null);
    setSelectedSlot(null);
    setLoading(true);
    setError('');

    // Start fetching from today
    const today = new Date().toISOString().split('T')[0];

    const res = await getInstructorAvailability(type.id, today, 7, Intl.DateTimeFormat().resolvedOptions().timeZone);
    setLoading(false);

    if (res.success && res.data) {
      setAvailability(res.data);
      // Automatically select the first date that has slots
      const firstAvailable = res.data.find(d => d.slots.length > 0);
      if (firstAvailable) {
        setSelectedDate(firstAvailable.date);
      }
    } else {
      setError(res.error || 'Failed to load availability');
    }
  };

  const handleBack = () => {
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailability([]);
  };

  const handleContinue = () => {
    if (!selectedType || !selectedSlot) return;
    
    // Redirect to contact/checkout with the selected parameters
    // In a real app we might pass slot ISO string and type ID.
    const url = `/${locale}/contact?intent=consultation&instructor=${encodeURIComponent(instructor.slug)}&typeId=${selectedType.id}&slot=${encodeURIComponent(selectedSlot.isoStart)}`;
    window.location.href = url;
  };

  if (!selectedType) {
    return (
      <div className={styles.sidebarCard}>
        <h3>{locale === 'ar' ? 'جلسات الحجز المتاحة' : 'Available Booking Types'}</h3>
        <p className={styles.sidebarLead}>
          {locale === 'ar'
            ? 'اختر الخدمة المناسبة لحجز موعد'
            : 'Choose a service to book an appointment'}
        </p>

        {consultationTypes.length === 0 ? (
          <p className={styles.emptyText}>
            {locale === 'ar' ? 'لا توجد أنواع حجز متاحة الآن.' : 'No active booking types right now.'}
          </p>
        ) : (
          <div className={styles.bookingTypes}>
            {consultationTypes.map((type) => (
              <button 
                key={type.id} 
                className={styles.bookingTypeCardBtn}
                onClick={() => handleTypeSelect(type)}
              >
                <div>
                  <strong>{type.title}</strong>
                  <p>
                    <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    {type.durationMinutes || 0} {locale === 'ar' ? 'دقيقة' : 'minutes'}
                  </p>
                </div>
                <span className={styles.priceTag}>
                  {type.price > 0 ? `${type.price.toLocaleString()} ${type.currency || 'EGP'}` : (locale === 'ar' ? 'مجاناً' : 'Free')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Find slots for selected date
  const dateSlots = availability.find(d => d.date === selectedDate)?.slots || [];

  return (
    <div className={styles.sidebarCard}>
      <button onClick={handleBack} className={styles.backButton}>
        <ArrowLeft size={16} /> 
        {locale === 'ar' ? 'الرجوع للخدمات' : 'Back to services'}
      </button>

      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedType.title}</h3>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {selectedType.durationMinutes} {locale === 'ar' ? 'دقيقة' : 'min'} • {selectedType.price > 0 ? `${selectedType.price} ${selectedType.currency}` : 'Free'}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
          <Loader2 className={styles.spinningIcon} size={24} style={{ marginBottom: '8px' }} />
          <span>{locale === 'ar' ? 'جاري تحميل المواعيد المتاحة...' : 'Loading available slots...'}</span>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }}>
          {error}
        </div>
      ) : (
        <div className={styles.calendarFlow}>
          <div className={styles.dateSelector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px' }}>
                {locale === 'ar' ? 'اختر اليوم' : 'Select Date'}
              </strong>
            </div>
            
            {availability.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'لا توجد مواعيد متاحة حالياً.' : 'No available dates currently.'}
              </p>
            ) : (
              <div className={styles.daysScroll}>
                {availability.map((day) => {
                  const dateObj = new Date(day.date);
                  const isSelected = selectedDate === day.date;
                  const hasSlots = day.slots.length > 0;
                  
                  return (
                    <button
                      key={day.date}
                      onClick={() => hasSlots && setSelectedDate(day.date)}
                      disabled={!hasSlots}
                      className={`${styles.dayButton} ${isSelected ? styles.daySelected : ''} ${!hasSlots ? styles.dayDisabled : ''}`}
                    >
                      <span className={styles.dayName}>
                        {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                      </span>
                      <span className={styles.dayNumber}>
                        {dateObj.getDate()}
                      </span>
                      <span className={styles.dayMonth}>
                        {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDate && (
            <div className={styles.timeSelector}>
              <strong style={{ display: 'block', fontSize: '14px', marginBottom: '12px', marginTop: '20px' }}>
                {locale === 'ar' ? 'اختر الوقت' : 'Select Time'}
              </strong>
              
              {dateSlots.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                  {locale === 'ar' ? 'المواعيد محجوزة بالكامل لهذا اليوم.' : 'All slots booked for this day.'}
                </p>
              ) : (
                <div className={styles.slotsGrid}>
                  {dateSlots.map((slot, i) => {
                    const isSelected = selectedSlot?.isoStart === slot.isoStart;
                    return (
                      <button
                        key={`${slot.startTime}-${i}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={`${styles.slotButton} ${isSelected ? styles.slotSelected : ''}`}
                      >
                        {slot.startTime}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div style={{ marginTop: '24px' }}>
              <Button onClick={handleContinue} fullWidth variant="primary">
                {locale === 'ar' ? 'تأكيد الموعد' : 'Confirm Slot'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
