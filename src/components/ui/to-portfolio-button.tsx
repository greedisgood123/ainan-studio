import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";

export const ToPortfolioButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/portfolio');
  };

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="group relative overflow-hidden px-8 py-4 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg shadow-md"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <Eye className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="font-semibold text-base">View Full Portfolio</span>
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Button>
  );
};
