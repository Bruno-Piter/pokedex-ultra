import { describe, expect, it } from 'vitest'
import { countActiveFilters, hasActiveFilters, type FilterState } from './filter-utils'

function base(overrides: Partial<FilterState> = {}): FilterState {
  return {
    types: [],
    sort: 'id',
    sortDirection: 'asc',
    statSortDirection: 'asc',
    generation: null,
    statSort: [],
    search: '',
    ...overrides,
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
})
