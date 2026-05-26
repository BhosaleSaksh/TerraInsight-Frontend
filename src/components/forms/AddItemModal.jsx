import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, ClipboardList, PlusCircle, Save } from 'lucide-react'
import { usePlanningStore } from '../../store/usePlanningStore'

const planningItemSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer').optional().or(z.literal('')),
  item: z.string().min(1, 'Item name is required'),
  category: z.enum(['Electronics', 'Textiles', 'Chemicals', 'Furniture', 'Pharma'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  region: z.enum(['North', 'South', 'East', 'West'], {
    errorMap: () => ({ message: 'Please select a valid region' }),
  }),
  target: z.coerce.number().int().positive('Target must be a positive integer (greater than 0)'),
  status: z.enum(['active', 'paused', 'discontinued'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  w1: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w2: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w3: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w4: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w5: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w6: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w7: z.coerce.number().int().nonnegative('Must be 0 or greater'),
  w8: z.coerce.number().int().nonnegative('Must be 0 or greater'),
})

export default function AddItemModal({ isOpen, onClose, itemToEdit = null }) {
  const addItem = usePlanningStore((state) => state.addItem)
  const updateItem = usePlanningStore((state) => state.updateItem)

  const isEditMode = !!itemToEdit

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planningItemSchema),
    defaultValues: {
      id: '',
      item: '',
      category: 'Electronics',
      region: 'North',
      target: 100,
      status: 'active',
      w1: 0,
      w2: 0,
      w3: 0,
      w4: 0,
      w5: 0,
      w6: 0,
      w7: 0,
      w8: 0,
    },
  })

  // Prefill fields when editing an existing item
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        reset({
          id: itemToEdit.id,
          item: itemToEdit.item,
          category: itemToEdit.category,
          region: itemToEdit.region,
          target: itemToEdit.target,
          status: itemToEdit.status,
          w1: itemToEdit.weekly_demand[0] || 0,
          w2: itemToEdit.weekly_demand[1] || 0,
          w3: itemToEdit.weekly_demand[2] || 0,
          w4: itemToEdit.weekly_demand[3] || 0,
          w5: itemToEdit.weekly_demand[4] || 0,
          w6: itemToEdit.weekly_demand[5] || 0,
          w7: itemToEdit.weekly_demand[6] || 0,
          w8: itemToEdit.weekly_demand[7] || 0,
        })
      } else {
        reset({
          id: '',
          item: '',
          category: 'Electronics',
          region: 'North',
          target: 100,
          status: 'active',
          w1: 0,
          w2: 0,
          w3: 0,
          w4: 0,
          w5: 0,
          w6: 0,
          w7: 0,
          w8: 0,
        })
      }
    }
  }, [itemToEdit, isOpen, reset])

  // Escape key closes modal independently
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const onSubmit = (data) => {
    const weeklyDemand = [
      Number(data.w1),
      Number(data.w2),
      Number(data.w3),
      Number(data.w4),
      Number(data.w5),
      Number(data.w6),
      Number(data.w7),
      Number(data.w8),
    ]

    if (isEditMode) {
      const updatedFields = {
        item: data.item,
        category: data.category,
        region: data.region,
        target: Number(data.target),
        status: data.status,
        weekly_demand: weeklyDemand,
      }

      updateItem(itemToEdit.id, updatedFields)
    } else {
      const newItem = {
        id: data.id ? Number(data.id) : undefined,
        item: data.item,
        category: data.category,
        region: data.region,
        target: Number(data.target),
        status: data.status,
        weekly_demand: weeklyDemand,
      }
      addItem(newItem)
    }
    
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden max-h-[90vh] flex flex-col transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/45 dark:text-indigo-400">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {isEditMode ? 'Edit Planning Item' : 'Add New Planning Item'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isEditMode ? `Modifying configurations for SKU #${itemToEdit.id}` : 'Insert a new SKU into the demand planning matrix'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto flex flex-col scrollbar-thin">
          <div className="p-6 space-y-6 flex-1">
            {/* Section 1: Item Basic Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Basic Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Item ID (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Auto-generated"
                    disabled={isEditMode}
                    {...register('id')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:cursor-not-allowed"
                  />
                  {errors.id && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.id.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Product Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Pharma">Pharma</option>
                  </select>
                  {errors.category && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.category.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Source Region *
                  </label>
                  <select
                    {...register('region')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                  {errors.region && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.region.message}</span>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Display Panel Modules 15-inch"
                    {...register('item')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200"
                  />
                  {errors.item && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.item.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Demand Controls */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Planning Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Baseline Target Demand *
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    {...register('target')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200"
                  />
                  {errors.target && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.target.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Planning Status *
                  </label>
                  <select
                    {...register('status')}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                  {errors.status && (
                    <span className="text-[11px] font-medium text-rose-500 mt-1 block">{errors.status.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Initial Weekly Demands (W1 - W8) */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Weekly Demand Forecast Initializer (W1 - W8)
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'].map((wKey, idx) => (
                  <div key={idx} className="min-w-0">
                    <label className="block text-center text-xs font-semibold text-slate-555 dark:text-slate-400 mb-1 uppercase font-mono">
                      {wKey}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      {...register(wKey)}
                      className="w-full text-center rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                    />
                    {errors[wKey] && (
                      <span className="text-[9px] text-center font-medium text-rose-500 mt-0.5 block truncate" title={errors[wKey].message}>{errors[wKey].message}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950/40">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 dark:shadow-none transition-all cursor-pointer active:scale-95"
            >
              {isEditMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add SKU
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

