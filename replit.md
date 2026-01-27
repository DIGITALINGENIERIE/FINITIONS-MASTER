# ADN CONVERTER V7.0 - Project Documentation

## Overview
ADN CONVERTER V7.0 is an advanced algorithmic image processing platform using a focused 6-dimensional "Psychonarrative Historical" model with 32+ granular sub-parameters.

## Current State
- **Version**: 7.0.2
- **Status**: Fully Operational with Professional UI
- **Architecture**: Multi-master support (10 masters including Vermeer, Caravaggio, Klimt, Turner, Bacon, etc.)
- **Core Engine**: `MasterProcessor` in `client/src/lib/vermeer-processor.ts`
- **Design**: Professional dark theme (void/abyss) with cyan-glow accents and glass panels

## Recent Changes (January 2026)
- **New Professional UI**: Void/abyss dark theme with cyan-glow, amber-spark, jade-core, magenta-pulse accent colors.
- **Glass Panel Design**: Backdrop-blur effects on all panels with subtle borders.
- **Expanded Parameters**: 32+ individual sub-parameters across 6 dimensions with 0-100% sliders.
- **Master Slider Control**: Each dimension has a master intensity slider with gradient visualization.
- **French Interface**: All parameters labeled in French with English translations in parentheses.
- **Collapsible Sections**: Each dimension can be expanded/collapsed with chevron indicators.
- **Scan-line Animation**: Animated scan-line effect on canvas for professional lab aesthetic.
- **Finition Dimension**: New "Finition Master" dimension with Master Lustre and Final Glow parameters.

## Project Architecture
- `shared/schema.ts`: Drizzle schema and TypeScript definitions for ADN V7.0.
- `server/routes.ts`: API endpoints for preset management and database seeding.
- `client/src/lib/vermeer-processor.ts`: The brain of the application, implementing master-specific artistic algorithms.
- `client/src/lib/master-detector.ts`: Automatic master detection based on image analysis.
- `client/src/lib/masters-presets.json`: Calibrated presets for all supported masters.
- `client/src/components/MasterDetectionModal.tsx`: Detection suggestion modal UI.
- `client/src/pages/Home.tsx`: Main interface for image interaction and parameter adjustment.

## The 6 Dimensions
1. **Temporal-Spatial**: Time perception (TIMELESS_FROZEN, DRAMATIC_MOMENT, ATMOSPHERIC_DURATION)
2. **Material-Spiritual**: Physical vs transcendent (DIVINE_THROUGH_MATERIAL, MATERIAL_AS_EXPRESSION)
3. **Light-Revelation**: Light philosophy (LIGHT_AS_DIVINE_PROOF, LIGHT_AS_DRAMATIC_TOOL)
4. **Gaze Psychology**: Visual strategy (MICROSCOPIC_SCRUTINY, DRAMATIC_ORCHESTRATION, EMOTIONAL_IMMERSION)
5. **Historical Constraints**: Period authenticity with 7 periods including new MODERN and CONTEMPORARY (neutral)
6. **Finition Master**: Final finishing with Master Lustre and Final Glow

## User Preferences
- **Design**: Dark mode, high-contrast, professional "Laboratory" aesthetic.
- **Interactions**: Subtle elevations (hover-elevate), real-time canvas updates.
- **Stability**: Full-stack JS with PostgreSQL persistence.
