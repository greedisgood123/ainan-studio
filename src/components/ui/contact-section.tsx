import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";

export const ContactSection = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to elevate your event with professional livestreaming and photography? Let's talk.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Section - Contact Form */}
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row - Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Second Row - Phone and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+60 12-345 6789"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="e.g., Wedding livestream inquiry"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event, requirements, and timeline..."
                  className="w-full min-h-[120px] resize-y"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Right Section - Information Cards */}
          <div className="space-y-6">
            {/* Ainan Studio Card */}
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ainan Studio
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Livestream Experts
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Professional livestreaming and photography services across Kuala Lumpur and Selangor. 
                We bring the studio to you with our mobile setup.
              </p>
              
              {/* Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">+60 12-345 6789</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">hello@ainan.studio</span>
                </div>
              </div>
            </div>

            {/* Follow Us Card */}
            <div className="bg-white rounded-lg shadow-soft p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Follow Us
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Stay updated with our latest work
              </p>
              
              {/* Social Media Icons */}
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};