# Why Graphics Got WORSE - Diagnosis & Fix

## What Happened

You implemented the archetype system, but **the prompt became too permissive**. Claude started over-designing to prove it could vary layouts, resulting in:

- ❌ Tiny text (unreadable)
- ❌ Too many colors
- ❌ Unnecessary shapes everywhere
- ❌ Broken typography hierarchy
- ❌ Cluttered, not premium

**This is worse than the original templates.**

---

## Root Cause

The original `buildGraphicPrompt()` I provided said:

> "No decorative shapes. No drop shadows. No rounded corners."

But it **didn't emphasize enough** that these rules apply STRICTLY. Claude interpreted them as guidelines, not laws.

The prompt was also **too long and unfocused**, giving Claude too much room to interpret.

---

## The Solution: Stricter, Simpler Prompt

### Key Changes in CORRECTED version:

1. **Typography section**
   - EXPLICIT: "MINIMUM font size: 32px for ALL text. No exceptions."
   - EXPLICIT: Specific px ranges (80–92px headlines, 32–40px body)
   - No ambiguity

2. **Colors section**
   - EXPLICIT: "Maximum 2–3 colors on the card"
   - EXPLICIT: "ALL colors from brand palette (no substitutions)"
   - EXPLICIT: "No gradients. No opacity except 8–12%"

3. **Elements section**
   - EXPLICIT: "Maximum 1 decorative element per card"
   - EXPLICIT: "Decorative element must serve layout function"
   - EXPLICIT checklist before output

4. **Anti-Patterns section**
   - Moved to front (immediately after constraints)
   - Made it a checklist, not prose
   - ✗ format makes it impossible to miss

5. **Final Checklist**
   - Forces Claude to verify before submitting
   - Specific, measurable checks
   - Prevents "I think this is good" submission

---

## Implementation (Immediate)

**Replace `buildGraphicPrompt()` in server.js with the corrected version.**

That's it. Everything else stays the same.

File: `buildGraphicPrompt_CORRECTED.js`

---

## Why This Will Work

1. **Explicit constraints** – Claude can't misinterpret
2. **Pre-output checklist** – Forces verification
3. **Shorter prompt** – Less room for interpretation
4. **Typography-first** – Readability is non-negotiable
5. **Color discipline** – Forces restraint
6. **Minimal accents** – Prevents decoration creep

---

## Testing (Before & After)

Generate 3 posts with CORRECTED prompt. Check:

- [ ] All text is ≥32px (use DevTools to measure)
- [ ] Only 2–3 colors per card
- [ ] Clear typography hierarchy
- [ ] Professional, not cluttered
- [ ] Readable even on small screens

If these pass, you're good to go.

---

## Expected Result After Fix

| Metric | Previous Attempt | Corrected |
|--------|------------------|-----------|
| Typography | Broken, too small | Clear, ≥32px |
| Colors | Too many | 2–3 disciplined |
| Layout | Chaotic | Grid-aligned |
| Professional feel | Cluttered | Minimal, premium |

---

## Why This Happened

You took good advice (vary layouts, use archetypes) but the execution became too permissive. The lesson:

**In LLM prompting, explicit constraints > abstract principles.**

"Be creative" often means "add more stuff."
"Use exactly 2–3 colors" means "use exactly 2–3 colors."

---

## One More Thing

If graphics STILL look off after this fix:

1. **Switch to Sonnet**: `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
   - Sonnet is better at respecting hard constraints
   - Worth the 2x cost for design work

2. **Add concrete example**:
   Include a full HTML example in the prompt showing what "good" looks like

3. **Simplify further**:
   If Claude keeps adding elements, reduce archetype complexity
   (Go back to 2 archetypes instead of 4, let it prove it can handle that)

---

## Bottom Line

**Use `buildGraphicPrompt_CORRECTED.js`. Replace function. Test. Ship.**

This version is intentionally strict because permissiveness led to over-design.

You need guardrails, not freedom.
