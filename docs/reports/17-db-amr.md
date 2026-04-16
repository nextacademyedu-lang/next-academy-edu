# Database & Performance Audit Report: Next Academy

**Auditor:** Amr (Database & Performance Engineer)
**Status:** Complete
**Date:** 2026-04-16

## Executive Summary

The database audit of the Next Academy platform reveals a robust foundation using **Payload CMS 3** and **Neon PostgreSQL**. However, significant performance and reliability risks were identified concerning connection management in serverless environments, synchronous hook execution patterns (N+1 query storms), and gaps in transactional atomicity for complex business flows. 

Implementing the recommendations for connection pooling, background side-effect processing, and Redis caching is essential to ensure platform stability during peak enrollment seasons.

---

## 1. Connection Architecture & Reliability

### ⚠️ Connection Exhaustion Risk (Neon + Vercel)
Next Academy utilizes **Neon PostgreSQL (Serverless)**, which has a default limit of **100 concurrent connections** on its managed tier. 

*   **Finding:** The `payload.config.ts` currently initializes the adapter without an explicit `max` pool size. 
*   **Risk:** In a Vercel/Serverless deployment combined with high-latency hooks, concurrent traffic spikes will cause the connection limit to be hit almost immediately, leading to `Internal Server Error` (500) for all users.
*   **Recommendation:**
    *   Set `pool: { max: 10 }` in `payload.config.ts` to cap connections per serverless function instance.
    *   Transition to Neon's **Connection Pooler URL** (ending in `-pooler.postgres.neon.tech`) for production.

### ⚠️ Schema Drift Enforcement
*   **Finding:** `push: true` is enabled in `payload.config.ts`.
*   **Risk:** Direct schema pushing in production can lead to unexpected locks or data loss if multiple instances attempt to push schema changes during a rolling deployment.
*   **Recommendation:** Use `push: false` for production and rely solely on `prodMigrations: migrations` for stable, repeatable schema evolution.

---

## 2. Query Performance & "Hook Storms"

### 🔴 N+1 Query Cascades in Bookings
The `Bookings` collection features complex `afterChange` and `beforeChange` hooks that trigger multi-level lookups and external API calls.

*   **Case Study: Booking Confirmation:**
    1.  `findByID(user)` (Depth 0)
    2.  `find(sessions)` for user's round.
    3.  `Google Calendar` API calls (external).
    4.  `find(user-profiles)` for B2B company checks.
    5.  `findByID(users)` again for name lookup.
    6.  `CRM Sync` event queuing.
*   **Performance Impact:** A simple status update now costs ~5+ database hits and multiple external API roundtrips.
*   **Recommendation:**
    *   **Pre-load data:** Use a single lookup with appropriate `depth` or custom SQL to fetch all needed state in one go.
    *   **Offload Side-Effects:** Move Google Calendar and B2B notification logic to the `crm-sync-events` queue or a dedicated background worker to keep the user-facing request fast.

### 🔴 Cleanup on Delete
*   **Finding:** `Users.beforeDelete` and `Bookings.beforeDelete` execute dozens of `req.payload.delete` calls in a sequential loop.
*   **Risk:** Deleting a long-time user or an active booking can take seconds, potentially timing out or holding a database connection unnecessarily long.
*   **Recommendation:** Batch these operations using a single raw SQL query (e.g., `DELETE FROM bookings WHERE user_id = $1`) through the `atomic-db` helper pattern where possible.

---

## 3. Transactional & Data Integrity

### ⚠️ Sequential Write Gaps
*   **Finding:** `src/lib/payment-helper.ts` (e.g., `processSuccessfulPayment`) performs sequential writes to `payments` and `bookings` markers without an explicit `db.transaction`.
*   **Risk:** If the server crashes between updating `paidAmount` and marking the booking as `confirmed`, the system will enter an inconsistent state (payment processed but class seats not reserved).
*   **Status:** The use of `atomicIncrement` in `src/lib/atomic-db.ts` correctly prevents individual field race conditions (TOCTOU), but **logical atomicity** (multi-collection changes) is still missing.
*   **Recommendation:** Implement Payload/Drizzle transactions for the entire payment confirmation flow.

---

## 4. Indexing & Storage Optimization

### 🔍 Missing Sync Indexes
*   **Finding:** Heavy lookups are performed on `twentyCrmContactId` and `twentyCrmDealId` during the background sync process.
*   **Risk:** As the database grows to thousands of users, these un-indexed string lookups will become full-table scans.
*   **Recommendation:** Ensure unique indexes exist on all external reference ID columns.

---

## 5. Caching Roadmap (Redis)

### 🚀 Underutilized Redis Power
*   **Current State:** Redis is only used for rate-limiting.
*   **Immediate Gains:**
    *   **Programs & Rounds:** These change infrequently but are queried on every visitor landing page. Cache these with a 5-10 minute TTL.
    *   **Instructor Profiles:** Critical for public-facing trust, can be cached to reduce DB load on search/browsing.
    *   **Session State:** Use Redis for storing temporary checkout state rather than committing "pending" bookings directly to Postgres for every abandoned cart.

---

## Action Plan (Prioritized)

| Priority | Task | Target |
| :--- | :--- | :--- |
| **P0** | Limit DB Pool & Switch to Neon Pooler | Reliability |
| **P0** | Wrap Payment Confirmation in Transactions | Integrity |
| **P1** | Add Indexes to CRM ID fields | Performance |
| **P1** | Offload Google Calendar side-effects to Queue | Performance |
| **P2** | Implement Redis caching for Program listings | Scalability |

---
