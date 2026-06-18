import { TOOLS, LINEAGES, type Technique, type Trait, type Tool, type Lineage } from './data';

interface DataIndices {
  techniqueByName: Map<string, Technique>;
  lineageTraitByName: Map<string, Trait>;
  toolByName: Map<string, Tool>;
  lineageByName: Map<string, Lineage>;
}

const buildDataIndices = (): DataIndices => {
  const techniqueByName = new Map<string, Technique>();
  for (const tool of TOOLS) {
    for (const tech of tool.techniques) {
      techniqueByName.set(tech.name, tech);
    }
  }

  const lineageTraitByName = new Map<string, Trait>();
  for (const lineage of LINEAGES) {
    for (const trait of lineage.traits) {
      lineageTraitByName.set(trait.name, trait);
    }
  }

  const toolByName = new Map<string, Tool>();
  for (const tool of TOOLS) {
    toolByName.set(tool.name, tool);
  }

  const lineageByName = new Map<string, Lineage>();
  for (const lineage of LINEAGES) {
    lineageByName.set(lineage.name, lineage);
  }

  return { techniqueByName, lineageTraitByName, toolByName, lineageByName };
};

export const {
  techniqueByName,
  lineageTraitByName,
  toolByName,
  lineageByName
} = buildDataIndices();