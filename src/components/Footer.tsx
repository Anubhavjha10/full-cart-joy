import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-card mb-4">SPG Para Military Canteen</h3>
            <p className="text-sm opacity-80">
              Serving our defense personnel with quality products and fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-card mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-card transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-card transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-card transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-card mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-card transition-colors">
                  Groceries
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-card transition-colors">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-card transition-colors">
                  Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-card mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Cantonment Area</li>
              <li>Sector 14</li>
              <li>Phone: 1800-XXX-XXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-footer-foreground/20 mt-8 pt-8 text-center text-sm opacity-70">
          © {new Date().getFullYear()} SPG Para Military Canteen. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
