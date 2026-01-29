
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === PRESETS API ===
  
  app.post("/api/calibrate", async (req, res) => {
    try {
      const { imageUrl, master } = req.body;
      if (!imageUrl || !master) {
        return res.status(400).json({ message: "Image URL and master are required" });
      }

      const systemPrompt = `# Expert en Finitions NFT Ultra-Premium

## Rôle
Tu es un expert en finitions artistiques pour œuvres NFT ultra-premium. Tu analyses des œuvres d'art et recommandes des paramètres techniques optimaux pour sublimer leur rendu numérique en préservant leur essence artistique.

## Contexte des Paramètres

### **Temps-Espace (temporalSpatial)** - Master général (0-100)
- **timelessFrozen** (0-100) : Fige l'instant, cristallise le moment, éternise la scène
- **atmosphericDuration** (0-100) : Crée une durée atmosphérique, un temps suspendu, une temporalité fluide
- **dramaticMoment** (0-100) : Intensité du moment dramatique capturé
- **motionBlur** (0-100) : Suggestion de mouvement par flou directionnel
- **timeIndication** (0-100) : Indices temporels dans l'œuvre
- **atmosphericIndication** (0-100) : Qualité atmosphérique de la scène
- **depthPrecision** (0-100) : Précision de la profondeur spatiale

### **Matière-Esprit (materialSpiritual)** - Master général (0-100)
- **divineThroughMaterial** (0-100) : Transcendance, lumière intérieure, aura spirituelle émanant de la matière
- **materialAsExpansion** (0-100) : Amplifie texture, densité physique, présence matérielle tangible
- **materialPrecision** (0-100) : Précision du rendu des matériaux
- **spiritualSymbolism** (0-100) : Symbolisme spirituel dans les éléments
- **surfacePerfection** (0-100) : Qualité de finition des surfaces
- **detailAsRevelation** (0-100) : Le détail comme révélation de sens

### **Lumière-Révélation (lightRevelation)** - Master général (0-100)
- **lightAsDivineProof** (0-100) : Lumière naturelle sacrée, révélation divine, pureté lumineuse
- **lightAsDramaticTools** (0-100) : Contraste, clair-obscur, tensions dramatiques par la lumière
- **shadowSoftness** (0-100) : Douceur des ombres et transitions
- **reflectionSubtlety** (0-100) : Subtilité des reflets et brillances
- **lightSymbolism** (0-100) : Valeur symbolique de la lumière

### **Psychologie du Regard (gazePsychology)** - Master général (0-100)
- **microscopicScrutiny** (0-100) : Incite au détail, exploration minutieuse, découverte progressive
- **emotionalImmersion** (0-100) : Immersion émotionnelle, connexion affective profonde
- **dramaticOrchestration** (0-100) : Orchestration dramatique, tension narrative, composition théâtrale
- **loopCompleteness** (0-100) : Complétude du parcours visuel
- **transitionSmoothness** (0-100) : Fluidité des transitions entre zones
- **discoveryDensity** (0-100) : Densité des éléments à découvrir
- **hypnoticQuality** (0-100) : Qualité hypnotique et immersive

### **Contrainte Historique (historicalConstraints)** - Master général (0-100)
- **period** : Un seul style dominant parmi: GOLDEN_AGE, CONTEMPORARY, MODERN_20TH, IMPRESSIONISM_MID_20TH, BAROQUE, HIGH_RENAISSANCE, EARLY_RENAISSANCE, EXPRESSIONISM_MID_20TH
- **fidelity** (0-100) : Fidélité aux contraintes de la période

### **Finition (finition)** - Master général (0-100)
- **masterLustre** (0-100) : Lustre et brillance de la finition
- **finalGlow** (0-100) : Rayonnement final de l'œuvre

## Méthodologie d'Analyse

1. **Identification stylistique** : Période historique, mouvement artistique, signature technique
2. **Analyse compositionnelle** : Structure spatiale, équilibre, point focal
3. **Analyse lumineuse** : Sources, direction, contraste, fonction dramatique
4. **Analyse matérielle** : Textures, densité, qualité atmosphérique
5. **Analyse émotionnelle** : Intention narrative, charge émotionnelle
6. **Temporalité** : Instant figé vs durée, mouvement suggéré

## Principes de Calibration

- **Valeurs extrêmes (0-20 ou 80-100)** : Pour caractéristiques dominantes ou absentes
- **Valeurs moyennes (40-60)** : Pour caractéristiques équilibrées
- **Master général** : Importance globale de la dimension (70-95 pour dominantes)
- **Cohérence** : Les paramètres forment un système cohérent
- **Authenticité** : Respecter l'intention originale de l'artiste

## Exemples de Calibration

**Caravage (Baroque)** : lightAsDramaticTools: 95, timelessFrozen: 85, dramaticOrchestration: 90
**Monet (Impressionnisme)** : atmosphericDuration: 85, lightAsDivineProof: 75, materialAsExpansion: 30
**Vermeer (Âge d'or)** : microscopicScrutiny: 90, lightAsDivineProof: 85, timelessFrozen: 80

## Format de Réponse

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte:
{
  "meta": { "version": "7.0.0", "codename": "Psychonarrative Historical", "artist": "Nom de l'artiste" },
  "dimensions": {
    "temporalSpatial": { "master": 0-100, "timelessFrozen": 0-100, "atmosphericDuration": 0-100, "dramaticMoment": 0-100, "motionBlur": 0-100, "timeIndication": 0-100, "atmosphericIndication": 0-100, "depthPrecision": 0-100 },
    "materialSpiritual": { "master": 0-100, "divineThroughMaterial": 0-100, "materialAsExpansion": 0-100, "materialPrecision": 0-100, "spiritualSymbolism": 0-100, "surfacePerfection": 0-100, "detailAsRevelation": 0-100 },
    "lightRevelation": { "master": 0-100, "lightAsDivineProof": 0-100, "lightAsDramaticTools": 0-100, "shadowSoftness": 0-100, "reflectionSubtlety": 0-100, "lightSymbolism": 0-100 },
    "gazePsychology": { "master": 0-100, "microscopicScrutiny": 0-100, "emotionalImmersion": 0-100, "dramaticOrchestration": 0-100, "loopCompleteness": 0-100, "transitionSmoothness": 0-100, "discoveryDensity": 0-100, "hypnoticQuality": 0-100 },
    "historicalConstraints": { "master": 0-100, "period": "PERIOD_NAME", "fidelity": 0-100 },
    "finition": { "master": 0-100, "masterLustre": 0-100, "finalGlow": 0-100 }
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Voici une œuvre de ${master}. Analyse-la en profondeur et fournis les paramètres optimaux pour sublimer cette œuvre en NFT ultra-premium.` },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      const config = JSON.parse(response.choices[0].message.content || "{}");
      res.json(config);
    } catch (err) {
      console.error("Calibration error:", err);
      res.status(500).json({ message: "Failed to calibrate parameters" });
    }
  });
  
  app.get(api.presets.list.path, async (req, res) => {
    const presets = await storage.getPresets();
    res.json(presets);
  });

  app.get(api.presets.get.path, async (req, res) => {
    const preset = await storage.getPreset(Number(req.params.id));
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }
    res.json(preset);
  });

  app.post(api.presets.create.path, async (req, res) => {
    try {
      const input = api.presets.create.input.parse(req.body);
      const preset = await storage.createPreset(input);
      res.status(201).json(preset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.presets.update.path, async (req, res) => {
    try {
      const input = api.presets.update.input.parse(req.body);
      const updated = await storage.updatePreset(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: 'Preset not found' });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.presets.delete.path, async (req, res) => {
    const preset = await storage.getPreset(Number(req.params.id));
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }
    await storage.deletePreset(Number(req.params.id));
    res.status(204).send();
  });

  // Seed default presets if empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getPresets();
  if (existing.length === 0) {
    const defaultConfiguration = {
      meta: {
        version: "7.0.0",
        codename: "Psychonarrative Historical"
      },
      dimensions: {
        temporalSpatial: {
          archetype: "TIMELESS_FROZEN",
          intensity: 80
        },
        materialSpiritual: {
          archetype: "DIVINE_THROUGH_MATERIAL",
          intensity: 90
        },
        subjectViewer: {
          archetype: "INVITATION_TO_SCRUTINY",
          intensity: 85
        },
        lightRevelation: {
          archetype: "LIGHT_AS_DIVINE_PROOF",
          intensity: 95
        },
        gazePsychology: {
          strategy: "MICROSCOPIC_SCRUTINY",
          intensity: 90
        },
        historicalConstraints: {
          period: "GOLDEN_AGE",
          fidelity: 85
        }
      }
    };

    await storage.createPreset({
      name: "Vermeer V7 - Essence",
      master: "Vermeer",
      description: "Système V7.0 focalisé sur la précision microscopique et l'éternité suspendue.",
      configuration: defaultConfiguration,
      isDefault: true
    });

    const baconConfiguration = {
      meta: {
        version: "7.0.0",
        codename: "Psychonarrative Historical",
        artist: "Francis Bacon"
      },
      dimensions: {
        temporalSpatial: {
          archetype: "DRAMATIC_MOMENT",
          intensity: 88
        },
        materialSpiritual: {
          archetype: "MATERIAL_AS_EXPRESSION",
          intensity: 92
        },
        subjectViewer: {
          archetype: "IMMEDIATE_EMOTIONAL_IMPACT",
          intensity: 96
        },
        lightRevelation: {
          archetype: "LIGHT_AS_DRAMATIC_TOOL",
          intensity: 97
        },
        gazePsychology: {
          strategy: "EMOTIONAL_IMMERSION",
          intensity: 96
        },
        historicalConstraints: {
          period: "EXPRESSIONISM_MID_20TH",
          fidelity: 85
        }
      }
    };

    await storage.createPreset({
      name: "Bacon V7 - Existential Crisis",
      master: "Francis Bacon",
      description: "Capturer le paroxysme et l'angoisse existentielle via la déformation organique.",
      configuration: baconConfiguration,
      isDefault: true
    });
  }
}
