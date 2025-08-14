import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Header = () => {
  return (
    <header className="w-full py-3 md:py-4 px-4 md:px-6 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <img 
                src="/Logo/AINAN-Logo-02.webp" 
                alt="Ainan Studio Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground leading-tight">AINAN</span>
              <span className="text-sm font-medium text-muted-foreground leading-tight">STUDIO</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8"> 
          <Link 
            to="/portfolio" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium relative group"
          >
            Portfolio
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/packages" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium relative group"
          >
            Packages
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/contact" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="premium" className="shadow-lg hover:shadow-xl transition-all duration-200 hidden md:inline-flex">
            Book Now
          </Button>
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-3">
                  <Link to="/portfolio" className="text-base py-2">Portfolio</Link>
                  <Link to="/packages" className="text-base py-2">Packages</Link>
                  <Link to="/contact" className="text-base py-2">Contact</Link>
                  <Button variant="premium" className="mt-4">Book Now</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};