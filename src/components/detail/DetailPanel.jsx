import React, { useEffect } from 'react'
import { Calendar, Layers, DollarSign, TrendingUp, AlertTriangle, X, Edit3, BarChart2, Trash2, CheckCircle, HelpCircle } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { usePlanningStore } from '../../store/usePlanningStore'
import { calculateRowTotal, getDemandStatusColor } from '../../utils/demandCalculations'

export default function DetailPanel({ item, onClose, onEditClick }) {
  const deleteItem = usePlanningStore((state) => state.deleteItem)

  // Keyboard accessibility: Escape key closes panel independently
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && item) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [item, onClose])

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-slate-200 bg-white rounded-xl shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
        <div className="rounded-full bg-slate-50 dark:bg-slate-950 p-4 mb-4 text-slate-400 dark:text-slate-600">
          <BarChart2 className="h-10 w-10 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Operational Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mt-2 leading-relaxed">
          Select any planning SKU from the grid to view detailed forecast trends, weekly allocations, target statuses, and baseline variances.
        </p>
      </div>
    )
  }

  // Calculate stats
  const totalDemand = calculateRowTotal(item.weekly_demand)
  const weeksCount = item.weekly_demand?.length || 8
  const averageDemand = weeksCount ? (totalDemand / weeksCount).toFixed(1) : 0
  const avgVal = Number(averageDemand)
  const zeroWeeks = (item.weekly_demand || []).filter(val => val === 0).length

  // Computed tracking status logic
  const getComputedTrackingStatus = (avg, target, zeros) => {
    if (zeros >= 3 || avg < target * 0.5) {
      return {
        label: 'At Risk',
        colorClass: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400',
        badgeColor: 'bg-rose-500',
        desc: 'Alert: High frequency of zero-demand weeks or average performance is under 50% of targeted baseline.'
      }
    } else if (avg < target * 0.9) {
      return {
        label: 'Below Target',
        colorClass: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400',
        badgeColor: 'bg-amber-500',
        desc: 'Warning: Average weekly demand is moderately trailing behind operational target metrics.'
      }
    } else {
      return {
        label: 'On Target',
        colorClass: 'border-emerald-255 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400',
        badgeColor: 'bg-emerald-500',
        desc: 'Optimal: SKU is performing on or above targets with consistent operational demand.'
      }
    }
  }

  const tracking = getComputedTrackingStatus(avgVal, item.target, zeroWeeks)

  // Chart data structure
  const chartData = (item.weekly_demand || []).map((demand, index) => ({
    name: `W${index + 1}`,
    Demand: demand,
  }))

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete SKU #${item.id} (${item.item})?`)) {
      deleteItem(item.id)
      onClose()
    }
  }

  return (
    <div className="h-full flex flex-col border border-slate-200 bg-white rounded-xl shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-all duration-300 transform translate-x-0 opacity-100 ease-out">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/40">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {item.category} • {item.region}
          </span>
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 truncate max-w-[180px] mt-0.5" title={item.item}>
            {item.item}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            title="Delete SKU"
            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Panel (Esc)"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-thin">
        {/* SKU Identity Card */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">SKU ID</p>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">#{item.id}</p>
          </div>
          <button
            onClick={() => onEditClick(item)}
            className="flex items-center gap-1.5 rounded bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 transition-all cursor-pointer active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit SKU
          </button>
        </div>

        {/* Compact Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-lg p-3 transition-all duration-150 hover:shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Total Demand</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{totalDemand} units</p>
          </div>
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-lg p-3 transition-all duration-150 hover:shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Avg Demand</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{avgVal} u/wk</p>
          </div>
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-lg p-3 transition-all duration-150 hover:shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Baseline Target</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{item.target} units</p>
          </div>
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-lg p-3 transition-all duration-150 hover:shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Zero-Demand Wks</p>
            <p className={`text-sm font-black mt-1 ${zeroWeeks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {zeroWeeks} {zeroWeeks === 1 ? 'week' : 'weeks'}
            </p>
          </div>
        </div>

        {/* Computed Tracking Status Pill Banner */}
        <div className={`rounded-xl border p-3.5 flex items-start gap-3 transition-all duration-200 ${tracking.colorClass}`}>
          <div className={`mt-0.5 rounded-full p-1.5 ${
            tracking.label === 'On Target' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' 
              : tracking.label === 'Below Target'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
          }`}>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Tracking status</span>
              <span className={`h-1.5 w-1.5 rounded-full ${tracking.badgeColor} animate-pulse`}></span>
              <span className="text-xs font-black uppercase tracking-wider">{tracking.label}</span>
            </div>
            <p className="text-[10.5px] mt-1 leading-relaxed opacity-95">
              {tracking.desc}
            </p>
          </div>
        </div>

        {/* Recharts Weekly Demand Trend Chart */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3.5 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-indigo-550" />
            Weekly Demand Curve
          </h4>
          <div className="h-48 w-full relative bg-slate-50/20 dark:bg-slate-950/20 rounded-lg p-2 border border-slate-100/50 dark:border-slate-850">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemandNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="Demand" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemandNew)" />
                <ReferenceLine y={item.target} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Target', position: 'top', fill: '#d97706', fontSize: 8, fontWeight: 'bold' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Allocation Indicators List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Weekly Forecast Breakdowns
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(item.weekly_demand || []).map((demand, idx) => {
              const color = getDemandStatusColor(demand, item.target)
              
              // Slick theme color presets matching the demand status rules
              const colorClasses = 
                color === 'green' ? 'bg-emerald-50/50 text-emerald-800 border-emerald-150/40 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/30' :
                color === 'amber' ? 'bg-amber-50/50 text-amber-800 border-amber-150/40 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-900/30' :
                'bg-rose-50/50 text-rose-800 border-rose-150/45 dark:bg-rose-950/15 dark:text-rose-400 dark:border-rose-900/30'

              return (
                <div 
                  key={idx} 
                  className={`rounded-lg border p-2 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${colorClasses}`}
                  title={`W${idx + 1} Demand Status: ${color}`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">W{idx + 1}</p>
                  <p className="text-xs font-black mt-0.5">{demand}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

