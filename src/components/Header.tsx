import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
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
            to="/Services" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium relative group"
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/portfolio" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium relative group"
          >
            Portfolio
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

        <Button variant="premium" className="shadow-lg hover:shadow-xl transition-all duration-200">
          Book Now
        </Button>
      </div>
    </header>
  );
};