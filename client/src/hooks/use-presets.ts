import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PresetInput } from "@shared/routes";
import { type DnaConfiguration } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const DEFAULT_CONFIGURATION: DnaConfiguration = {
  meta: {
    version: "7.0.0",
    codename: "Psychonarrative Historical"
  },
  dimensions: {
    temporalSpatial: {
      master: 78,
      timelessFrozen: 80,
      atmosphericDuration: 20,
      dramaticMoment: 30,
      motionBlur: 0,
      timeIndication: 50,
      atmosphericIndication: 40,
      depthPrecision: 70
    },
    materialSpiritual: {
      master: 72,
      divineThroughMaterial: 85,
      materialAsExpansion: 40,
      materialPrecision: 80,
      spiritualSymbolism: 60,
      surfacePerfection: 75,
      detailAsRevelation: 70
    },
    lightRevelation: {
      master: 81,
      lightAsDivineProof: 90,
      lightAsDramaticTools: 45,
      shadowSoftness: 60,
      reflectionSubtlety: 55,
      lightSymbolism: 65
    },
    gazePsychology: {
      master: 75,
      microscopicScrutiny: 85,
      emotionalImmersion: 50,
      dramaticOrchestration: 40,
      loopCompleteness: 60,
      transitionSmoothness: 70,
      discoveryDensity: 55,
      hypnoticQuality: 45
    },
    historicalConstraints: {
      master: 100,
      period: "GOLDEN_AGE",
      fidelity: 85
    },
    finition: {
      master: 80,
      masterLustre: 75,
      finalGlow: 60
    }
  }
};

export function usePresets() {
  return useQuery({
    queryKey: [api.presets.list.path],
    queryFn: async () => {
      const res = await fetch(api.presets.list.path);
      if (!res.ok) throw new Error("Failed to fetch presets");
      return api.presets.list.responses[200].parse(await res.json());
    },
  });
}

export function usePreset(id: number | null) {
  return useQuery({
    queryKey: [api.presets.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.presets.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch preset");
      return api.presets.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PresetInput) => {
      const res = await fetch(api.presets.create.path, {
        method: api.presets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.presets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create preset");
      }
      return api.presets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presets.list.path] });
      toast({
        title: "Preset Saved",
        description: "Your configuration has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<PresetInput>) => {
      const url = buildUrl(api.presets.update.path, { id });
      const res = await fetch(url, {
        method: api.presets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.presets.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to update preset");
      }
      return api.presets.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presets.list.path] });
      toast({
        title: "Preset Updated",
        description: "Your changes have been saved.",
      });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.presets.delete.path, { id });
      const res = await fetch(url, { method: api.presets.delete.method });
      if (!res.ok) throw new Error("Failed to delete preset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presets.list.path] });
      toast({
        title: "Preset Deleted",
        description: "The preset has been removed.",
      });
    },
  });
}
