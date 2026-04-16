# Nadia — Product Benchmarker Report
**Team:** Competitor Research Unit  
**Date:** 2026-04-16  
**Scope:** Feature-by-feature product comparison across MENA edtech competitors

## Executive Summary
Next Academy is positioned as a **premium, live-first learning platform**, which differentiates it from the massive, passive video libraries of Almentor and Edraak. However, to compete for enterprise budget and user retention, there are significant product gaps in **mobile accessibility (offline learning)**, **gamification/engagement**, and **standardized B2B reporting**. While the "Live" model creates high perceived value, Next Academy lacks the "Platform Utility" (apps, tracking, verified sharing) that established players use to lock in users.

---

## Feature Comparison Matrix

| Feature | Next Academy | Almentor | Edraak | LinkedIn Learning | Udemy Business |
|---------|-------------|---------|--------|------------------|----------------|
| **Mobile App** | ⚠️ (PWA only) | ✅ Native | ✅ Native | ✅ Native | ✅ Native |
| **Offline Mode** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Live sessions** | ✅ (Primary) | ❌ (Rare) | ⚠️ (Scheduled) | ❌ | ❌ |
| **Self-paced** | ✅ | ✅ (Deep) | ✅ | ✅ (Massive) | ✅ (Massive) |
| **1:1 Coaching** | ✅ | ⚠️ (Pre-recorded) | ❌ | ❌ | ❌ |
| **Verification** | ⚠️ (Manual) | ✅ | ✅ (QR Code) | ✅ (Direct) | ✅ |
| **Gamification** | ❌ | ✅ (Badges) | ❌ | ⚠️ (Streaks) | ✅ (Points) |
| **B2B Dashboard** | ✅ (Basic) | ✅ (Advanced) | ❌ | ✅ (Enterprise) | ✅ (Enterprise) |
| **Arabic Content** | ✅ (Internal) | ✅ (Expert) | ✅ (MOOC) | ⚠️ (Limited) | ⚠️ (Limited) |

---

## Key Gaps (Next Academy vs. Best-in-Class)

### 1. The "Mobile App Gap" 📱
Every major competitor (Almentor, Edraak, Udemy) offers a native mobile app with **offline video downloads**. For our target market in Egypt and MENA, where data costs are high and bandwidth is unstable, the lack of an offline mode is a significant barrier to daily active usage. Relying on a PWA creates a second-class experience compared to Almentor’s polished interface.

### 2. Verified Certification Ecosystem 🎓
Competitors like Edraak and Coursera provide certificates with a **public verification URL or QR code**. Next Academy generates certificates, but based on Agent Aya's report, there is no self-service download or public verification page. This makes the certificate less valuable for a student's LinkedIn profile or for an employer to trust.

### 3. Gamification & Stickiness 🎮
Next Academy lacks the "habit-forming" elements found elsewhere. Almentor uses badges and learning paths to guide users. Without streaks, points, or a public profile, we rely solely on the student's intrinsic motivation to show up for live classes.

---

## Next Academy Advantages ✅

- **The "Human" Touch**: By focusing on live sessions and 1:1 consultations, Next Academy creates a much deeper relationship with the learner than Almentor’s "Netflix for courses" model.
- **Instructors as Stars**: Unlike Edraak which is academic, Next Academy leverages local industry experts (The Ahmed's and Tarek's of the world) who have real market trust.
- **Bilingual Hybridity**: Next Academy's ability to seamlessly offer Arabic instruction with English terminologies maps better to "Business English" in Cairo than the purely Arabic translations on international platforms.

---

## Recommendations

| Gap | Recommended Action | Priority |
|-----|--------------------|---------|
| **Mobile Access** | Develop a React Native wrapper with local video storage for offline viewing. | **High** |
| **Verification** | Add a public `nextacademy.com/verify/[id]` page for all certificates. | **High** |
| **Reporting** | Upgrade the B2B dashboard to include "Skill Progress" visuals comparable to LinkedIn Learning. | **Medium** |
| **Engagement** | Implement simple "Learning Streaks" or "Community Leaderboards" in the student dashboard. | **Medium** |

---

## Sources
- [almentor.net/business](https://almentor.net/business)
- [edraak.org/ar/how-it-works](https://www.edraak.org/)
- [rwaq.org](https://www.rwaq.org/)
- [App Store: Almentor Learning](https://apps.apple.com/us/app/almentor-learning/id1324706316)
- [Coursera for Business: Product Demo](https://www.coursera.org/business)
