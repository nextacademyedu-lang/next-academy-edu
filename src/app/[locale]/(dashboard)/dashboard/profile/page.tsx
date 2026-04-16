"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, Mail, Phone, Loader2, CheckCircle2, AlertCircle, Briefcase, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTranslations } from 'next-intl';
import {
  updateUserProfile,
  changeUserPassword,
  getUserExtendedProfile,
  updateUserExtendedProfile,
  type ExtendedProfileData,
} from '@/lib/dashboard-api';
import styles from './profile.module.css';
import { DeleteAccountModal } from '@/components/dashboard/delete-account-modal';

type Toast = { type: 'success' | 'error'; message: string } | null;
type Tab = 'general' | 'professional' | 'company' | 'security';

const WORK_FIELDS = [
  'Marketing', 'Sales', 'Tech', 'Finance', 'Operations', 'HR', 'Legal', 'Other',
] as const;

const EXPERIENCE_RANGES = [
  '0-1', '2-5', '6-10', '11-15', '16+',
] as const;

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '500+',
] as const;

const COMPANY_TYPES = [
  'startup', 'sme', 'enterprise', 'government', 'freelancer',
] as const;

const TITLE_OPTIONS = ['Mr', 'Ms', 'Mrs', 'Dr', 'Eng'] as const;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const t = useTranslations('Auth');
  const [tab, setTab] = useState<Tab>('general');

  // General form state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [gender,    setGender]    = useState('');
  const [saving,    setSaving]    = useState(false);

  // Professional form state
  const [title, setTitle]             = useState('');
  const [jobTitle, setJobTitle]       = useState('');
  const [workField, setWorkField]     = useState('');
  const [experience, setExperience]   = useState('');
  const [savingPro, setSavingPro]     = useState(false);

  // Company form state
  const [company, setCompany]           = useState('');
  const [companySize, setCompanySize]   = useState('');
  const [companyType, setCompanyType]   = useState('');
  const [country, setCountry]           = useState('');
  const [city, setCity]                 = useState('');
  const [savingComp, setSavingComp]     = useState(false);

  // Security form state
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd,     setChangingPwd]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Pre-fill from auth context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setPhone(user.phone ?? '');
      setGender(((user as unknown as Record<string, unknown>).gender as string) ?? '');
    }
  }, [user]);

  // Load extended profile
  const loadExtendedProfile = useCallback(async () => {
    if (!user) return;
    const res = await getUserExtendedProfile(user.id);
    if (res.success && res.data && res.data.docs.length > 0) {
      const p = res.data.docs[0] as ExtendedProfileData;
      setProfileId(p.id);
      setTitle(p.title ?? '');
      setJobTitle(p.jobTitle ?? '');
      setWorkField(p.workField ?? '');
      setExperience(p.yearsOfExperience ?? '');
      if (p.company && typeof p.company === 'object' && 'name' in p.company) {
        setCompany(p.company.name);
      } else if (typeof p.company === 'string') {
        setCompany(p.company);
      }
      setCompanySize(p.companySize ?? '');
      setCompanyType(p.companyType ?? '');
      setCountry(p.country ?? '');
      setCity(p.city ?? '');
    }
  }, [user]);

  useEffect(() => {
    loadExtendedProfile();
  }, [loadExtendedProfile]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const res = await updateUserProfile(user.id, { firstName, lastName, phone, gender: gender as 'male' | 'female' });
    setSaving(false);
    if (res.success) {
      await refreshUser();
      showToast('success', t('profileUpdated'));
    } else {
      showToast('error', res.error ?? t('profileUpdateFailed'));
    }
  };

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      showToast('error', t('profileUpdateFailed'));
      return;
    }
    setSavingPro(true);
    const res = await updateUserExtendedProfile(profileId, {
      title, jobTitle, workField, yearsOfExperience: experience,
    });
    setSavingPro(false);
    if (res.success) {
      showToast('success', t('profileUpdated'));
    } else {
      showToast('error', res.error ?? t('profileUpdateFailed'));
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      showToast('error', t('profileUpdateFailed'));
      return;
    }
    setSavingComp(true);
    const res = await updateUserExtendedProfile(profileId, {
      companySize, companyType, country, city,
    });
    setSavingComp(false);
    if (res.success) {
      showToast('success', t('profileUpdated'));
    } else {
      showToast('error', res.error ?? t('profileUpdateFailed'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 8) {
      showToast('error', t('passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', t('passwordsNoMatch'));
      return;
    }
    setChangingPwd(true);
    const res = await changeUserPassword(user.id, newPassword);
    setChangingPwd(false);
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', t('passwordUpdated'));
    } else {
      showToast('error', res.error ?? t('passwordUpdateFailed'));
    }
  };

  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className={styles.container}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className={styles.toastIcon} /> : <AlertCircle size={16} className={styles.toastIcon} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('profileTitle')}</h1>
        <p className={styles.subtitle}>{t('profileSubtitle')}</p>
      </div>

      <div className={styles.layout}>

        {/* Sidebar Nav */}
        <div className={styles.nav}>
          <button onClick={() => setTab('general')} className={`${styles.navBtn} ${tab === 'general' ? styles.active : ''}`}>
            <User size={18} /> {t('generalInfo')}
          </button>
          <button onClick={() => setTab('professional')} className={`${styles.navBtn} ${tab === 'professional' ? styles.active : ''}`}>
            <Briefcase size={18} /> {t('professionalInfo')}
          </button>
          <button onClick={() => setTab('company')} className={`${styles.navBtn} ${tab === 'company' ? styles.active : ''}`}>
            <Building2 size={18} /> {t('companyLocation')}
          </button>
          <button onClick={() => setTab('security')} className={`${styles.navBtn} ${tab === 'security' ? styles.active : ''}`}>
            <Lock size={18} /> {t('securityPassword')}
          </button>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>

          {/* General Tab */}
          {tab === 'general' && (
            <Card className={styles.panelCard}>
              <CardHeader>
                <CardTitle>{t('generalInfo')}</CardTitle>
                <CardDescription>{t('updateDetails')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className={styles.formStack}>

                  {/* Avatar */}
                  <div className={styles.avatarRow}>
                    <div className={styles.avatar}>
                      {avatarInitial}
                    </div>
                    <div>
                      <p className={styles.identityName}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={styles.identityEmail}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="firstName">{t('firstName')}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="lastName">{t('lastName')}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.fieldBlock}>
                    <Label htmlFor="email">{t('email')}</Label>
                    <div className={styles.fieldWithIcon}>
                      <Mail size={16} color="var(--text-muted)" className={styles.inputIcon} />
                      <Input
                        id="email"
                        value={user?.email ?? ''}
                        className={styles.withIconInput}
                        disabled
                      />
                    </div>
                    <p className={styles.fieldHint}>{t('emailCannotChange')}</p>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="phone">{t('phoneLabel')}</Label>
                      <div className={styles.fieldWithIcon}>
                        <Phone size={16} color="var(--text-muted)" className={styles.inputIcon} />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className={styles.withIconInput}
                          placeholder={t('phonePlaceholder')}
                        />
                      </div>
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="gender">{t('genderLabel')}</Label>
                      <select
                        id="gender"
                        className={styles.selectField}
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                      >
                        <option value="">{t('selectGender')}</option>
                        <option value="male">{t('genderMale')}</option>
                        <option value="female">{t('genderFemale')}</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <><Loader2 size={16} className={styles.spinningIcon} />{t('savingChanges')}</> : t('saveChanges')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Professional Tab */}
          {tab === 'professional' && (
            <Card className={styles.panelCard}>
              <CardHeader>
                <CardTitle>{t('professionalInfo')}</CardTitle>
                <CardDescription>{t('updateProfessional')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfessional} className={styles.formStack}>
                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="title">{t('titleLabel')}</Label>
                      <select
                        id="title"
                        className={styles.selectField}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      >
                        <option value="">{t('selectTitle')}</option>
                        {TITLE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="jobTitle">{t('jobTitleLabel')}</Label>
                      <Input
                        id="jobTitle"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder={t('jobTitlePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="workField">{t('workFieldLabel')}</Label>
                      <select
                        id="workField"
                        className={styles.selectField}
                        value={workField}
                        onChange={e => setWorkField(e.target.value)}
                      >
                        <option value="">{t('selectField')}</option>
                        {WORK_FIELDS.map(f => (
                          <option key={f} value={f.toLowerCase()}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="experience">{t('experienceLabel')}</Label>
                      <select
                        id="experience"
                        className={styles.selectField}
                        value={experience}
                        onChange={e => setExperience(e.target.value)}
                      >
                        <option value="">{t('selectExperience')}</option>
                        {EXPERIENCE_RANGES.map(r => (
                          <option key={r} value={r}>{r} years</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <Button type="submit" variant="primary" disabled={savingPro}>
                      {savingPro ? <><Loader2 size={16} className={styles.spinningIcon} />{t('savingChanges')}</> : t('saveChanges')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Company & Location Tab */}
          {tab === 'company' && (
            <Card className={styles.panelCard}>
              <CardHeader>
                <CardTitle>{t('companyLocation')}</CardTitle>
                <CardDescription>{t('updateCompanyLocation')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCompany} className={styles.formStack}>

                  <div className={styles.fieldBlock}>
                    <Label htmlFor="company">{t('companyName')}</Label>
                    <Input
                      id="company"
                      value={company}
                      disabled
                      placeholder={t('companyPlaceholder')}
                    />
                    <p className={styles.fieldHint}>Company is set during onboarding.</p>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="companySize">{t('companySize')}</Label>
                      <select
                        id="companySize"
                        className={styles.selectField}
                        value={companySize}
                        onChange={e => setCompanySize(e.target.value)}
                      >
                        <option value="">{t('selectSize')}</option>
                        {COMPANY_SIZES.map(s => (
                          <option key={s} value={s}>{s} employees</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="companyType">{t('companyType')}</Label>
                      <select
                        id="companyType"
                        className={styles.selectField}
                        value={companyType}
                        onChange={e => setCompanyType(e.target.value)}
                      >
                        <option value="">{t('selectType')}</option>
                        {COMPANY_TYPES.map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="country">{t('country')}</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder={t('countryPlaceholder')}
                      />
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="city">{t('city')}</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder={t('cityPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <Button type="submit" variant="primary" disabled={savingComp}>
                      {savingComp ? <><Loader2 size={16} className={styles.spinningIcon} />{t('savingChanges')}</> : t('saveChanges')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <>
              <Card className={styles.panelCard}>
                <CardHeader>
                  <CardTitle>{t('securityPassword')}</CardTitle>
                  <CardDescription>{t('changePasswordDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className={styles.formStack}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="newPassword">{t('newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder={t('passwordMinLength')}
                        required
                      />
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder={t('passwordMinLength')}
                        required
                      />
                    </div>
                    <div className={styles.actionsRow}>
                      <Button type="submit" variant="primary" disabled={changingPwd}>
                        {changingPwd ? <><Loader2 size={16} className={styles.spinningIcon} />{t('updatingPassword')}</> : t('updatePassword')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className={`${styles.panelCard} ${styles.dangerCard}`}>
                <CardHeader>
                  <CardTitle className={styles.dangerTitle}>{t('dangerZone')}</CardTitle>
                  <CardDescription>{t('deleteAccountDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.actionsRow}>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setShowDeleteModal(true)}
                    >
                      {t('deleteAccountBtn')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
        />
      )}
    </div>
  );
}
