
import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presets = pgTable("presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  master: text("master").notNull().default("Vermeer"),
  description: text("description"),
  configuration: jsonb("configuration").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPresetSchema = createInsertSchema(presets).omit({ 
  id: true, 
  createdAt: true 
});

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = z.infer<typeof insertPresetSchema>;

export interface DnaConfiguration {
  meta: {
    version: string;
    codename: string;
    artist?: string;
  };
  dimensions: {
    temporalSpatial: {
      master: number;
      timelessFrozen: number;
      atmosphericDuration: number;
      dramaticMoment: number;
      motionBlur: number;
      timeIndication: number;
      atmosphericIndication: number;
      depthPrecision: number;
    };
    materialSpiritual: {
      master: number;
      divineThroughMaterial: number;
      materialAsExpansion: number;
      materialPrecision: number;
      spiritualSymbolism: number;
      surfacePerfection: number;
      detailAsRevelation: number;
    };
    lightRevelation: {
      master: number;
      lightAsDivineProof: number;
      lightAsDramaticTools: number;
      shadowSoftness: number;
      reflectionSubtlety: number;
      lightSymbolism: number;
    };
    gazePsychology: {
      master: number;
      microscopicScrutiny: number;
      emotionalImmersion: number;
      dramaticOrchestration: number;
      loopCompleteness: number;
      transitionSmoothness: number;
      discoveryDensity: number;
      hypnoticQuality: number;
    };
    historicalConstraints: {
      master: number;
      period: string;
      fidelity: number;
    };
    finition: {
      master: number;
      masterLustre: number;
      finalGlow: number;
    };
  };
}

export type CreatePresetRequest = InsertPreset;
export type UpdatePresetRequest = Partial<InsertPreset>;
