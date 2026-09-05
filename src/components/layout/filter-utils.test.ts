import { describe, expect, it } from 'vitest'
import {
  countActiveFilters,
  filterAndSortCatalog,
  getSelectedMoves,
  hasActiveFilters,
  pokemonKnowsAllMoves,
  type FilterState,
} from './filter-utils'
import type { Pokemon } from '@/features/pokemon/types'

function base(overrides: Partial<FilterState> = {}): FilterState {
  return {
    types: [],
    sort: 'id',
    sortDirection: 'asc',
    statSortDirection: 'asc',
    generation: null,
    statSort: [],
    search: '',
    moves: [null, null, null, null],
    ...overrides,
  }
}

function pokemonStub(partial: {
  id: number
  name: string
  moves: string[]
  types?: string[]
}): Pokemon {
  return {
    id: partial.id,
    name: partial.name,
    height: 10,
    weight: 100,
    base_experience: 64,
    order: partial.id,
    is_default: true,
    sprites: {
      front_default: null,
      front_shiny: null,
      other: {},
      versions: {},
    },
    types: (partial.types ?? ['normal']).map((name, slot) => ({
      slot: slot + 1,
      type: { name, url: '' },
    })),
    stats: [
      { base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 49, effort: 0, stat: { name: 'attack', url: '' } },
      { base_stat: 49, effort: 0, stat: { name: 'defense', url: '' } },
      { base_stat: 65, effort: 0, stat: { name: 'special-attack', url: '' } },
      { base_stat: 65, effort: 0, stat: { name: 'special-defense', url: '' } },
      { base_stat: 45, effort: 0, stat: { name: 'speed', url: '' } },
    ],
    abilities: [],
    moves: partial.moves.map((name) => ({
      move: { name, url: '' },
      version_group_details: [],
    })),
    species: { name: partial.name, url: '' },
    forms: [],
  }
}

describe('countActiveFilters', () => {
  it('is zero on default catalog state', () => {
    expect(countActiveFilters(base())).toBe(0)
    expect(hasActiveFilters(base())).toBe(false)
  })

  it('counts selected types', () => {
    expect(countActiveFilters(base({ types: ['fire', 'water'] }))).toBe(2)
  })

  it('counts generation once', () => {
    expect(countActiveFilters(base({ generation: 1 }))).toBe(1)
  })

  it('counts non-default sort', () => {
    expect(countActiveFilters(base({ sort: 'name' }))).toBe(1)
    expect(countActiveFilters(base({ sortDirection: 'desc' }))).toBe(1)
  })

  it('counts stat sort columns and desc direction', () => {
    expect(countActiveFilters(base({ statSort: ['attack', 'speed'] }))).toBe(2)
    expect(
      countActiveFilters(
        base({ statSort: ['attack'], statSortDirection: 'desc' }),
      ),
    ).toBe(2)
  })

  it('counts selected moves and ignores empty slots', () => {
    expect(
      countActiveFilters(
        base({ moves: ['tackle', null, 'growl', null] }),
      ),
    ).toBe(2)
    expect(getSelectedMoves([null, 'ember', null, null])).toEqual(['ember'])
  })
})

describe('pokemonKnowsAllMoves', () => {
  const bulbasaur = pokemonStub({
    id: 1,
    name: 'bulbasaur',
    moves: ['tackle', 'growl', 'vine-whip'],
  })

  it('returns true when no moves selected', () => {
    expect(pokemonKnowsAllMoves(bulbasaur, [])).toBe(true)
  })

  it('requires AND across all selected moves', () => {
    expect(pokemonKnowsAllMoves(bulbasaur, ['tackle'])).toBe(true)
    expect(pokemonKnowsAllMoves(bulbasaur, ['tackle', 'growl'])).toBe(true)
    expect(pokemonKnowsAllMoves(bulbasaur, ['tackle', 'ember'])).toBe(false)
  })
})

describe('filterAndSortCatalog move filters', () => {
  const catalog = [
    pokemonStub({ id: 1, name: 'bulbasaur', moves: ['tackle', 'growl', 'vine-whip'], types: ['grass'] }),
    pokemonStub({ id: 4, name: 'charmander', moves: ['scratch', 'growl', 'ember'], types: ['fire'] }),
    pokemonStub({ id: 7, name: 'squirtle', moves: ['tackle', 'tail-whip', 'water-gun'], types: ['water'] }),
  ]

  it('filters with AND across up to 4 moves and ignores empty slots', () => {
    const filtered = filterAndSortCatalog(
      catalog,
      base({ moves: ['tackle', null, 'growl', null] }),
    )
    expect(filtered.map((p) => p.name)).toEqual(['bulbasaur'])
  })

  it('combines move filters with type filters', () => {
    const filtered = filterAndSortCatalog(
      catalog,
      base({
        types: ['water'],
        moves: ['tackle', null, null, null],
      }),
    )
    expect(filtered.map((p) => p.name)).toEqual(['squirtle'])
  })

  it('returns empty when no pokemon knows all selected moves', () => {
    const filtered = filterAndSortCatalog(
      catalog,
      base({ moves: ['ember', 'water-gun', null, null] }),
    )
    expect(filtered).toEqual([])
  })
})
