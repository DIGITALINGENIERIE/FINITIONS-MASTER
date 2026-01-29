
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en finitions artistiques pour œuvres NFT ultra-premium. Analyse l'image fournie et l'artiste spécifié pour recommander des paramètres techniques optimaux au format JSON. Ta réponse doit être uniquement un objet JSON valide correspondant à l'interface DnaConfiguration."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Voici une œuvre de ${master}. Analyse-la et fournis les paramètres optimaux.` },
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
