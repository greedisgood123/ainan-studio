import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Gallery } from "@/components/Gallery";
import { PricingSection } from "@/components/PricingSection";
import { AddOnsSection } from "@/components/AddOnsSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Gallery />
      <PricingSection />
      <WhyChooseUs />
      <AddOnsSection />
      <Footer />
    </div>
  );
};

export default Index;
