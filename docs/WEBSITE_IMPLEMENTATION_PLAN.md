# Website Implementation Plan

## 1. Current Repo Structure

- `apps/mobile`: Flutter app.
- `apps/web-admin`: Next.js web app.
- `services/api`: NestJS API.
- `services/ai`: FastAPI AI service.
- `packages/shared-types`: shared contracts.
- `packages/config`: shared config.
- `docs`: product and engineering documentation.

## 2. Current Web App Structure

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `tailwind.config.ts`
- `postcss.config.js`
- `next.config.ts`

## 3. Existing Dependencies

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Zod

## 4. Missing Dependencies

- shadcn-style utility dependencies.
- Icon library for premium line icons.
- Form resolver dependencies for later auth/dashboard forms.

## 5. Whether shadcn/ui Will Be Installed

Run 1 configures shadcn-compatible local primitives manually and adds `components.json`. This avoids generator churn while preserving the expected file structure and utility conventions.

## 6. Pages to Build First

- `/`
- `/features`
- `/how-it-works`
- `/pricing`
- `/ai-stylist`
- `/smart-shopping`
- `/privacy`
- `/terms`
- `/contact`
- `/login`
- `/signup`
- `/forgot-password`

## 7. Components to Build

- Marketing navbar and footer.
- Container and section wrappers.
- Buttons, cards, badges, inputs, textarea.
- Marketing feature, step, benefit, and visual preview cards.
- Shared skeleton, empty state, error state, and toast primitives.

## 8. Service-Layer Files to Create

- `lib/api/client.ts`
- `lib/api/auth.ts`
- `lib/api/profile.ts`
- `lib/api/wardrobe.ts`
- `lib/api/categories.ts`
- `lib/api/tags.ts`
- `lib/api/outfits.ts`
- `lib/api/calendar.ts`
- `lib/api/aiStylist.ts`
- `lib/api/shoppingAssistant.ts`
- `lib/api/analytics.ts`
- `lib/api/billing.ts`
- `lib/api/admin.ts`

## 9. Mock Adapters Needed

- Public marketing content.
- Auth placeholder responses until Run 2.
- Future feature placeholders for endpoints that do not exist yet.

## 10. Real Backend Endpoints Available

- `GET /api/v1/health`
- AI `GET /health`

## 11. Responsive Checklist

- Mobile-first layout.
- No horizontal overflow at small widths.
- Navbar collapses to a menu.
- Cards use stable aspect ratios.
- Text wraps cleanly inside buttons and cards.

## 12. Accessibility Checklist

- Semantic landmarks.
- Labels for form fields.
- Keyboard focus states.
- Sufficient contrast.
- Descriptive link and button text.

## 13. Testing Checklist

- `npm --workspace apps/web-admin run lint`
- `npm --workspace apps/web-admin exec tsc -- --noEmit`
- `npm --workspace apps/web-admin run build`
