import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer text-footer-foreground mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <h3 className="text-xl font-bold text-white mb-4 hover:text-primary transition-colors">
                SPG Para Military Canteen
              </h3>
            </Link>
            <p className="text-sm text-footer-foreground/80">
              Serving our defense personnel with quality products and fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/about" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/category/groceries" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  Groceries
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/vegetables" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/beverages" 
                  className="text-footer-foreground/80 hover:text-white transition-colors inline-block"
                >
                  Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-footer-foreground/60" />
                <span className="text-footer-foreground/80">
                  Mushedpur, Farukhnagar<br />
                  Gurugram
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-footer-foreground/60" />
                <a 
                  href="tel:+911800123456" 
                  className="text-footer-foreground/80 hover:text-white transition-colors"
                >
                  +91 1800-123-456
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-footer-foreground/20 mt-8 pt-8 text-center text-sm text-footer-foreground/70">
          © {currentYear}{' '}
          <Link 
            to="/" 
            className="hover:text-white transition-colors"
          >
            SPG Para Military Canteen
          </Link>
          . All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
