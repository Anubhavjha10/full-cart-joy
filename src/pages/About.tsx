import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Truck, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">About Us</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-8">
              SPG Para Military Canteen is dedicated to serving our defense personnel and their families 
              with quality products at the best prices. We take pride in being a trusted partner for 
              our armed forces community.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide quality products and exceptional service to our defense personnel, 
                  ensuring they have access to essentials at affordable prices.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Who We Serve</h3>
                <p className="text-muted-foreground">
                  We proudly serve the brave men and women of our paramilitary forces, 
                  veterans, and their families with dedication and respect.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  We ensure timely delivery of all orders to cantonment areas and 
                  surrounding regions with care and efficiency.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quality Assured</h3>
                <p className="text-muted-foreground">
                  Every product in our catalog is carefully sourced and quality-checked 
                  to meet the highest standards.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Established to serve the needs of our paramilitary forces, SPG Para Military Canteen 
              has been a cornerstone of the defense community. We understand the unique needs of 
              our service members and their families, and we strive to make their lives easier 
              by providing convenient access to everyday essentials.
            </p>
            <p className="text-muted-foreground">
              Our commitment goes beyond just selling products – we're here to support the 
              families who sacrifice so much for our nation's safety.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
