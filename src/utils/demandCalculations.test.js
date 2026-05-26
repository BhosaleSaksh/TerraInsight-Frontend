import { describe, it, expect } from 'vitest'
import {
  calculateRowTotal,
  calculateWeeklyTotals,
  getDemandStatusColor,
  sortPlanningItems
} from './demandCalculations'

describe('demandCalculations Utility Functions', () => {
  describe('calculateRowTotal', () => {
    it('should sum an array of numbers correctly', () => {
      expect(calculateRowTotal([10, 20, 30])).toBe(60)
      expect(calculateRowTotal([])).toBe(0)
      expect(calculateRowTotal([0, 0, 0])).toBe(0)
    })
  })

  describe('calculateWeeklyTotals', () => {
    it('should calculate totals for each week across multiple items', () => {
      const items = [
        { weekly_demand: [10, 20, 30] },
        { weekly_demand: [5, 5, 5] }
      ]
      expect(calculateWeeklyTotals(items, 3)).toEqual([15, 25, 35])
    })

    it('should handle empty items array', () => {
      expect(calculateWeeklyTotals([], 3)).toEqual([0, 0, 0])
    })

    it('should fallback missing weekly_demand arrays to zeros', () => {
      const items = [
        { weekly_demand: [10, 20] },
        { } // missing weekly_demand
      ]
      expect(calculateWeeklyTotals(items, 3)).toEqual([10, 20, 0])
    })
  })

  describe('getDemandStatusColor', () => {
    it('should return red for values less than 50% of target', () => {
      expect(getDemandStatusColor(4, 10)).toBe('red')
      expect(getDemandStatusColor(0, 10)).toBe('red')
    })

    it('should return amber for values between 50% and 89% of target', () => {
      expect(getDemandStatusColor(5, 10)).toBe('amber')
      expect(getDemandStatusColor(8, 10)).toBe('amber')
    })

    it('should return green for values >= 90% of target', () => {
      expect(getDemandStatusColor(9, 10)).toBe('green')
      expect(getDemandStatusColor(12, 10)).toBe('green')
    })

    it('should default to green if target is 0 or missing to prevent division by zero panic', () => {
      expect(getDemandStatusColor(10, 0)).toBe('green')
      expect(getDemandStatusColor(10, null)).toBe('green')
    })
  })

  describe('sortPlanningItems', () => {
    const items = [
      { id: 1, item: 'Zebra', weekly_demand: [10] },
      { id: 2, item: 'Apple', weekly_demand: [20] }
    ]

    it('should sort alphabetically ascending', () => {
      const sorted = sortPlanningItems(items, 'item', 'asc')
      expect(sorted[0].item).toBe('Apple')
      expect(sorted[1].item).toBe('Zebra')
    })

    it('should sort alphabetically descending', () => {
      const sorted = sortPlanningItems(items, 'item', 'desc')
      expect(sorted[0].item).toBe('Zebra')
      expect(sorted[1].item).toBe('Apple')
    })

    it('should sort by total demand', () => {
      const sortedAsc = sortPlanningItems(items, 'total', 'asc')
      expect(sortedAsc[0].item).toBe('Zebra') // Total 10
      expect(sortedAsc[1].item).toBe('Apple') // Total 20
    })
  })
})
