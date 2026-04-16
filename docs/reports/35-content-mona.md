# Mona — Content & CMS Manager Audit Report

**Team:** Next Academy Internal 🏫  
**Date:** April 16, 2026  
**Scope:** Payload CMS admin usability, content workflows, media management, content team productivity

## My Content Workflow Assessment

Opening the admin panel for the first time was both impressive and intimidating. On one hand, I love that almost everything is here—from instructor profiles to the popup that bugs me every morning. On the other hand, actually *creating* a program feels like I’m filling out a tax return.

The **Program** collection is my biggest headache. There are about 30 fields in a single, never-ending list. I have to scroll through English descriptions, then Arabic descriptions, then SEO keywords just to check if the thumbnail is correct. It’s a literal "wall of fields."

The automation for **Rounds** is clever—I like that it creates draft rounds for me based on a number—but I feel disconnected from the actual round details. I have to jump between two different collections (Programs and Rounds) to finish a single "Course Launch" task.

---

## CMS Usability Scorecard

| Task | Ease of Use | Pain Points |
|------|-----------|-------------|
| Publish a blog post | ⭐⭐⭐⭐ | Simple enough, though I'd love a better preview of how it looks on mobile. |
| Create a new program | ⭐⭐ | **Too many fields.** No tabs to separate "Description" from "Pricing" or "SEO". |
| Schedule an event | ⭐⭐⭐ | Standard form, but lacks specific fields for "Virtual Link" vs "Physical Address" distinction at a glance. |
| Upload and manage media | ⭐⭐ | It's just a big bucket of images. **No folders.** Finding that one logo from 3 months ago is impossible. |
| Configure a popup | ⭐⭐⭐ | Functional, but I'd like to see *where* it will show up without asking a developer. |
| Manage instructors | ⭐⭐⭐⭐ | Very straightforward. Profiles are easy to update. |
| Find specific content in admin | ⭐⭐⭐ | Sidebar is grouped well, but the list of collections is still quite long. |

---

## Critical Issues 🔴

- **Giant Program/Course Forms**: `Programs.ts` is a flat list of 30+ fields. This is overwhelming for non-technical staff. It needs **Tabs** (e.g., "General", "Educational Details", "SEO", "Settings").
- **Missing Content Previews**: There is no "Live Preview" configuration visible in the schemas. I have to "Save" and then go to the website to see if the formatting broke.
- **Media Library Chaos**: No categorization or folder support in the `media` collection. As we grow, this will become a graveyard of unnamed files.

## Major Issues 🟠

- **Mixed Language Fields**: English and Arabic fields are side-by-side in the same view. This creates cognitive load. They should be grouped by language or put into tabs.
- **Lack of Field Guidance**: Most fields (like `featuredPriority` or `targetAudience`) have no `admin.description`. I’m guessing what some of these do.
- **Disconnected Workflows**: Creating a program requires jumping to the `Rounds` collection to edit specific dates. This should be more integrated.

## Minor Issues / Improvements 🟡

- **Sidebar Clutter**: Even with groups, having 40+ collections is a lot. Some technical collections (like `CrmSyncEvents` or `VerificationCodes`) should probably be hidden from non-admin roles.
- **Thumbnail Previews**: The default columns for most collections don't include the image thumbnail, making it hard to identify entries visually.

---

## What's Working Well ✅

- **Logical Grouping**: The sidebar groups (Admin, Content, Sales, Academic) are well-thought-out and help me find the general area I need.
- **Drafts System**: The `versions: { drafts: true }` on BlogPosts is a lifesaver. I can work on my articles without fearing they'll go live halfway through.
- **Automatic Round Generation**: The `afterChange` hook in Programs that creates rounds is a great idea—it saves me from creating 5 identical entries manually.

---

## Recommendations

| Priority | Action | Who Fixes It | Effort |
|----------|--------|-------------|--------|
| **High** | Implement **Tabs** in `Programs.ts` and `Events.ts`. | Frontend/CMS Dev | Low |
| **High** | Configure **Live Preview** for Blog and Programs. | Frontend Dev | Medium |
| **Medium** | Add `admin.description` to all student-facing fields. | Content Lead (Mona) | Low |
| **Medium** | Filter sidebar based on User Role (hide technical collections). | CMS Dev | Medium |
| **Low** | Implement a "Media Folders" plugin or categorization. | CMS Dev | Medium |

## Appendix
- Analyzed `src/collections/*.ts`
- Evaluated `payload.config.ts` for admin organization.
