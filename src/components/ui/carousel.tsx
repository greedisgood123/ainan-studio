// React imports and Embla Carousel - a powerful carousel library
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Type definitions for better TypeScript support
type CarouselApi = UseEmblaCarouselType[1] // The API object from Embla carousel
type UseCarouselParameters = Parameters<typeof useEmblaCarousel> // Extract parameter types
type CarouselOptions = UseCarouselParameters[0] // Carousel configuration options
type CarouselPlugin = UseCarouselParameters[1] // Carousel plugins

// Props for the main Carousel component
type CarouselProps = {
  opts?: CarouselOptions // Embla carousel options (loop, align, etc.)
  plugins?: CarouselPlugin // Additional plugins for extended functionality
  orientation?: "horizontal" | "vertical" // Scroll direction
  setApi?: (api: CarouselApi) => void // Callback to get access to carousel API
}

// Context props - shared state between all carousel components
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0] // Ref for the carousel container
  api: ReturnType<typeof useEmblaCarousel>[1] // Embla API for controlling carousel
  scrollPrev: () => void // Function to scroll to previous slide
  scrollNext: () => void // Function to scroll to next slide
  canScrollPrev: boolean // Whether previous scroll is possible
  canScrollNext: boolean // Whether next scroll is possible
} & CarouselProps

// React Context for sharing carousel state between components
// This allows child components (CarouselContent, CarouselItem, etc.) to access carousel functionality
const CarouselContext = React.createContext<CarouselContextProps | null>(null)

// Custom hook to access carousel context
// Throws error if used outside of Carousel component tree
function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

// Main Carousel component - sets up the carousel and provides context
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal", // Default to horizontal scrolling
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Initialize Embla carousel with options and plugins
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y", // Set scroll axis based on orientation
      },
      plugins
    )
    
    // State to track if scrolling is possible in each direction
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    // Callback to update scroll state when carousel selection changes
    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    // Functions to control carousel scrolling
    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    // Keyboard navigation support (arrow keys)
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    // Effect to expose API to parent component if setApi prop is provided
    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    // Effect to set up event listeners for carousel state changes
    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api) // Set initial state
      api.on("reInit", onSelect) // Listen for re-initialization
      api.on("select", onSelect) // Listen for slide changes

      // Cleanup event listeners
      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      // Provide carousel context to all child components
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        {/* Main carousel container with keyboard support and accessibility */}
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

// CarouselContent - Container for all carousel items with overflow handling
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    // Outer container with overflow hidden to clip slides
    <div ref={carouselRef} className="overflow-hidden">
      {/* Inner flex container that actually moves during scrolling */}
      <div
        ref={ref}
        className={cn(
          "flex",
          // Negative margin to offset padding on individual items
          // Creates consistent spacing between slides
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

// CarouselItem - Individual slide wrapper
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        // Flex properties for slide behavior:
        // min-w-0: prevents flex items from overflowing
        // shrink-0: prevents shrinking smaller than basis
        // grow-0: prevents growing larger than basis
        // basis-full: takes full width by default (can be overridden)
        "min-w-0 shrink-0 grow-0 basis-full",
        // Padding to create spacing between slides
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

// CarouselPrevious - Navigation button to go to previous slide
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        // Larger, polished circular control
        "absolute h-12 w-12 md:h-14 md:w-14 rounded-full",
        // Visual treatment
        "bg-background/80 border border-border shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/60",
        // Interaction
        "transition-transform duration-200 hover:scale-105",
        // Disabled state resilience
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Position based on orientation:
        orientation === "horizontal"
          ? "left-2 md:-left-10 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev} // Disable when can't scroll further
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
      <span className="sr-only">Previous slide</span> {/* Screen reader text */}
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

// CarouselNext - Navigation button to go to next slide
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        // Larger, polished circular control
        "absolute h-12 w-12 md:h-14 md:w-14 rounded-full",
        // Visual treatment
        "bg-background/80 border border-border shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/60",
        // Interaction
        "transition-transform duration-200 hover:scale-105",
        // Disabled state resilience
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Position based on orientation:
        orientation === "horizontal"
          ? "right-2 md:-right-10 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext} // Disable when can't scroll further
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-6 w-6 md:h-7 md:w-7" />
      <span className="sr-only">Next slide</span> {/* Screen reader text */}
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

// Export all components and types for use in other files
export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
