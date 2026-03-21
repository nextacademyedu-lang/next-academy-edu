# Fix Missing Navbar CSS Styles

The `navbar.tsx` references 11 CSS module class names that **do not exist** in `navbar.module.css`. This causes the desktop dropdown and entire mobile menu to render as unstyled bare HTML.

## Proposed Changes

### Navbar CSS Module

#### [MODIFY] [navbar.module.css](file:///d:/projects/nextacademy/src/components/layout/navbar.module.css)

Add the following missing styles (all referenced in `navbar.tsx` but currently undefined):

**Desktop dropdown** (courses hover menu):
- `.dropdownContainer` — relative positioning wrapper for the dropdown trigger
- `.dropdownMenu` — absolute-positioned panel with `var(--bg-surface)`, border, shadow, z-index
- `.dropdownItem` — links inside the dropdown with hover highlight

**Mobile overlay & menu** (hamburger menu):
- `.mobileOverlay` — full-screen fixed backdrop with semi-transparent background
- `.mobileMenu` — slide-in panel with `var(--bg-surface)` background, padding, and overflow scroll

**Mobile accordion/sub-menus** (courses expandable section):
- `.mobileAccordion` — wrapper for the collapsible courses section
- `.mobileSubMenu` — indented list of course category links
- `.mobileSubLink` — individual links inside the mobile sub-menu

**Mobile utility styles**:
- `.mobileDivider` — horizontal line separating nav links from toggles
- `.mobileToggles` — flex row for theme toggle + language button
- `.mobileActions` — flex column for login/register buttons at bottom of mobile menu

All styles will use existing CSS custom properties from `globals.css` (`--bg-surface`, `--border-subtle`, `--text-primary`, etc.) to ensure dark/light theme compatibility.

## Verification Plan

### Browser Verification
1. Run `pnpm dev` in `d:\projects\nextacademy`
2. Open `http://localhost:3000` in the browser
3. **Desktop dropdown**: Hover over the "Courses" nav link — a styled dropdown panel should appear with three category links
4. **Mobile menu**: Resize window below 768px → tap hamburger → full-screen overlay should appear with nav links, accordion for courses, theme/lang toggles, and auth buttons
5. **Theme switching**: Toggle dark/light mode — dropdown and mobile menu should adapt colors via CSS variables
