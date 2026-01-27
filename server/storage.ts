
import { db } from "./db";
import {
  presets,
  type Preset,
  type InsertPreset,
  type UpdatePresetRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPresets(): Promise<Preset[]>;
  getPreset(id: number): Promise<Preset | undefined>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  updatePreset(id: number, updates: UpdatePresetRequest): Promise<Preset | undefined>;
  deletePreset(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPresets(): Promise<Preset[]> {
    return await db.select().from(presets).orderBy(presets.createdAt);
  }

  async getPreset(id: number): Promise<Preset | undefined> {
    const [preset] = await db.select().from(presets).where(eq(presets.id, id));
    return preset;
  }

  async createPreset(insertPreset: InsertPreset): Promise<Preset> {
    const [preset] = await db.insert(presets).values(insertPreset).returning();
    return preset;
  }

  async updatePreset(id: number, updates: UpdatePresetRequest): Promise<Preset | undefined> {
    const [updated] = await db
      .update(presets)
      .set(updates)
      .where(eq(presets.id, id))
      .returning();
    return updated;
  }

  async deletePreset(id: number): Promise<void> {
    await db.delete(presets).where(eq(presets.id, id));
  }
}

export const storage = new DatabaseStorage();
