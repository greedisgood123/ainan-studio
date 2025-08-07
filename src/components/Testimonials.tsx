import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp Malaysia",
      rating: 5,
      content: "Ainan Studio transformed our corporate event with their professional livestreaming setup. The quality was outstanding and they handled everything seamlessly.",
      image: "SC"
    },
    {
      name: "Ahmad Rahman",
      role: "Event Coordinator",
      company: "Wedding Dreams KL",
      rating: 5,
      content: "Our wedding livestream was absolutely perfect! They captured every moment beautifully and our overseas family felt like they were there with us.",
      image: "AR"
    },
    {
      name: "Lisa Wong",
      role: "CEO",
      company: "StartupHub Asia",
      rating: 5,
      content: "The team headshot session was incredibly efficient. Professional results in just a few hours, and everyone looked amazing. Highly recommended!",
      image: "LW"
    },
    {
      name: "David Kumar",
      role: "Product Manager",
      company: "InnovateTech Solutions",
      rating: 5,
      content: "Outstanding service for our product launch. The multi-platform streaming worked flawlessly and the video quality was broadcast-ready.",
      image: "DK"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it — hear from the clients who've experienced our professional services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 shadow-soft hover:shadow-elegant transition-all duration-300">
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-600 opacity-60" />
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Testimonial Content */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Client Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        {/*<div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-4">
            Ready to join our satisfied clients?
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Get Started Today
          </button>
        </div>  */}
      </div>
    </section>
  );
};