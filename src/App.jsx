import React, { useState, useMemo, useEffect } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import FilterBar from './components/filters/FilterBar'
import DemandGrid from './components/grid/DemandGrid'
import SummaryRow from './components/grid/SummaryRow'
import DetailPanel from './components/detail/DetailPanel'
import AddItemModal from './components/forms/AddItemModal'
import { usePlanningStore } from './store/usePlanningStore'
import { mockPlanningWeeks } from './data/mockData'
import { sortPlanningItems } from './utils/demandCalculations'

function App() {
  const items = usePlanningStore((state) => state.items)
  const selectedItem = usePlanningStore((state) => state.selectedItem)
  const filters = usePlanningStore((state) => state.filters)
  const sorting = usePlanningStore((state) => state.sorting)
  const selectItem = usePlanningStore((state) => state.selectItem)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state for UX polish when filters/sorting change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [filters, sorting])

  // Derived filtered & sorted items (memoized for performance)
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // 1. Search Query Match
      const matchesSearch =
        filters.search === '' ||
        String(item.id).toLowerCase().includes(filters.search.toLowerCase()) ||
        item.item.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.category.toLowerCase().includes(filters.search.toLowerCase())
      
      // 2. Category Match
      const matchesCategory = filters.category === 'all' || item.category === filters.category
      
      // 3. Region Match
      const matchesRegion = filters.region === 'all' || item.region === filters.region

      // 4. Status Match (supports both array multi-select and string fallbacks)
      const matchesStatus =
        filters.status === 'all' ||
        (Array.isArray(filters.status) && (filters.status.length === 0 || filters.status.includes(item.status))) ||
        filters.status === item.status

      return matchesSearch && matchesCategory && matchesRegion && matchesStatus
    })

    // Now sort the filtered items utilizing our clean reusable utility
    return sortPlanningItems(filtered, sorting.key, sorting.order)
  }, [items, filters.search, filters.category, filters.region, filters.status, sorting.key, sorting.order])

  const handleSelectItem = (item) => {
    selectItem(item.id)
  }

  const handleCloseDetail = () => {
    selectItem(null)
  }

  const handleOpenAddItem = () => {
    setItemToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditItem = (item) => {
    setItemToEdit(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setItemToEdit(null)
  }

  return (
    <DashboardLayout>
      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left/Main Column: Filters, Metrics, and Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Top Filter & Action Bar */}
          <FilterBar onAddItemClick={handleOpenAddItem} />

          {/* Aggregated KPI Summary Row */}
          <SummaryRow items={filteredItems} weeks={mockPlanningWeeks} />

          {/* Main Demand Planning Grid */}
          <DemandGrid
            items={filteredItems}
            weeks={mockPlanningWeeks}
            selectedItemId={selectedItem?.id}
            onSelectItem={handleSelectItem}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side Drawer / Detail Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-[88px] h-auto lg:h-[calc(100vh-120px)]">
          <DetailPanel
            item={selectedItem}
            onClose={handleCloseDetail}
            onEditClick={handleOpenEditItem}
          />
        </div>
      </div>

      {/* Add / Edit Item Dialog Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        itemToEdit={itemToEdit}
      />
    </DashboardLayout>
  )
}

export default App
