# Wireframe: Onboarding Step 1 (`/onboarding/step-1`)

## Layout

- Minimal header (Logo only, no nav).
- Progress indicator: "Step 1 of 3: Professional Info".
- Centered Card.

## Form

- Title Dropdown (Mr, Mrs, Eng, Dr)
- Job Title
- Work Field Dropdown
- **Company Name (Autocomplete Search):**
  - _Behavior:_ User starts typing. System searches existing `Companies` collection via API.
  - _If Found:_ Shows dropdown list (e.g., "PayPal", "Vodafone"). User clicks to link their account to this company's ID.
  - _If Not Found:_ Displays "Add '[Typed Name]' as a new company". Creates a new Company doc upon selection.
- Company Size Dropdown
- Company Type Dropdown
- CTA: `Next Step`
