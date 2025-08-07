import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Gallery } from "@/components/Gallery";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { Testimonials } from "@/components/Testimonials";
import { Trusted } from "@/components/Trusted";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Gallery />
      <PricingSection />
      <Testimonials />
      <Trusted />
      <Footer />
    </div>
  );
};

export default Index;
