"use client";

import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage({ params }: { params: { bookingId: string } }) {
  const [paymentType, setPaymentType] = useState<'full' | 'installments'>('full');
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [discountCode, setDiscountCode] = useState('');

  // Payment Options grouped by type
  const fullPaymentOptions = [
    { id: 'card', label: 'Credit/Debit Card', provider: 'Paymob', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg' },
    { id: 'wallet', label: 'Digital Wallet (Vodafone Cash, etc.)', provider: 'Paymob', logo: 'https://cdn-icons-png.flaticon.com/512/888/888026.png' },
    { id: 'fawry', label: 'Fawry Cash', provider: 'EasyKash', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Fawry_Logo.png' },
    { id: 'aman', label: 'Aman', provider: 'EasyKash', logo: 'https://pbs.twimg.com/profile_images/1131174681606778880/DqG51wL1_400x400.png' },
  ];

  const installmentOptions = [
    { id: 'valu', label: 'valU', provider: 'Paymob', logo: 'https://valudev.com.eg/assets/images/valu-logo.svg' },
    { id: 'manual', label: 'Next Academy Installment Plan', provider: 'Manual Review', logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.checkoutWrapper}>
        
        {/* Left Section: Payment Options */}
        <div className={styles.paymentSection}>
          <h1 className={styles.header}>Complete Your Booking</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Secure your spot in the <strong style={{ color: 'var(--text-primary)' }}>Premium Bootcamp</strong>
          </p>

          {/* Payment Type Toggle */}
          <div className={styles.paymentTypeToggle}>
            <div 
              className={`${styles.toggleOption} ${paymentType === 'full' ? styles.active : ''}`}
              onClick={() => { setPaymentType('full'); setSelectedMethod('card'); }}
            >
              Pay in Full
            </div>
            <div 
              className={`${styles.toggleOption} ${paymentType === 'installments' ? styles.active : ''}`}
              onClick={() => { setPaymentType('installments'); setSelectedMethod('manual'); }}
            >
              Pay with Installments
            </div>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <h2 className={styles.subHeader}>Select Payment Method</h2>
            <div className={styles.paymentOptions}>
              {(paymentType === 'full' ? fullPaymentOptions : installmentOptions).map((opt) => (
                <div 
                  key={opt.id}
                  className={`${styles.paymentOption} ${selectedMethod === opt.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMethod(opt.id)}
                >
                  <div className={styles.radioGroup}>
                    <div className={styles.radioCustom}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{opt.label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Powered by {opt.provider}</span>
                    </div>
                  </div>
                  <img 
                    src={opt.logo} 
                    alt={opt.label} 
                    className={styles.providerIcon} 
                  />
                </div>
              ))}
            </div>

            {/* Manual Installment Details */}
            {paymentType === 'installments' && selectedMethod === 'manual' && (
              <div className={styles.installmentNotice}>
                <h4>Installment Breakdown</h4>
                <ul>
                  <li><strong>Now:</strong> 30% Down Payment (1,436 EGP)</li>
                  <li><strong>In 30 days:</strong> 35% (1,675 EGP)</li>
                  <li><strong>In 60 days:</strong> 35% (1,676 EGP)</li>
                </ul>
                <p>Note: This request requires admin approval before your spot is officially confirmed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Order Summary */}
        <div className={styles.summarySection}>
          
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <span className={styles.planTitle}>Premium Bootcamp</span>
              <button className={styles.changePlanBtn}>Change round</button>
            </div>
            <p className={styles.planDesc}>Intensive 12-week program • Oct 24, 2026</p>
          </div>

          <div style={{ width: '100%' }}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            
            <div className={styles.summaryRow}>
              <span>Original Price</span>
              <span>4,788 EGP</span>
            </div>
            
            <div className={styles.discountInputWrapper}>
              <input 
                type="text" 
                placeholder="Discount Code" 
                className={styles.discountInput}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button className={styles.applyBtn}>Apply</button>
            </div>

            <div className={styles.divider}></div>

            {paymentType === 'installments' && selectedMethod === 'manual' ? (
               <div className={styles.totalRow}>
                 <span>Due Today (30%)</span>
                 <span style={{ fontSize: '24px', color: 'var(--text-primary)' }}>1,436 EGP</span>
               </div>
            ) : (
              <div className={styles.totalRow}>
                <span>Total Due</span>
                <span style={{ fontSize: '24px', color: 'var(--text-primary)' }}>4,788 EGP</span>
              </div>
            )}
          </div>

          <button className={styles.proceedBtn}>
            {paymentType === 'installments' && selectedMethod === 'manual' 
              ? 'Submit Installment Request' 
              : 'Proceed to Secured Payment'}
          </button>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} color="#00e397" />
            <span>Payments are secure and encrypted.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
