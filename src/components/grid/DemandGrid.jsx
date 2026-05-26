import React, { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { getDemandStatusColor, calculateRowTotal, calculateWeeklyTotals } from '../../utils/demandCalculations'
import { usePlanningStore } from '../../store/usePlanningStore'

export default function DemandGrid({ items = [], weeks = [], selectedItemId, onSelectItem }) {
  const [editingCell, setEditingCell] = useState(null) // { itemId, weekIndex }
  const [tempValue, setTempValue] = useState('')
  
  const updateItem = usePlanningStore((state) => state.updateItem)
  const sorting = usePlanningStore((state) => state.sorting)
  const setSorting = usePlanningStore((state) => state.setSorting)

  // Status pill styling mappings matching active -> green, paused -> amber, discontinued -> red/gray
  const getStatusPill = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-250 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-250 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Paused
          </span>
        )
      case 'discontinued':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-405 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-slate-500"></span>
            Discontinued
          </span>
        )
    }
  }

  // Cell conditional styling based on performance target
  // - Green: demand >= 90% of target
  // - Amber: demand between 50% and 89%
  // - Red: demand < 50% OR zero
  const getCellClasses = (colorStatus) => {
    switch (colorStatus) {
      case 'green':
        return 'bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/15 dark:text-emerald-400 border-emerald-100/30 dark:border-emerald-900/20'
      case 'amber':
        return 'bg-amber-50/40 text-amber-800 dark:bg-amber-950/15 dark:text-amber-400 border-amber-100/30 dark:border-amber-900/20'
      case 'red':
      default:
        return 'bg-rose-50/40 text-rose-700 dark:bg-rose-950/15 dark:text-rose-400 border-rose-100/30 dark:border-rose-900/20'
    }
  }

  // Inline Cell Editing Handlers
  const handleCellClick = (e, item, weekIndex, currentValue) => {
    e.stopPropagation()
    setEditingCell({ itemId: item.id, weekIndex })
    setTempValue(currentValue.toString())
  }

  const handleCellSave = (item, weekIndex) => {
    const val = Number(tempValue)
    if (!isNaN(val) && val >= 0) {
      const updatedDemand = [...item.weekly_demand]
      updatedDemand[weekIndex] = val
      updateItem(item.id, { weekly_demand: updatedDemand })
    }
    setEditingCell(null)
  }

  const handleKeyDown = (e, item, weekIndex) => {
    if (e.key === 'Enter') {
      handleCellSave(item, weekIndex)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  // 1. Implement Dynamic Weekly Columns based on either weeks prop or the max weekly_demand length in items.
  const maxWeeksCount = items.reduce((max, item) => Math.max(max, (item.weekly_demand || []).length), 0)
  const displayWeeks = weeks && weeks.length > 0 
    ? weeks 
    : Array.from({ length: maxWeeksCount || 8 }, (_, idx) => `W${idx + 1}`)

  // 2. Compute Weekly Totals and grand total
  const weeklyTotals = calculateWeeklyTotals(items, displayWeeks.length)
  const grandTotal = weeklyTotals.reduce((acc, sum) => acc + sum, 0)

  // Dynamic header sorting renderer with indicator arrows and hover states
  const renderSortHeader = (label, key, className = '') => {
    const isSorted = sorting.key === key
    const indicator = isSorted ? (sorting.order === 'asc' ? ' ▲' : ' ▼') : ''
    
    return (
      <th 
        scope="col" 
        onClick={() => setSorting(key)}
        className={`py-4 cursor-pointer select-none group transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-205 ${className} ${
          isSorted ? 'text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/10' : ''
        }`}
      >
        <div className={`flex items-center gap-1.5 ${
          className.includes('text-right') 
            ? 'justify-end' 
            : className.includes('text-center') 
              ? 'justify-center' 
              : ''
        }`}>
          <span>{label}</span>
          <span className={`text-[9px] transition-all duration-200 ${
            isSorted ? 'opacity-100 scale-110 font-black' : 'opacity-0 group-hover:opacity-40'
          }`}>
            {isSorted ? indicator : ' ▲'}
          </span>
        </div>
      </th>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
      {/* Scrollable table container with sticky header support */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin">
        <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400 relative">
          {/* Table Header (Sticky) */}
          <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-20 backdrop-blur-sm shadow-sm">
            <tr>
              {renderSortHeader('Item', 'item', 'px-6 min-w-[180px]')}
              {renderSortHeader('Category', 'category', 'px-6')}
              {renderSortHeader('Region', 'region', 'px-6')}
              {renderSortHeader('Status', 'status', 'px-6 text-center')}
              {displayWeeks.map((week) => 
                renderSortHeader(week, week, 'px-3 text-right min-w-[75px]')
              )}
              {renderSortHeader('Total', 'total', 'px-6 text-right min-w-[95px] font-extrabold text-slate-750 dark:text-slate-300')}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5 + displayWeeks.length} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No operational items registered.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = String(item.id) === String(selectedItemId)
                const rowTotal = calculateRowTotal(item.weekly_demand)

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`group cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all duration-150 ${
                      isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/15 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    {/* Item Name */}
                    <td className={`px-6 py-4 ${sorting.key === 'item' ? 'bg-indigo-50/5 dark:bg-indigo-950/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {item.item}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                          SKU #{item.id}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className={`px-6 py-4 text-slate-500 dark:text-slate-400 font-medium ${sorting.key === 'category' ? 'bg-indigo-50/5 dark:bg-indigo-950/5' : ''}`}>
                      {item.category}
                    </td>

                    {/* Region */}
                    <td className={`px-6 py-4 text-slate-500 dark:text-slate-400 font-medium ${sorting.key === 'region' ? 'bg-indigo-50/5 dark:bg-indigo-950/5' : ''}`}>
                      {item.region}
                    </td>

                    {/* Status Pill */}
                    <td className={`px-6 py-4 text-center ${sorting.key === 'status' ? 'bg-indigo-50/5 dark:bg-indigo-950/5' : ''}`}>
                      <div className="inline-flex justify-center w-full">
                        {getStatusPill(item.status)}
                      </div>
                    </td>

                    {/* Weekly Projections with Aligned Numeric Columns */}
                    {displayWeeks.map((weekName, idx) => {
                      const val = item.weekly_demand[idx] || 0
                      const colorStatus = getDemandStatusColor(val, item.target)
                      const isEditing = editingCell?.itemId === item.id && editingCell?.weekIndex === idx
                      const isSortedColumn = sorting.key === weekName

                      return (
                        <td
                          key={idx}
                          className={`px-3 py-3 text-right text-xs font-semibold border-x border-slate-100/30 dark:border-slate-800/30 relative transition-colors ${getCellClasses(colorStatus)} ${
                            isSortedColumn ? 'ring-1 ring-inset ring-indigo-500/30 dark:ring-indigo-400/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-end">
                            {isEditing ? (
                              <input
                                type="number"
                                autoFocus
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={() => handleCellSave(item, idx)}
                                onKeyDown={(e) => handleKeyDown(e, item, idx)}
                                className="w-14 text-right rounded border border-indigo-500 bg-white text-slate-900 py-0.5 px-1 outline-none font-bold shadow-sm"
                              />
                            ) : (
                              <span 
                                onClick={(e) => handleCellClick(e, item, idx, val)}
                                className="px-1.5 py-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/60 cursor-text flex items-center gap-1 select-none transition-all"
                                title="Click to modify weekly demand"
                              >
                                {val}
                                <Edit2 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}

                    {/* Row Total */}
                    <td className={`px-6 py-4 text-right font-bold text-slate-850 dark:text-slate-200 transition-colors ${
                      sorting.key === 'total' 
                        ? 'bg-indigo-100/25 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-inner' 
                        : 'bg-slate-50/20 dark:bg-slate-900/10 text-slate-800'
                    }`}>
                      {rowTotal}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {/* Visually Distinct and Sticky Summary Row */}
          {items.length > 0 && (
            <tfoot className="border-t-2 border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/30 dark:bg-indigo-950/30 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur-sm">
              <tr className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                <td className="px-6 py-4 font-bold bg-indigo-50/40 dark:bg-indigo-950/40" colSpan={4}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span>Weekly Demand Totals</span>
                  </div>
                </td>
                {weeklyTotals.map((total, idx) => (
                  <td key={idx} className="px-3 py-4 text-right font-extrabold bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-150/40 dark:border-indigo-900/30">
                    {total}
                  </td>
                ))}
                <td className="px-6 py-4 text-right font-black text-indigo-700 dark:text-indigo-400 bg-indigo-100/40 dark:bg-indigo-950/55">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

