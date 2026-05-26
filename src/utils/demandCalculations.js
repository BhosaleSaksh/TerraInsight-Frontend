/**
 * Utility functions for demand planning calculations and style conditions
 */

/**
 * Determines the demand performance category based on a value compared to its target.
 * - Green: demand >= 90% of target
 * - Amber: demand between 50% and 89% of target
 * - Red: demand < 50% of target OR demand is exactly zero
 * 
 * @param {number} demand - The current week's demand value
 * @param {number} target - The item's target demand
 * @returns {'green' | 'amber' | 'red'}
 */
export const getDemandStatusColor = (demand, target) => {
  if (demand === 0) return 'red'
  if (!target || target === 0) return 'green'
  
  const percentage = (demand / target) * 100
  
  if (percentage >= 90) {
    return 'green'
  } else if (percentage >= 50) {
    return 'amber'
  } else {
    return 'red'
  }
}

/**
 * Sums an array of demand values
 * @param {number[]} weeklyDemand - Array of numbers
 * @returns {number} Total sum
 */
export const calculateRowTotal = (weeklyDemand) => {
  return (weeklyDemand || []).reduce((acc, val) => acc + val, 0)
}

/**
 * Computes the total demand for each week across a collection of items
 * @param {Object[]} items - Array of planning items
 * @param {number} weeksCount - Number of planning weeks (default 8)
 * @returns {number[]} Array containing the sum for each week index
 */
export const calculateWeeklyTotals = (items = [], weeksCount = 8) => {
  const weeklyTotals = Array(weeksCount).fill(0)
  
  items.forEach((item) => {
    const demand = item.weekly_demand || []
    for (let i = 0; i < weeksCount; i++) {
      weeklyTotals[i] += (demand[i] || 0)
    }
  })
  
  return weeklyTotals
}

/**
 * Sorts planning items based on a sorting key and order.
 * Supports string fields, numeric ID, weekly columns (W1-WN), and total sums.
 * 
 * @param {Object[]} items - Array of planning items
 * @param {string} key - Sorting key (e.g., 'item', 'category', 'W1', 'total')
 * @param {'asc' | 'desc'} order - Sorting order
 * @returns {Object[]} Sorted array
 */
export const sortPlanningItems = (items = [], key = 'id', order = 'asc') => {
  if (!key) return items

  const sorted = [...items]
  
  sorted.sort((a, b) => {
    let valA, valB

    if (key.startsWith('W') && !isNaN(Number(key.slice(1)))) {
      // Weekly demand index sorting (W1, W2, etc.)
      const idx = Number(key.slice(1)) - 1
      valA = (a.weekly_demand || [])[idx] || 0
      valB = (b.weekly_demand || [])[idx] || 0
    } else if (key === 'total') {
      // Row total sorting
      valA = calculateRowTotal(a.weekly_demand)
      valB = calculateRowTotal(b.weekly_demand)
    } else if (key === 'id' || key === 'target') {
      // Numeric fields
      valA = Number(a[key]) || 0
      valB = Number(b[key]) || 0
    } else {
      // String fields (item name, category, region, status)
      valA = String(a[key] || '').toLowerCase()
      valB = String(b[key] || '').toLowerCase()
    }

    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })

  return sorted
}

