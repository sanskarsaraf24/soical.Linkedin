# Quick Fix Reference Card

## Problem
Graphics got WORSE after implementation. Cluttered, tiny text, too many colors.

## Root Cause
Prompt was too permissive. Claude over-designed to vary layouts.

## Solution
**Replace** `buildGraphicPrompt()` with `buildGraphicPrompt_CORRECTED.js`

---

## What Changed in Corrected Prompt

| Aspect | Old | New |
|--------|-----|-----|
| Typography | Guidelines | **Explicit minimums** (32px all text) |
| Colors | Suggestions | **Hard limits** (2–3 max) |
| Elements | Guidelines | **Maximum 1 accent** |
| Anti-patterns | General advice | **Strict checklist** |
| Pre-submit | None | **Verification checklist** |

---

## Implementation (5 minutes)

1. Open `server.js`
2. Find `function buildGraphicPrompt()`
3. Replace with code from `buildGraphicPrompt_CORRECTED.js`
4. Save
5. Rebuild: `npm run build`
6. Restart: `npm run start`

---

## Test (3 posts per account)

Generate 3 graphics. For each, check:

- [ ] All text ≥32px (DevTools: measure font-size)
- [ ] Only 2–3 colors (count unique hex values)
- [ ] Clear typography hierarchy
- [ ] Readable, professional
- [ ] Grid-aligned (no floating elements)

---

## Expected Improvement

| Before Fix Attempt | After Corrected Fix |
|------------------|-------------------|
| Tiny text | 32px+ readable |
| 5+ colors | 2–3 disciplined |
| Clutter | Clean, minimal |
| Chaotic | Professional |

---

## If Still Not Good

1. Switch to Sonnet: `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
2. Add HTML example to prompt showing ideal output
3. Simplify: Use 2 archetypes instead of 4

---

## Files You Need

- `buildGraphicPrompt_CORRECTED.js` ← **Use this**
- `DIAGNOSIS_WHY_WORSE_AND_FIX.md` ← Read this first

---

## Key Takeaway

**Explicit constraints beat abstract principles.**

"Be minimal" → Claude adds clutter
"Use exactly 2–3 colors" → Claude uses 2–3 colors

The corrected prompt is intentionally strict. That's a feature, not a bug.

---

## Done

Copy, replace, test, ship. 10 minutes total.