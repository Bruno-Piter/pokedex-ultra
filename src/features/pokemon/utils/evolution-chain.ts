import {
  getPokemonFormByPokemonName,
  getPokemonSpecies,
} from "@/features/pokemon/api/pokemon.api";
import type {
  ChainLink,
  ExtendedChainLink,
  PokemonFormData,
  PokemonSpecies,
} from "@/features/pokemon/types";
import { getEvolutionLabel } from "@/features/pokemon/utils/evolution-format";
import { extractIdFromUrl } from "@/lib/pokeapi/client";

const FORM_BRANCH_PATTERNS = [
  /-mega(-[a-z0-9]+)?$/i,
  /-gmax$/i,
  /-(alola|galar|hisui|paldea)$/i,
  /-primal$/i,
  /-zen$/i,
  /-(dusk|midnight|noon|sunshine|ice)$/i,
  /-(rapid-strike|single-strike)$/i,
  /-(attack|defense|speed)$/i,
  /-(hero|unbound|complete|origin|totem|eternamax)$/i,
  /-crowned$/i,
  /-bloodmoon$/i,
] as const;

function capitalize(text: string): string {
  return text
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatFormDisplayName(pokemonName: string): string {
  const megaMatch = pokemonName.match(/^(.+)-mega-([a-z0-9]+)$/i);
  if (megaMatch) {
    return `Mega ${capitalize(megaMatch[1])} ${megaMatch[2].toUpperCase()}`;
  }

  if (pokemonName.endsWith("-mega")) {
    const base = pokemonName.replace(/-mega$/, "");
    return `Mega ${capitalize(base)}`;
  }

  if (pokemonName.endsWith("-gmax")) {
    const base = pokemonName.replace(/-gmax$/, "");
    return `Gigantamax ${capitalize(base)}`;
  }

  const regionalMatch = pokemonName.match(/^(.+)-(alola|galar|hisui|paldea)$/i);
  if (regionalMatch) {
    return `${capitalize(regionalMatch[1])} (${capitalize(regionalMatch[2])})`;
  }

  if (pokemonName.endsWith("-primal")) {
    const base = pokemonName.replace(/-primal$/, "");
    return `Primal ${capitalize(base)}`;
  }

  if (pokemonName.endsWith("-eternamax")) {
    const base = pokemonName.replace(/-eternamax$/, "");
    return `Eternamax ${capitalize(base)}`;
  }

  return capitalize(pokemonName);
}

function getMegaStoneLabel(pokemonName: string): string {
  const megaMatch = pokemonName.match(/^(.+)-mega-([a-z0-9]+)$/i);
  if (megaMatch) {
    return `${capitalize(megaMatch[1])}ite ${megaMatch[2].toUpperCase()}`;
  }

  if (pokemonName.endsWith("-mega")) {
    const base = pokemonName.replace(/-mega$/, "");
    return `${capitalize(base)}ite`;
  }

  return "Mega Stone";
}

export function getFormConnectorLabel(
  pokemonName: string,
  form: PokemonFormData,
): string {
  if (form.is_mega) return getMegaStoneLabel(pokemonName);

  if (form.form_name === "gmax" || pokemonName.endsWith("-gmax")) {
    return "Gigantamax";
  }

  if (pokemonName.endsWith("-eternamax")) return "Eternamax";

  if (pokemonName.endsWith("-primal")) return "Primal Reversion";

  const regionalMatch = pokemonName.match(/-(alola|galar|hisui|paldea)$/i);
  if (regionalMatch) {
    return `${capitalize(regionalMatch[1])} Form`;
  }

  if (form.form_name && form.form_name !== pokemonName) {
    return capitalize(form.form_name);
  }

  return "Form Change";
}

function shouldShowFormBranch(
  pokemonName: string,
  form: PokemonFormData,
): boolean {
  if (form.is_mega) return true;
  if (form.form_name === "gmax" || pokemonName.endsWith("-gmax")) return true;
  if (pokemonName.endsWith("-eternamax")) return true;
  return FORM_BRANCH_PATTERNS.some((pattern) => pattern.test(pokemonName));
}

function sortFormBranches(a: ExtendedChainLink, b: ExtendedChainLink): number {
  const rank = (name: string) => {
    if (name.includes("-mega")) return 0;
    if (name.endsWith("-gmax")) return 1;
    if (name.endsWith("-eternamax")) return 2;
    if (name.endsWith("-primal")) return 3;
    return 4;
  };

  const diff = rank(a.pokemonName) - rank(b.pokemonName);
  return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName);
}

type BuildContext = {
  speciesCache: Map<number, PokemonSpecies>;
  formCache: Map<string, PokemonFormData | null>;
};

async function getCachedSpecies(
  speciesId: number,
  ctx: BuildContext,
): Promise<PokemonSpecies> {
  if (!ctx.speciesCache.has(speciesId)) {
    ctx.speciesCache.set(speciesId, await getPokemonSpecies(speciesId));
  }
  return ctx.speciesCache.get(speciesId)!;
}

async function getCachedForm(
  pokemonName: string,
  ctx: BuildContext,
): Promise<PokemonFormData | null> {
  if (!ctx.formCache.has(pokemonName)) {
    ctx.formCache.set(
      pokemonName,
      await getPokemonFormByPokemonName(pokemonName),
    );
  }
  return ctx.formCache.get(pokemonName) ?? null;
}

async function buildFormBranches(
  species: PokemonSpecies,
  ctx: BuildContext,
): Promise<ExtendedChainLink[]> {
  const alternateVarieties = (species.varieties ?? []).filter(
    (variety) => !variety.is_default,
  );

  const branches: ExtendedChainLink[] = [];

  for (const variety of alternateVarieties) {
    const pokemonName = variety.pokemon.name;
    const pokemonId = extractIdFromUrl(variety.pokemon.url);
    const form = await getCachedForm(pokemonName, ctx);

    if (!form || !shouldShowFormBranch(pokemonName, form)) {
      continue;
    }

    branches.push({
      species: { name: species.name, url: variety.pokemon.url },
      speciesId: species.id,
      pokemonId,
      pokemonName,
      displayName: formatFormDisplayName(pokemonName),
      isFormBranch: true,
      connectorLabel: getFormConnectorLabel(pokemonName, form),
      evolution_details: [],
      evolves_to: [],
    });
  }

  return branches;
}

async function buildExtendedNode(
  link: ChainLink,
  ctx: BuildContext,
  connectorLabel: string | null = null,
  isFormBranch = false,
  pokemonOverride?: { id: number; name: string; displayName?: string },
): Promise<ExtendedChainLink> {
  const speciesId = extractIdFromUrl(link.species.url);
  const species = await getCachedSpecies(speciesId, ctx);

  const defaultVariety =
    species.varieties?.find((variety) => variety.is_default) ??
    species.varieties?.[0];

  const pokemonId =
    pokemonOverride?.id ??
    (defaultVariety
      ? extractIdFromUrl(defaultVariety.pokemon.url)
      : speciesId);
  const pokemonName = pokemonOverride?.name ?? defaultVariety?.pokemon.name ?? link.species.name;
  const displayName =
    pokemonOverride?.displayName ??
    (isFormBranch
      ? formatFormDisplayName(pokemonName)
      : capitalize(link.species.name));

  const naturalChildren = await Promise.all(
    link.evolves_to.map((child) =>
      buildExtendedNode(
        child,
        ctx,
        getEvolutionLabel(child.evolution_details) || null,
      ),
    ),
  );

  const formChildren = !isFormBranch ? await buildFormBranches(species, ctx) : [];

  return {
    species: link.species,
    speciesId,
    pokemonId,
    pokemonName,
    displayName,
    isFormBranch,
    connectorLabel,
    evolution_details: link.evolution_details,
    evolves_to: [...naturalChildren, ...formChildren].sort((a, b) => {
      if (a.isFormBranch !== b.isFormBranch) {
        return a.isFormBranch ? 1 : -1;
      }
      if (a.isFormBranch && b.isFormBranch) {
        return sortFormBranches(a, b);
      }
      return 0;
    }),
  };
}

export async function buildExtendedEvolutionChain(
  chain: ChainLink,
): Promise<ExtendedChainLink> {
  const ctx: BuildContext = {
    speciesCache: new Map(),
    formCache: new Map(),
  };

  return buildExtendedNode(chain, ctx);
}
