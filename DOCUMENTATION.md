# FinitionGenerator ADN V7.0 - System Documentation

## Overview
This document describes the optimized artistic finishing system with automatic master detection and neutralized canvas rendering.

---

## 1. Available Parameters (6 Dimensions)

### Dimension 1: Temporal-Spatial (`temporalSpatial`)
- **Archetypes:**
  - `TIMELESS_FROZEN` - Static, eternal quality (Vermeer, Rembrandt)
  - `DRAMATIC_MOMENT` - Captured action (Caravaggio, Bacon)
  - `ATMOSPHERIC_DURATION` - Ambient, flowing time (Turner, Monet)
- **Intensity:** 0-100%

### Dimension 2: Material-Spiritual (`materialSpiritual`)
- **Archetypes:**
  - `DIVINE_THROUGH_MATERIAL` - Transcendent luminosity (Vermeer, Klimt)
  - `MATERIAL_AS_EXPRESSION` - Raw physicality (Bacon, Beksiński)
- **Intensity:** 0-100%

### Dimension 3: Subject-Viewer (`subjectViewer`)
- **Archetypes:**
  - `INVITATION_TO_SCRUTINY` - Contemplative engagement
  - `IMMEDIATE_EMOTIONAL_IMPACT` - Visceral response
- **Intensity:** 0-100%

### Dimension 4: Light-Revelation (`lightRevelation`)
- **Archetypes:**
  - `LIGHT_AS_DIVINE_PROOF` - Luminous, ethereal (Turner, Vermeer)
  - `LIGHT_AS_DRAMATIC_TOOL` - Chiaroscuro, tenebrism (Caravaggio)
- **Intensity:** 0-100%

### Dimension 5: Gaze Psychology (`gazePsychology`)
- **Strategies:**
  - `MICROSCOPIC_SCRUTINY` - Detail-focused observation
  - `DRAMATIC_ORCHESTRATION` - Theatrical staging
  - `EMOTIONAL_IMMERSION` - Psychological absorption
- **Intensity:** 0-100%

### Dimension 6: Historical Constraints (`historicalConstraints`)
- **Periods:**
  - `EARLY_RENAISSANCE` - Subtle warm tones
  - `HIGH_RENAISSANCE` - Near neutral
  - `BAROQUE` - Dramatic warmth
  - `GOLDEN_AGE` - Golden hour quality
  - `EXPRESSIONISM_MID_20TH` - Expressive color
  - `MODERN` - Fully neutral (20th century)
  - `CONTEMPORARY` - Fully neutral
- **Fidelity:** 0-100%

---

## 2. Color Bias Correction (Canvas Neutralization)

### Problem Solved
The original system applied excessive warm/golden tints through `applyHistoricalConstraints()` and glaze effects, distorting original image colors.

### Solution Applied
- Reduced period color tint values by ~60%
- Added MODERN and CONTEMPORARY periods with zero color bias
- Halved glaze intensity (0.5 → 0.25) for GOLDEN_AGE/BAROQUE periods

### Technical Changes (`vermeer-processor.ts`)
```typescript
// BEFORE (excessive warmth)
"GOLDEN_AGE": [12, 6, -20]

// AFTER (neutralized)
"GOLDEN_AGE": [5, 2, -8]
```

---

## 3. Master Presets Database

**Location:** `client/src/lib/masters-presets.json`

### Included Masters:
| Master | Period | Style |
|--------|--------|-------|
| Vermeer | 17th century | Soft light, domestic |
| Caravaggio | Late 16th century | Tenebrism, dramatic |
| Klimt | Late 19th century | Ornamental, gold |
| Turner | 19th century | Atmospheric, luminous |
| Bacon | 20th century | Distorted, raw |
| Chagall | 20th century | Dreamlike, vibrant |
| Friedrich | 19th century | Romantic sublime |
| Beksiński | Late 20th century | Dystopian, surreal |
| Rembrandt | 17th century | Chiaroscuro, impasto |
| Monet | Late 19th century | Impressionist light |

---

## 4. Automatic Detection System

### Detection Function
**Location:** `client/src/lib/master-detector.ts`

### Algorithm
1. Analyzes image properties:
   - Brightness (0-1)
   - Contrast (0-1)
   - Warmth (warm vs cool ratio)
   - Saturation (0-1)
   - Dominant colors

2. Matches against master profiles based on:
   - Contrast levels → High contrast = Caravaggio/Bacon
   - Color temperature → Cool = Vermeer/Turner
   - Brightness → Dark = Caravaggio/Beksiński
   - Saturation → Vibrant = Chagall/Klimt
   - Special color detection (gold, sepia)

3. Returns:
   - Suggested master with confidence %
   - Reasoning explanation
   - Alternative matches

### Usage
```typescript
import { detectOptimalMaster } from '@/lib/master-detector';

const result = detectOptimalMaster(imageData);
// result.suggestedMaster = "vermeer"
// result.confidence = 87
// result.reasoning = "Soft directional light, cool palette"
```

---

## 5. Step 0 Workflow (UI)

### Components Added
- `MasterDetectionModal.tsx` - Detection results popup

### User Flow
1. Import image via "Import Image" button
2. If auto-detect enabled: Modal shows detected master
3. User can:
   - Apply suggested preset (1 click)
   - Choose alternative
   - Switch to manual mode
4. Finitions applied with optimal parameters

### Manual Trigger
Click "Auto" button in sidebar to re-run detection on current image.

---

## 6. Files Modified/Created

### Modified
- `client/src/lib/vermeer-processor.ts` - Neutralized color bias
- `client/src/pages/Home.tsx` - Detection integration
- `shared/schema.ts` - Period type definitions

### Created
- `client/src/lib/masters-presets.json` - Master configurations
- `client/src/lib/master-detector.ts` - Detection algorithm
- `client/src/components/MasterDetectionModal.tsx` - Detection UI
- `DOCUMENTATION.md` - This file

---

## 7. Testing Recommendations

1. **Color Neutrality Test:**
   - Import a neutral gray image
   - Apply each period setting
   - Verify no excessive color shifts

2. **Detection Accuracy Test:**
   - Import various artistic images
   - Check detection suggestions
   - Verify confidence percentages match visual analysis

3. **Preset Application Test:**
   - Apply each master preset
   - Verify all 6 dimensions update correctly
   - Check visual output matches master style
