# Wireframe: Booking Details (`/dashboard/bookings/:id`)

## Split Content

### Left (Sessions & Content)

- **Sessions Accordion:** Expandable list of all sessions in this round.
  - Each row shows: Session Title, Date, Time, Status.
  - **If Future (Upcoming):** Shows `Join Zoom` / `Join Google Meet` button (active 15 min before start).
  - **If Past (Completed & Recording Available):**
    - Shows `▶ Watch Recording` button.
    - **Clicking it opens an Embedded Secure Player** (NOT a download link).
    - The video streams via Signed URL (expires after 2 hours).
    - A **dynamic watermark** overlays the video showing: User's Full Name + Email + Current Date.
    - No download button, no right-click save.
  - **If Past (No Recording Yet):** Shows "Recording not yet available" gray text.
- **Materials:** List of downloadable files (PDFs, slides) uploaded by Admin/Instructor per session.

### Right (Meta Box)

- Total Price Paid vs Outstanding.
- Instructor Info (Photo + Name + Link to profile).
- Link to Payment History.
