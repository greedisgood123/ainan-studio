import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ui/contact-section";

export const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <ContactSection />
      <Footer />
    </div>
  );
};