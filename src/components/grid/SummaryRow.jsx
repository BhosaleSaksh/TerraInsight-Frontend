import { Layers, Activity, TrendingUp, Tag } from 'lucide-react'
import { calculateWeeklyTotals } from '../../utils/demandCalculations'

export default function SummaryRow({ items = [], weeks = [] }) {
  // Compute aggregates
  const totalSKUs = items.length
  const activeCount = items.filter(item => item.status === 'active').length
  const categoriesCount = new Set(items.map(item => item.category)).size
  
  // Weekly demand totals
  const weeklyDemandTotals = calculateWeeklyTotals(items, weeks.length)
  const totalDemandAllWeeks = weeklyDemandTotals.reduce((acc, val) => acc + val, 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300">
      {/* KPI 1: Total Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Items</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {totalSKUs}
            </h3>
          </div>
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-2.5 text-indigo-600 dark:text-indigo-400 transition-all duration-200 group-hover:scale-110">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Distinct SKUs in grid
        </p>
      </div>

      {/* KPI 2: Active Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-within:ring-2 focus-within:ring-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Items</p>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">
              {activeCount}
            </h3>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-emerald-600 dark:text-emerald-400 transition-all duration-200 group-hover:scale-110">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Active operational monitors
        </p>
      </div>

      {/* KPI 3: Total Weekly Demand */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Weekly Demand</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {totalDemandAllWeeks.toLocaleString()}
            </h3>
          </div>
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-2.5 text-indigo-600 dark:text-indigo-400 transition-all duration-200 group-hover:scale-110">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Combined forecast quantity
        </p>
      </div>

      {/* KPI 4: Categories Count */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-within:ring-2 focus-within:ring-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categories Count</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {categoriesCount}
            </h3>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2.5 text-amber-600 dark:text-amber-400 transition-all duration-200 group-hover:scale-110">
            <Tag className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Product segments monitored
        </p>
      </div>
    </div>
  )
}
