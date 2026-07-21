/**
 * useResizableWidth Hook
 * 
 * Purpose: Provides resizable width functionality for panels/slideovers with drag-to-resize capability
 * Used in: components/ui/SlideOver.tsx, app/development/resizable-panel/components/ResizablePanelDemo.tsx
 * Why: Enables users to customize panel width by dragging the left edge, with automatic localStorage persistence
 * 
 * Function Index:
 * useResizableWidth: Main hook that manages resizable width state and drag interactions
 *   - Input: UseResizableWidthOptions (defaultWidth, minWidth, maxWidth, onWidthChange)
 *   - Output: { width, isResizing, panelRef, handleMouseDown, resetWidth }
 * 
 * Steps:
 * 1. Initialize width from localStorage or default value (supports vw, %, px, or number)
 * 2. Set up mouse event handlers for drag-to-resize functionality
 * 3. Calculate new width based on mouse position during drag
 * 4. Apply min/max constraints to ensure valid width values
 * 5. Save width to localStorage when resizing stops (prevents excessive writes during drag)
 * 6. Provide reset function to restore default width and clear localStorage
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'

// localStorage key for persisting panel width across page refreshes
export const RIGHT_DRAWER_WIDTH_STORAGE_KEY = 'mindfree-panel-width'

/**
 * Options for configuring the resizable width hook
 */
interface UseResizableWidthOptions {
  /** Default width - can be a number (px) or string (vw, %, px). Defaults to '50vw' */
  defaultWidth?: number | string
  /** Minimum width in pixels. Defaults to 400px */
  minWidth?: number
  /** Maximum width in pixels. If undefined, defaults to 90% of viewport width */
  maxWidth?: number
  /** Optional callback fired when width changes */
  onWidthChange?: (width: number) => void
}

/**
 * Hook return type
 */
interface UseResizableWidthReturn {
  /** Current width in pixels */
  width: number
  /** Boolean indicating if user is currently dragging to resize */
  isResizing: boolean
  /** Ref to attach to the panel element */
  panelRef: RefObject<HTMLElement | null>
  /** Mouse down handler to attach to the resize handle */
  handleMouseDown: (e: ReactMouseEvent) => void
  /** Function to reset width to default and clear localStorage */
  resetWidth: () => void
}

/**
 * Custom hook for managing resizable panel width with drag-to-resize and localStorage persistence
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing width state, resize handlers, and panel ref
 * 
 * @example
 * ```tsx
 * const { width, isResizing, panelRef, handleMouseDown, resetWidth } = useResizableWidth({
 *   defaultWidth: '50vw',
 *   minWidth: 400,
 *   maxWidth: undefined,
 *   onWidthChange: (newWidth) => console.log('Width changed:', newWidth)
 * })
 * ```
 */
export function useResizableWidth(options: UseResizableWidthOptions = {}): UseResizableWidthReturn {
  //////////////////////////////////
  // Configuration: Extract and set default values for hook options
  //////////////////////////////////
  const {
    defaultWidth = '25vw', // Default to 25% of viewport width
    minWidth = 400, // Minimum width constraint in pixels
    maxWidth, // Optional maximum width constraint
    onWidthChange, // Optional callback for width changes
  } = options

  //////////////////////////////////
  // Width Conversion: Convert defaultWidth string (vw, %, px) to pixels
  // Why: Allows flexible default width specification (vw for responsive, px for fixed)
  // How: Parses string format and calculates pixel value based on viewport dimensions
  //////////////////////////////////
  const getDefaultWidthInPx = useCallback(() => {
    // If already a number, return as-is (assumed to be in pixels)
    if (typeof defaultWidth === 'number') {
      return defaultWidth
    }

    // Only calculate if window is available (client-side)
    if (typeof window !== 'undefined') {
      // Handle viewport width units (e.g., "50vw")
      if (defaultWidth.endsWith('vw')) {
        const vwValue = parseFloat(defaultWidth)
        return (window.innerWidth * vwValue) / 100
      }
      // Handle percentage units (e.g., "50%")
      if (defaultWidth.endsWith('%')) {
        const percentValue = parseFloat(defaultWidth)
        return (window.innerWidth * percentValue) / 100
      }
      // Handle pixel units (e.g., "800px")
      if (defaultWidth.endsWith('px')) {
        return parseFloat(defaultWidth)
      }
    }

    // Fallback: 50vw calculation or 800px for SSR
    return typeof window !== 'undefined' ? window.innerWidth * 0.5 : 800
  }, [defaultWidth])
  // Why useCallback: Memoizes the conversion function to prevent unnecessary recalculations
  // How it helps: Only recalculates when defaultWidth changes, not on every render

  //////////////////////////////////
  // State Initialization: Load width from localStorage or use default
  // Why: Persist user's preferred width across page refreshes
  // How: Checks localStorage first, validates saved value, falls back to default
  //////////////////////////////////

  const [width, setWidth] = useState<number>(() => {
    // SSR safety: Return fallback value during server-side rendering
    if (typeof window === 'undefined') {
      return 800 // SSR fallback value
    }

    // Try to load saved width from localStorage
    try {
      const savedWidth = localStorage.getItem(RIGHT_DRAWER_WIDTH_STORAGE_KEY)
      if (savedWidth) {
        const parsedWidth = parseFloat(savedWidth)
        // Validate: Ensure it's a valid number and meets minimum constraint
        if (!isNaN(parsedWidth) && parsedWidth >= minWidth) {
          // Calculate max constraint: use provided maxWidth or 90% of viewport
          const maxViewportWidth = window.innerWidth * 0.75
          const maxConstraint = maxWidth !== undefined ? Math.min(maxWidth, maxViewportWidth) : maxViewportWidth
          // Validate: Ensure saved width doesn't exceed maximum constraint
          if (parsedWidth <= maxConstraint) {
            return parsedWidth // Use saved width if valid
          }
        }
      }
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., private browsing mode)
      console.warn('Failed to read from localStorage:', error)
    }

    // Fallback: Use default width if no valid saved value found
    return getDefaultWidthInPx()
  })

  // Track resizing state to prevent saving during active drag
  const [isResizing, setIsResizing] = useState(false)
  
  // Ref to panel element for width calculations during drag
  const panelRef = useRef<HTMLElement>(null)
  
  // Track initial mount to prevent saving on first render
  const isInitialMount = useRef(true)

  //////////////////////////////////
  // localStorage Persistence: Save width to localStorage
  // Why: Persist user preference across page refreshes
  // How: Wraps localStorage.setItem in try-catch for error handling
  //////////////////////////////////

  const saveWidthToStorage = useCallback((newWidth: number) => {
    // SSR safety: Only save on client-side
    if (typeof window === 'undefined') return
    
    try {
      // Convert number to string for localStorage storage
      localStorage.setItem(RIGHT_DRAWER_WIDTH_STORAGE_KEY, newWidth.toString())
    } catch (error) {
      // Handle localStorage errors (e.g., quota exceeded, private browsing)
      console.warn('Failed to save to localStorage:', error)
    }
  }, [])
  // Why useCallback: Memoizes save function to prevent unnecessary re-creations
  // How it helps: Stable reference prevents unnecessary effect re-runs

  //////////////////////////////////
  // Lifecycle: Mark initial mount as complete after first render
  // Why: Prevents saving default width to localStorage on initial mount
  // How: Sets flag after component mounts, allowing subsequent width changes to save
  //////////////////////////////////
  useEffect(() => {
    isInitialMount.current = false
  }, [])

  //////////////////////////////////
  // Mouse Event Handlers: Handle resize drag interactions
  // Why: Enable drag-to-resize functionality on the left edge of panel
  // How: Prevents default behavior and sets resizing state to true
  //////////////////////////////////

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    // Prevent default browser behavior (text selection, context menu)
    e.preventDefault()
    // Stop event propagation to prevent parent handlers from firing
    e.stopPropagation()
    // Set resizing state to true to enable drag tracking
    setIsResizing(true)
  }, [])
  // Why useCallback: Memoizes handler to prevent unnecessary re-renders of child components
  // How it helps: Stable reference ensures resize handle doesn't re-render unnecessarily

  //////////////////////////////////
  // Drag-to-Resize Logic: Handle mouse move and mouse up during resize
  // Why: Calculate new width based on mouse position and apply constraints
  // How: Attaches global event listeners when resizing starts, removes on cleanup
  //////////////////////////////////
  useEffect(() => {
    // Early return if not currently resizing
    if (!isResizing) return

    /**
     * Calculate new width based on mouse position during drag
     * Width = distance from right edge of viewport to mouse X position
     */
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      // Safety check: Ensure panel ref exists
      if (!panelRef.current) return

      // Calculate new width: distance from right edge of viewport to mouse X
      const newWidth = window.innerWidth - e.clientX

      // Apply minimum width constraint
      let constrainedWidth = Math.max(minWidth, newWidth)
      
      // Apply maximum width constraint if provided
      if (maxWidth !== undefined) {
        constrainedWidth = Math.min(maxWidth, constrainedWidth)
      }
      
      // Also ensure it doesn't exceed 90% of viewport width (with padding for usability)
      const maxViewportWidth = window.innerWidth * 0.75
      constrainedWidth = Math.min(maxViewportWidth, constrainedWidth)

      // Update width state with constrained value
      setWidth(constrainedWidth)
      // Fire optional callback if provided
      onWidthChange?.(constrainedWidth)
    }

    /**
     * Handle mouse up event to stop resizing
     */
    const handleMouseUp = () => {
      setIsResizing(false) // Stop tracking drag
    }

    // Attach global event listeners for drag tracking
    // Use document level to capture mouse events even if cursor leaves panel
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    // Prevent text selection while dragging for better UX
    document.body.style.userSelect = 'none'
    // Show resize cursor during drag
    document.body.style.cursor = 'col-resize'

    // Cleanup: Remove event listeners and restore body styles
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = '' // Restore text selection
      document.body.style.cursor = '' // Restore default cursor
    }
  }, [isResizing, minWidth, maxWidth, onWidthChange, saveWidthToStorage])
  // Why useEffect: Manages side effects (event listeners) based on resizing state
  // How it helps: Automatically attaches/removes listeners when resizing starts/stops
  // Impact: Ensures proper cleanup and prevents memory leaks

  //////////////////////////////////
  // localStorage Auto-Save: Save width when resizing stops or width changes
  // Why: Persist user's width preference automatically
  // How: Saves to localStorage only when not actively resizing (prevents excessive writes)
  //////////////////////////////////

  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting with default value
    if (isInitialMount.current) {
      return
    }
    
    // Only save when not actively resizing (prevents excessive localStorage writes during drag)
    // This ensures we save once when drag ends, not on every mouse move
    if (!isResizing) {
      saveWidthToStorage(width)
    }
  }, [width, isResizing, saveWidthToStorage])
  // Why useEffect: Automatically saves width changes without manual intervention
  // How it helps: Persists user preference seamlessly when resizing stops
  // Impact: Better UX - user doesn't need to manually save, width persists on refresh

  //////////////////////////////////
  // Reset Function: Reset width to default and clear localStorage
  // Why: Allow users to restore default width and clear saved preference
  // How: Sets width to default value and removes localStorage entry
  //////////////////////////////////
  const resetWidth = useCallback(() => {
    // Calculate default width in pixels
    const defaultPx = getDefaultWidthInPx()
    // Update width state to default
    setWidth(defaultPx)
    // Fire optional callback with default width
    onWidthChange?.(defaultPx)
    
    // Clear localStorage to remove saved preference
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(RIGHT_DRAWER_WIDTH_STORAGE_KEY)
      } catch (error) {
        // Handle localStorage errors gracefully
        console.warn('Failed to remove from localStorage:', error)
      }
    }
  }, [getDefaultWidthInPx, onWidthChange])
  // Why useCallback: Memoizes reset function to prevent unnecessary re-renders
  // How it helps: Stable reference ensures components using resetWidth don't re-render unnecessarily

  //////////////////////////////////
  // Return: Expose hook API to consuming components
  //////////////////////////////////

  return {
    width,
    isResizing,
    panelRef,
    handleMouseDown,
    resetWidth,
  }
}

