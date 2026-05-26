import { Search, SlidersHorizontal, Plus, Download, Upload, RotateCcw } from 'lucide-react'
import { usePlanningStore } from '../../store/usePlanningStore'

export default function FilterBar({ onAddItemClick }) {
  const filters = usePlanningStore((state) => state.filters)
  const updateFilters = usePlanningStore((state) => state.updateFilters)
  const resetFilters = usePlanningStore((state) => state.resetFilters)
  const items = usePlanningStore((state) => state.items)

  // Dynamic unique lists based on active dataset to avoid hardcoded mismatches
  const uniqueCategories = ['all', ...new Set(items.map(item => item.category))]
  const uniqueRegions = ['all', ...new Set(items.map(item => item.region))]

  // Check preset selections using our new multi-select array states
  const isActiveOnly = Array.isArray(filters.status) && filters.status.length === 1 && filters.status[0] === 'active'
  const isPausedOnly = Array.isArray(filters.status) && filters.status.length === 1 && filters.status[0] === 'paused'
  const isAllPresetSelected = filters.category === 'all' && filters.region === 'all' && filters.search === '' && 
    Array.isArray(filters.status) && filters.status.length === 3

  // Export to CSV utility mapped to new fields schema
  const handleExportCSV = () => {
    const headers = 'ID,Item,Category,Region,Target,Status,W1,W2,W3,W4,W5,W6,W7,W8\n'
    const rows = items.map(item => {
      const demandStr = (item.weekly_demand || []).join(',')
      return `${item.id},"${item.item}","${item.category}","${item.region}",${item.target},"${item.status}",${demandStr}`
    }).join('\n')
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `demand_planning_dataset_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
      {/* Top Action & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Presets:
          </span>
          <button 
            onClick={resetFilters}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isAllPresetSelected
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/45 dark:text-indigo-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            All Items
          </button>
          <button 
            onClick={() => updateFilters({ status: ['active'] })}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActiveOnly
                ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/45 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Active SKUs
          </button>
          <button 
            onClick={() => updateFilters({ status: ['paused'] })}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isPausedOnly
                ? 'bg-amber-50 text-amber-650 dark:bg-amber-950/45 dark:text-amber-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Paused SKUs
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={onAddItemClick}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-150/10 dark:shadow-none transition-all duration-150 cursor-pointer active:scale-98"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input bar */}
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search SKU by ID, item name, or category..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Dropdowns and Multi-Select Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Category Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category:</span>
            <select 
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 text-slate-750 dark:text-slate-350 cursor-pointer transition-all duration-150"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Region:</span>
            <select 
              value={filters.region}
              onChange={(e) => updateFilters({ region: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 text-slate-750 dark:text-slate-350 cursor-pointer transition-all duration-150"
            >
              {uniqueRegions.map(reg => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? 'All Regions' : reg}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Select Status Checkboxes Group */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500">Status:</span>
            <div className="flex items-center gap-3">
              {['active', 'paused', 'discontinued'].map((status) => {
                const isChecked = Array.isArray(filters.status) && filters.status.includes(status)
                
                const toggleStatus = () => {
                  let nextStatus = []
                  if (Array.isArray(filters.status)) {
                    if (isChecked) {
                      // Avoid unchecking all boxes completely
                      nextStatus = filters.status.filter(s => s !== status)
                    } else {
                      nextStatus = [...filters.status, status]
                    }
                  } else {
                    nextStatus = [status]
                  }
                  updateFilters({ status: nextStatus })
                }

                return (
                  <label 
                    key={status} 
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                    title={`Toggle ${status} items`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={toggleStatus}
                      className="accent-indigo-600 h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-750 focus:ring-indigo-550 dark:bg-slate-900 transition-all cursor-pointer"
                    />
                    <span className={`text-xs font-semibold capitalize transition-colors duration-150 ${
                      isChecked 
                        ? 'text-indigo-650 dark:text-indigo-400 font-bold' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
                    }`}>
                      {status}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Dedicated Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-750 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Reset search and filters to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}

