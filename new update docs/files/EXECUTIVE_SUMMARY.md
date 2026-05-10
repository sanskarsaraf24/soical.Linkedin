# Premium Graphics Generation: Executive Summary

## The Problem

Your graphics are poor quality **not because Haiku is weak**, but because:

1. **Vague design direction** – "Magazine style" and "split-screen" mean nothing to Claude
2. **Rigid templates** – Same card layout repeats for every post
3. **No visual variation** – No system to rotate between different designs
4. **Weak prompt** – Generic "create an 1080x1080 HTML" without design context
5. **Text-heavy brand guides** – Beautiful descriptions but not actionable CSS/layout specs

## The Solution

Four concrete changes:

### 1. **Rewrite Brand Image Style Guides** (Highest Impact)
**Before:**
```
"clean, premium editorial. Minimal with strong typographic hierarchy."
```

**After:**
```
## 4 Layout Archetypes (rotate through these)

ARCHETYPE A: Bold Left Headline + Right Visual
- Left: Headline (70%) + supporting text
- Right: Accent bar + metadata (30%)
- Grid structure with 40px gap
- No rounded corners, thin borders only

ARCHETYPE B: Magazine Spread
- Centered kicker (top)
- Large headline (60% card width)
- Geometric accent (bottom-right)
...
[etc. for C and D]
```

**Result:** Claude now knows exactly what to build. No ambiguity.

---

### 2. **Upgrade Graphics Generation Prompt**
**Before:**
```
"Create a premium LinkedIn square graphic... based on the brand guide."
```

**After:**
```
You are a premium brand designer. Use ARCHETYPE A from the brand guide.
Requirements:
- HTML canvas: 1080×1080px
- Typography: All text ≥32px
- Colors: Use ONLY brand palette
- Layout: Grid-based, no free-floating elements
- Anti-patterns: No gradients, no rounded corners, no decorative shapes

Reference CSS:
[example grid code]
[example color usage]
```

**Result:** Claude has concrete specs, not design theory.

---

### 3. **Implement Layout Rotation**
**Before:**
```
All posts use the same card template.
```

**After:**
```
Post 1: Archetype A (Bold Left Headline)
Post 2: Archetype B (Magazine Spread)
Post 3: Archetype C (Quote/Statement)
Post 4: Archetype D (Data Focus)
Post 5: Archetype A (repeat)
```

**Implementation:** 3 lines of code:
```javascript
const accountPostCount = workspace.posts.filter(p => p.accountId === account.id).length;
const archetypeLetters = ['A', 'B', 'C', 'D'];
const layoutArchetype = archetypeLetters[accountPostCount % 4];
```

**Result:** Every post looks fresh and different, still on-brand.

---

### 4. **Optional: Upgrade to Sonnet** (Low Effort, High Reward)
Change env var or code:
```javascript
const anthropicModel = 'claude-sonnet-4-20250514'; // Instead of haiku
```

**Cost:** ~2x per request
**Benefit:** Sonnet is significantly better at visual reasoning and design understanding

---

## What Changes (File-by-File)

| File | Change | Time |
|------|--------|------|
| `src/lib/storage.ts` | Replace brand `imageStyle` strings | 2 min |
| `server.js` → `buildGraphicPrompt()` | New function with archetype specs | 3 min |
| `server.js` → `createScheduledPostForTomorrow()` | Add 3 lines for layout rotation | 2 min |
| `.env` or `server.js` | Upgrade model (optional) | 1 min |

**Total time: 10 minutes**

---

## Expected Results

### Before
- Graphics look templated
- Text sometimes <32px (unreadable)
- Colors don't match brand palette
- Same layout every post
- Feels generic, not premium

### After
- 4 distinct layout archetypes
- All text ≥32px (readable)
- Colors match palette exactly
- Visual variety every post
- Professional, intentional, premium feel

---

## Testing Checklist

After implementation, verify:

1. **Generate 5 posts** for same account
   - [ ] Layouts visually differ (A, B, C, D, A)
   - [ ] No two consecutive posts look identical

2. **Check typography**
   - [ ] Smallest text is ≥32px
   - [ ] Headlines use correct fonts (Manrope/Montserrat/Playfair)

3. **Verify colors**
   - [ ] Extract hex from rendered graphics
   - [ ] All colors match brand palette exactly

4. **Rate professionally**
   - [ ] Show 3 graphics to peers
   - [ ] Ask: "On 1–10, how premium does this feel?"
   - [ ] Target: 8+ rating

---

## Files in This Package

1. **GRAPHICS_FIX_GUIDE.md** – Detailed analysis + solution overview
2. **IMPLEMENTATION_CHECKLIST.md** – Step-by-step instructions + troubleshooting
3. **new_buildGraphicPrompt.js** – Updated prompt function
4. **new_brandProfiles.js** – New image style guides with archetypes
5. **server_changes.js** – Code snippets for all server.js modifications
6. **archetype_css_reference.js** – CSS patterns for each archetype (reference)
7. **This file** – Executive summary

---

## Quick Start (TL;DR)

1. Copy new image style guides into `src/lib/storage.ts`
2. Replace `buildGraphicPrompt()` in `server.js`
3. Add 3 lines for layout archetype rotation
4. Rebuild and test
5. Done ✓

---

## Why This Works

The fundamental issue is **instruction clarity**, not model capability:

- **Haiku vs Sonnet:** Design understanding differs, but prompt design matters more
- **Vague prompts:** Claude tries to guess what you want; it fails
- **Concrete specs:** Claude knows exactly what to build; it succeeds
- **Visual variation:** Archetypes prevent repetition; every post feels fresh
- **Grid-based layout:** Removes ambiguity; Claude knows to align elements

This approach leverages **what Claude is good at**:
- Following explicit instructions ✓
- Building clean HTML/CSS ✓
- Varying output within constraints ✓
- Reasoning about grid-based design ✓

---

## Support

### If graphics still underperform:
1. Check `layoutArchetype` is being passed through all layers
2. Verify brand `imageStyle` text is complete in the prompt
3. Try Sonnet instead of Haiku
4. Manually refine a failed graphic's prompt and test

### If you want to go further:
1. Create visual brand kit docs (Figma/XD) with archetype examples
2. Version the prompt for A/B testing
3. Log which archetypes get best engagement; adjust rotation weights
4. Build a feedback loop: results → prompt refinement → better graphics

---

## Next Steps

1. Read **IMPLEMENTATION_CHECKLIST.md**
2. Copy code snippets into your files
3. Test with 5 posts per account
4. Rate quality (target: 8/10)
5. Ship it ✓

---

Good luck! These changes should take you from "why do these look so generic?" to "these look professional and premium."
