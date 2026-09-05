# UI/UX Guide

## Design Principles

Clorisa should feel premium, clean, fashionable, private, and easy to use. The interface is mobile-first, image-forward, and calm enough for daily use.

## Visual System

- Color: neutral base, high-contrast text, fashion accent colors, clear semantic states.
- Typography: readable system fonts; strong hierarchy without oversized dashboard text.
- Spacing: consistent 4/8 point scale.
- Radius: soft but restrained cards and controls.
- Imagery: high-quality wardrobe grids with stable aspect ratios.

## Mobile Screens

Splash, onboarding, register, login, forgot password, home dashboard, wardrobe grid/list, add item, edit item, item detail, categories, tags, search/filter, outfit builder, outfit detail, outfit calendar, AI recommendation, shopping assistant, analytics, profile, settings, privacy settings.

## Web Admin Screens

Admin login, dashboard, users, wardrobe analytics, category management, tag management, AI monitoring, storage monitoring, reports, settings.

## Component Behavior

- Buttons must execute a real action.
- Destructive actions require confirmation.
- Forms validate inline before submit and show API errors after submit.
- Image upload shows progress, failure, retry, and deletion states.
- AI suggestions show confidence and editable fields.
- Feature-flagged unreleased features are hidden from production navigation.

## States

Every screen must define:

- Loading state.
- Empty state connected to real data.
- Error state with retry.
- Success state.
- Validation state.
- Offline or slow-network handling where relevant.

## Accessibility

- Minimum WCAG AA contrast.
- Screen-reader labels for controls.
- Keyboard navigation for web admin.
- Touch targets at least 44px on mobile.
- Clear focus states.
- Error messages tied to form fields.

## Responsive Rules

Mobile uses bottom navigation and full-screen flows. Tablet can use two-column wardrobe/detail layouts. Web admin prioritizes dense, scannable operational layouts with tables, filters, and side navigation.
