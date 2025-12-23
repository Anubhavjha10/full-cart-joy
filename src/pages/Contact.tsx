import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Contact Us</h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Have questions or need assistance? We're here to help. Reach out to us through 
            any of the following channels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground">
                Mushedpur, Farukhnagar<br />
                Gurugram, Haryana<br />
                India
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Phone</h3>
              <a 
                href="tel:+911800123456" 
                className="text-primary hover:text-primary/80 transition-colors text-lg font-medium"
              >
                +91 1800-123-456
              </a>
              <p className="text-muted-foreground text-sm mt-1">
                Toll-free number
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
              <a 
                href="mailto:support@spgcanteen.com" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                support@spgcanteen.com
              </a>
              <p className="text-muted-foreground text-sm mt-1">
                We respond within 24 hours
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Working Hours</h3>
              <p className="text-muted-foreground">
                Monday - Saturday<br />
                9:00 AM - 8:00 PM
              </p>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Need Immediate Assistance?</h2>
            <p className="text-muted-foreground mb-4">
              For urgent queries regarding orders, deliveries, or any other concerns, 
              please call our helpline directly. Our customer support team is ready to assist you.
            </p>
            <a 
              href="tel:+911800123456"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
