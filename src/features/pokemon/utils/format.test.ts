import { describe, expect, it } from 'vitest'
import type { Pokemon } from '@/features/pokemon/types'
import {
  filterByGeneration,
  formatPokemonId,
  matchesPokemonSearch,
  sortPokemon,
} from './format'

function poke(partial: Partial<Pokemon> & Pick<Pokemon, 'id' | 'name'>): Pokemon {
  return {
    base_experience: 0,
    height: 10,
    weight: 100,
    order: partial.id,
    sprites: { front_default: null },
    types: [],
    stats: [],
    abilities: [],
    moves: [],
    species: { name: partial.name, url: '' },
    forms: [],
    ...partial,
  }
}

describe('formatPokemonId', () => {
  it('pads to 3 digits', () => {
    expect(formatPokemonId(6)).toBe('#006')
    expect(formatPokemonId(25)).toBe('#025')
    expect(formatPokemonId(1000)).toBe('#1000')
  })
})

describe('matchesPokemonSearch', () => {
  const charizard = poke({ id: 6, name: 'charizard' })
  const mrMime = poke({ id: 122, name: 'mr-mime' })

  it('empty query matches all', () => {
    expect(matchesPokemonSearch(charizard, '  ')).toBe(true)
  })

  it('matches name and dex number', () => {
    expect(matchesPokemonSearch(charizard, 'char')).toBe(true)
    expect(matchesPokemonSearch(charizard, '#006')).toBe(true)
    expect(matchesPokemonSearch(charizard, '6')).toBe(true)
    expect(matchesPokemonSearch(charizard, 'pikachu')).toBe(false)
  })

  it('matches hyphenated names by space', () => {
    expect(matchesPokemonSearch(mrMime, 'mr mime')).toBe(true)
  })
})

describe('filterByGeneration', () => {
  const list = [
    poke({ id: 1, name: 'bulbasaur' }),
    poke({ id: 152, name: 'chikorita' }),
    poke({ id: 906, name: 'sprigatito' }),
  ]

  it('returns all when generation is null', () => {
    expect(filterByGeneration(list, null)).toHaveLength(3)
  })

  it('keeps ids inside the gen range', () => {
    expect(filterByGeneration(list, 1).map((p) => p.name)).toEqual(['bulbasaur'])
    expect(filterByGeneration(list, 2).map((p) => p.name)).toEqual(['chikorita'])
    expect(filterByGeneration(list, 9).map((p) => p.name)).toEqual(['sprigatito'])
  })
})

describe('sortPokemon', () => {
  const list = [
    poke({ id: 4, name: 'charmander' }),
    poke({ id: 1, name: 'bulbasaur' }),
  ]

  it('sorts by id and name', () => {
    expect(sortPokemon(list, 'id').map((p) => p.id)).toEqual([1, 4])
    expect(sortPokemon(list, 'name').map((p) => p.name)).toEqual([
      'bulbasaur',
      'charmander',
    ])
    expect(sortPokemon(list, 'id', 'desc').map((p) => p.id)).toEqual([4, 1])
  })
})
