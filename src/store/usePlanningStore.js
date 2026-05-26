import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { demandData } from '../data/demandData'

export const usePlanningStore = create(
  persist(
    (set) => ({
      // 1. Initial State
      items: demandData,
      selectedItem: demandData[0] || null, // default to first item if available
      filters: {
        search: '',
        category: 'all',
        region: 'all',
        status: ['active', 'paused', 'discontinued'],
      },
      sorting: {
        key: 'id',
        order: 'asc', // 'asc' | 'desc'
      },
      modalState: {
        isOpen: false,
        type: 'add', // 'add' | 'edit'
        item: null,
      },

      // 2. Actions
      // Add a new planning item and auto-select it
      addItem: (newItem) => set((state) => {
        // Fallback for ID generation if not provided
        const newId = newItem.id || (state.items.length > 0 
          ? Math.max(...state.items.map(item => Number(item.id) || 0)) + 1 
          : 1)

        const itemToAdd = {
          ...newItem,
          id: newId
        }

        return {
          items: [itemToAdd, ...state.items],
          selectedItem: itemToAdd
        }
      }),

      // Select an item by its ID or by passing the object itself
      selectItem: (itemOrId) => set((state) => {
        if (itemOrId === null) {
          return { selectedItem: null }
        }
        
        if (typeof itemOrId === 'object' && itemOrId.id !== undefined) {
          return { selectedItem: itemOrId }
        }

        const foundItem = state.items.find(item => item.id === itemOrId || String(item.id) === String(itemOrId))
        return { selectedItem: foundItem || null }
      }),

      // Merge new filter criteria into filters object
      updateFilters: (updatedFilters) => set((state) => ({
        filters: {
          ...state.filters,
          ...updatedFilters
        }
      })),

      // Reset all filter settings to defaults
      resetFilters: () => set({
        filters: {
          search: '',
          category: 'all',
          region: 'all',
          status: ['active', 'paused', 'discontinued'],
        }
      }),

      // Configure sorting columns and toggle directions
      setSorting: (key) => set((state) => {
        const isSameKey = state.sorting.key === key
        const newOrder = isSameKey && state.sorting.order === 'asc' ? 'desc' : 'asc'
        return {
          sorting: {
            key,
            order: newOrder
          }
        }
      }),

      // Set modal state (helper for managing forms layout dynamically)
      setModalState: (updatedModalState) => set((state) => ({
        modalState: {
          ...state.modalState,
          ...updatedModalState
        }
      })),

      // Update an item's fields (supporting inline edits or modal saves)
      updateItem: (itemId, updatedFields) => set((state) => {
        const updatedItems = state.items.map((item) => {
          if (item.id === itemId || String(item.id) === String(itemId)) {
            return {
              ...item,
              ...updatedFields
            }
          }
          return item
        })

        // Also keep the active selectedItem object synchronized if it was updated
        const currentSelected = state.selectedItem
        const updatedSelected = currentSelected && (currentSelected.id === itemId || String(currentSelected.id) === String(itemId))
          ? { ...currentSelected, ...updatedFields }
          : currentSelected

        return {
          items: updatedItems,
          selectedItem: updatedSelected
        }
      }),

      // Delete an item from the matrix
      deleteItem: (itemId) => set((state) => {
        const filteredItems = state.items.filter(item => item.id !== itemId && String(item.id) !== String(itemId))
        
        // Reset or select fallback item if the deleted SKU was selected
        const wasSelected = state.selectedItem && (state.selectedItem.id === itemId || String(state.selectedItem.id) === String(itemId))
        const nextSelected = wasSelected ? (filteredItems[0] || null) : state.selectedItem

        return {
          items: filteredItems,
          selectedItem: nextSelected
        }
      })
    }),
    {
      name: 'demand-planning-storage',
      // Only persist the actual operational planning items array
      partialize: (state) => ({
        items: state.items
      }),
    }
  )
)
