import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


export const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const portfolioItems = [
    {
      id: 1,
      title: "Tech Conference 2024",
      description: "Multi-camera live streaming setup for 500+ attendees",
      category: "Livefeed",
    },
    {
      id: 2,
      title: "Elegant Wedding Ceremony",
      description: "Full day coverage with cinematic highlights",
      category: "Weddings",
    },
    {
      id: 3,
      title: "Product Launch Event",
      description: "Live streaming to multiple platforms simultaneously",
      category: "Corporate",
    },
    {
      id: 4,
      title: "Executive Headshots",
      description: "Professional headshots for C-suite executives",
      category: "Corporate",
    },
    {
      id: 5,
      title: "Annual Company Meeting",
      description: "4K recording and live streaming hybrid event",
      category: "Corporate",
    },
    {
      id: 6,
      title: "Garden Wedding Reception",
      description: "Outdoor ceremony with natural lighting",
      category: "Weddings",
    },
    {
      id: 7,
      title: "International Webinar",
      description: "Global audience streaming with real-time Q&A",
      category: "Livefeed",
    },
    {
      id: 8,
      title: "Team Building Event",
      description: "Full day event documentation and highlights",
      category: "Corporate",
    },
    {
      id: 9,
      title: "Fashion Show Stream",
      description: "Multi-angle live streaming with professional commentary",
      category: "Livefeed",
    },
  ];

  const filters = ["All", "Weddings", "Corporate", "Livefeed"];

  const filteredItems = activeFilter === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gray-800 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Portfolio
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Showcasing our expertise in livestreaming, event coverage, and professional photography
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="lg"
                className={`px-8 py-3 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 bg-white"
              >
                {/* Image placeholder area */}
                <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                  {/* Placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 text-gray-400 opacity-30">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Show message when no items match filter */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No projects found for the selected category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
