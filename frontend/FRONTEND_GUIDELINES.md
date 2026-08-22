# 📜 Frontend Coding Guidelines (Next.js)

Next.js frontend code likhte waqt in rules ko strictly follow karo taaki app scale ho sake, fast rahe, aur over-engineering na ho.

## 📂 Folder Structure & Consistency
Koi bhi developer apne tareeqe se folder ya component nahi banayega. Yeh structure strictly follow hoga:
1. **`app/`**: Isme sirf Pages (`page.tsx`) aur Layouts (`layout.tsx`) rahenge.
2. **`components/ui/`**: Yahan sirf reusable UI components rahenge (jaise Button, Input, Card). Shadcn ke saare components yahan aayenge.
3. **`components/features/`**: App ke bade hisse (complex domain components) yahan rahenge. (e.g., `features/tickets/TicketTable.tsx`).
4. **`lib/`**: Helpers, utility functions, aur constants yahan rakho.
5. **`hooks/`**: Custom React hooks yahan aayenge.
6. **`types/`**: Saare TypeScript ke interfaces aur types yahan globally define honge.

## 🏗️ Core Architecture & UI Rules
7. **Clean Code:** Code clean, simple, readable aur maintainable rakho.
8. **Server Components First:** App Router aur Server Components ko default rakho; `"use client"` sirf interactivity ke liye use karo.
9. **Component Size:** Agar component unnecessarily large ho raha hai ya multiple responsibilities handle kar raha hai, use logical sub-components mein split karo. Lekin unnecessary micro-components mat banao.
10. **Strict Reusability:** Har jagah Button, Search bar ya Form ka code dobara mat likho. Hamesha Shadcn ya custom shared UI components bana kar unhe reuse karo.
11. **Minimal State:** Jo value props ya existing state se derive ho sakti hai, uske liye separate state mat banao. State ko minimum rakho.
12. **Theming & Colors:** Colors ko kabhi hardcode mat karo. Hamesha Tailwind ke Global CSS variables use karo.
13. **Business Rules vs UI Logic (Important):** Core business rules, security checks, permissions aur authoritative calculations Backend (NestJS) mein honge. Frontend mein sirf UI logic (jaise modal open/close, sorting, form state, date formatting) allowed hai. Frontend validation sirf UX ke liye hogi, backend validation ko replace nahi karegi.
14. **Naming Convention:** Components ko `PascalCase`, hooks ko `useSomething`, functions/variables ko `camelCase` mein likho.
15. **Constants:** Repeated strings, numbers aur configuration values ko hardcode mat karo. Unhe `lib/constants.ts` me rakho.

## 🔗 API, State & Security
16. **API Layer Separation:** Components mein direct `fetch`/`axios` calls mat karo. API calls ko dedicated `services/` ya `lib/api/` layer mein rakho.
17. **State Management (Redux & API State):** Har global state ko Redux mein rakhna zaroori nahi hai. Server/API data fetch aur cache karne ke liye **TanStack Query** (ya SWR) use karein. **Redux Toolkit** ko genuinely global client state (jaise theme, UI state) ke liye hi reserve rakhein.
18. **Form Validation (Zod):** Form input validation aur API response checking ke liye hamesha **Zod** schema use hoga.
19. **API Response Safety:** API se aane wale data ko blindly trust mat karo. Zod schema se response validate/parse karo aur unexpected data ko gracefully handle karo.
20. **Token Storage:** JWT Token hamesha secure **HTTP-only Cookies** mein store hoga jisko Next.js Server Actions ya API routes handle karenge.
21. **Environment Configuration:** API URLs ya feature flags ko hardcode mat karo. Environment variables (`.env`) use karo.
22. **Security (XSS):** Untrusted HTML ko directly render mat karo. Client-side code mein private secrets expose mat karo.

## ⚡ Speed & Performance
23. **No Premature Optimization:** Performance optimization sirf actual bottleneck hone par karo. `useMemo`, `useCallback`, dynamic import, virtualization etc. ko bina reason ke use mat karo.
24. **Streaming & Suspense:** Jahan beneficial ho, slow/independent data sections ko `<Suspense>` ke through stream karo. Har component ko unnecessarily `<Suspense>` mein wrap mat karo.
25. **Debounce API Calls:** Search bars mein type karte waqt har keystroke par API call mat karo, `debounce` use karo.
26. **Prefetching Control:** Next.js `<Link>` mein zaroorat na hone par `prefetch={false}` lagao.
27. **Bundle Size:** Heavy npm packages install karne se pehle lightweight alternative ya native solution zaroor check karo. Unnecessary dependencies avoid karo.
28. **Image & Font Optimization:** Images ke liye `next/image` aur local/optimized fonts ke liye `next/font` prefer karo.

## 🛠️ Code Quality, Error Handling & UX
29. **No Unnecessary useEffect:** `useEffect` ka use sirf external systems/browser APIs ke saath synchronization ke liye karo. Derived state ya simple calculations ke liye `useEffect` mat use karo.
30. **Error & Loading States:** Har API-driven UI ke liye loading, error aur empty states properly handle karo. Blank screen ya unhandled error allow nahi hai.
31. **React Keys:** Lists mein index ko `key` ke roop mein use mat karo jab stable unique ID available ho.
32. **No Console Logs:** Production code mein unnecessary `console.log`, debug code aur commented-out old code nahi hona chahiye.
33. **Strict Typing:** TypeScript use karo; `any` keyword bilkul allow nahi hai.
34. **Accessibility (a11y):** Semantic HTML, keyboard navigation, proper labels, aur focus states follow karo. `<div>` ko unnecessarily clickable element mat banao.
35. **Accessibility & SEO:** Public pages mein proper metadata, heading hierarchy, alt text aur accessible forms maintain karo.

## 🚫 No Business Logic on Frontend (STRICT RULE)
36. **Frontend Sirf UI Hai — Kuch Nahi:** Frontend ka ek hi kaam hai — data dikhana aur user ke actions ko backend tak pohunchana. Frontend ek **dumb display layer** hai. Yeh rule sabse important hai aur isko kabhi break nahi kiya jayega.

37. **Business Logic Backend Ka Kaam Hai:** Koi bhi calculation, decision, permission check, pricing logic, discount calculation, role-based access control (RBAC), data transformation ya business rule **sirf NestJS Backend mein likhni hai**. Frontend mein yeh sab likhna **strictly forbidden** hai.
    - ❌ **Galat:** `if (user.role === 'admin' && asset.price > 10000) { showDiscount() }`
    - ✅ **Sahi:** Backend se `{ showDiscount: true }` receive karo aur sirf condition-free render karo.

38. **Frontend Validation ≠ Business Validation:** Frontend par Zod/form validation sirf **UX ke liye** hai (e.g., "email field empty hai"). Yeh kabhi backend business validation ki jagah nahi legi. Actual rules hamesha backend enforce karega.

39. **No Data Calculation on Frontend:** Totals, averages, summaries, asset valuations — koi bhi number crunch karna backend ka kaam hai. Frontend sirf backend ka diya hua number display karega.

40. **No Permission Logic on Frontend:** `user.permissions.includes('can_delete')` jaisa check frontend mein **UI hide/show ke liye** kar sakte ho, lekin actual enforcement backend karega. Frontend ka permission check sirf cosmetic hai — security ke liye kabhi rely mat karo.

---

## 🧱 Component & Code Structure
41. **Component Props Typing:** Har component ke liye explicit `interface` ya `type` likho. Inline anonymous types ya `any` props bilkul allow nahi.

42. **No Magic Numbers/Strings:** Code mein seedha `7`, `"admin"`, `"dashboard"` likhna band karo. Sab kuch named constants (`lib/constants.ts`) mein rakho.

43. **Custom Hook for Complex Logic:** Agar component mein zyada logic aa rahi hai, use custom hook mein extract karo (e.g., `useTicketFilters`, `useAssetForm`).

44. **Avoid Prop Drilling (3+ levels):** Agar prop 3 ya zyada levels tak pass ho rahi hai, to Context ya Redux use karo.

45. **File Size Limit:** Ek file 300 lines se badi nahi honi chahiye. Badi files ko logical sub-files mein split karo.

---

## 🔄 UX & Reliability
46. **Optimistic UI Updates:** TanStack Query ke saath `onMutate` callback use karke optimistic updates implement karo — better UX ke liye jahan suitable ho.

47. **Error Boundaries:** Feature-level components ko `<ErrorBoundary>` mein wrap karo taaki ek component crash hone par poora page na tute.

48. **Date/Time Handling:** Date manipulation ke liye seedha `new Date()` mat use karo. `date-fns` ya similar lightweight library use karo.

---

## ✅ Developer Checklist (PR se Pehle)
49. **Consistent Export Style:** Component files mein `default export`; utility/helper files mein `named exports` use karo.

50. **PR Checklist:** Code push karne se pehle mentally check karo:
    - [ ] Koi `console.log` nahi
    - [ ] Koi `any` type nahi
    - [ ] Loading, Error, Empty states handle hain
    - [ ] Koi business logic frontend mein nahi likhi
    - [ ] Constants file mein hain, hardcoded nahi
    - [ ] Props properly typed hain
