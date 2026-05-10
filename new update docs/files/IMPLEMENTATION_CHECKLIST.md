# Implementation Checklist

## Quick Start (30 minutes to better graphics)

### Phase 1: Replace Image Style Guides (5 minutes)
- [ ] Open `src/lib/storage.ts`
- [ ] Find the `brandProfiles` array in `createInitialWorkspace()`
- [ ] Replace each `imageStyle` string with the new ones from `new_brandProfiles.js`
- [ ] Save file

### Phase 2: Replace buildGraphicPrompt() (5 minutes)
- [ ] Open `server.js`
- [ ] Find `function buildGraphicPrompt()`
- [ ] Replace entire function with the one from `new_buildGraphicPrompt.js`
- [ ] Save file

### Phase 3: Add Layout Archetype Rotation (10 minutes)
- [ ] Open `server.js`
- [ ] Find `async function createScheduledPostForTomorrow()`
- [ ] Add these 3 lines after the `strategyItem` assignment:
  ```javascript
  const accountPostCount = workspace.posts.filter(p => p.accountId === account.id).length;
  const archetypeLetters = ['A', 'B', 'C', 'D'];
  const layoutArchetype = archetypeLetters[accountPostCount % 4];
  ```
- [ ] Pass `layoutArchetype` to `buildGenerationPrompt()` call
- [ ] Pass `layoutArchetype` to `generateGraphicHtml()` call
- [ ] Find `await generateGraphicHtml()` and add `layoutArchetype` parameter
- [ ] Save file

### Phase 4: Update buildGenerationPrompt() to accept layoutArchetype (3 minutes)
- [ ] In `server.js`, find `function buildGenerationPrompt()`
- [ ] Update signature to include `layoutArchetype = 'A'`
- [ ] Add one line to the returned prompt about archetype rotation
- [ ] Save file

### Phase 5: Optional—Upgrade Model (1 minute)
- [ ] Find line: `const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';`
- [ ] Change to: `const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';`
- [ ] Save file

### Phase 6: Test (5 minutes)
- [ ] Rebuild frontend: `npm run build`
- [ ] Restart server: `npm run start`
- [ ] Generate a post for each account (Sanskar, Minpay, Casemate)
- [ ] Check that graphics differ visually
- [ ] Check that text is readable (32px+)
- [ ] Check that colors match brand palette

---

## Testing Checklist

After making changes, verify:

### Visual Variety
- [ ] Generate 5 posts for the same account
- [ ] Check that layouts differ (A, B, C, D, A)
- [ ] Confirm no two consecutive posts look identical
- [ ] Layouts should clearly implement the archetype structures

### Grid & Alignment
- [ ] All text should align to consistent margins (80–100px)
- [ ] Elements should not overflow canvas (1080x1080)
- [ ] Grid should feel intentional, not random

### Typography
- [ ] All text ≥32px (measure in DevTools)
- [ ] Headlines use correct fonts (Manrope/Montserrat/Playfair)
- [ ] Line heights are consistent within each text element
- [ ] Letter-spacing matches brand specs

### Colors
- [ ] Extract colors from rendered graphics
- [ ] Verify they match brand palette exactly
- [ ] No unexpected gradients or substitutions
- [ ] Accent colors used sparingly and purposefully

### Data Attributes
- [ ] Open preview, open DevTools console
- [ ] Run: `iframe.contentDocument.querySelector('[data-required="headline"]').textContent`
- [ ] Should return the post headline (not undefined)
- [ ] Repeat for "subheadline" and "kicker"

### Professional Feel
- [ ] Compare to Linear.app, Stripe.com, Notion.so social posts
- [ ] Graphics should feel similar level of polish
- [ ] No decorative shapes or playful elements
- [ ] Clean, intentional, grid-based

---

## Troubleshooting

### Problem: Graphics still look generic
**Solution:**
1. Check that `layoutArchetype` is being passed through all layers
2. Verify brand `imageStyle` guide text is in the prompt
3. Increase detail in brand image style descriptions

### Problem: Text is hard to read
**Solution:**
1. Check font sizes in rendered HTML (should be ≥32px)
2. Verify line-height is ≥1.4
3. Check contrast between text and background colors

### Problem: Haiku still generating poorly
**Solution:**
1. Switch to Sonnet: `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
2. Sonnet has better visual reasoning; the cost is worth it for design

### Problem: Colors don't match brand palette
**Solution:**
1. Extract exact hex from `imageStyle` guide
2. Check if Haiku is interpreting color names (e.g., "indigo" → different hex)
3. If so, replace named colors with exact hex in prompt

### Problem: Layouts aren't rotating
**Solution:**
1. Debug: Log `layoutArchetype` value before passing to prompt
2. Verify the modulo arithmetic: `archetypeLetters[accountPostCount % 4]`
3. Check that `accountPostCount` is increasing (not being reset)

---

## Files Changed

1. **`src/lib/storage.ts`**
   - Replace `brandProfiles[].imageStyle` strings
   - No code logic changes

2. **`server.js`**
   - Replace `buildGraphicPrompt()` function
   - Update `createScheduledPostForTomorrow()` function
   - Update `buildGenerationPrompt()` signature
   - Update `generatePostRemote()` endpoint
   - Optional: Change `anthropicModel` constant

3. **Optional: `.env`**
   - Set `ANTHROPIC_MODEL=claude-sonnet-4-20250514`

---

## Before & After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Graphics Quality | Poor, templated | Premium, varied |
| Layout Variety | Same card repeats | 4 different archetypes |
| Visual Direction | Vague ("magazine", "split") | Concrete (Archetype A: "left headline + right accent") |
| Typography | Inconsistent, sometimes too small | Consistent, all ≥32px |
| Color Accuracy | Colors don't match brand palette | Exact palette compliance |
| Design Principles | Ad-hoc | Grid-based, minimal, intentional |
| Time to Professional | ~2 posts to understand pattern | All posts immediately professional |

---

## Success Metrics

After implementation, measure:

1. **Layout Variety**: Count different layout patterns in first 7 posts (should be ≥4)
2. **Typography**: Measure smallest text in rendered graphics (should be ≥32px)
3. **Color Match**: Extract hex from 5 graphics; all should match brand palette
4. **Professional Rating**: Show graphics to 3 peers; rate 1–10 (target: 8+)

---

## Next Steps (Optional)

1. **Brand Kit Integration**: Create visual brand kit document (Figma, Adobe XD) that designers reference
2. **Archetype Examples**: Create 1 example graphic per archetype per brand (show in docs)
3. **Prompt Versioning**: Version the `buildGraphicPrompt()` function for A/B testing different instructions
4. **Feedback Loop**: Log which archetypes get best engagement; adjust rotation weights accordingly

---

## Support

If graphics still underperform after these changes:
1. Check ANTHROPIC_MODEL env var is set correctly
2. Verify prompt is being passed complete brand imageStyle
3. Sample a failed graphic's prompt from logs; manually refine and test
4. Consider creating brand kit docs with specific examples
