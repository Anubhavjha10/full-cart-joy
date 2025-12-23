import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Who can shop at SPG Para Military Canteen?',
    answer: 'Our canteen is primarily designed to serve paramilitary personnel, defense employees, veterans, and their families. Valid identification may be required during registration or checkout.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and cash on delivery (COD) for eligible orders.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 2-5 business days depending on your location. Orders within cantonment areas may be delivered faster. You can track your order status from the Orders page.',
  },
  {
    question: 'Can I cancel or modify my order?',
    answer: 'Yes, you can cancel or modify your order before it is packed. Once the order is out for delivery, cancellation may not be possible. Please contact our support team for assistance.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for most products in their original condition. Perishable items like fresh produce and dairy have a shorter return window. Please check the product page for specific return policies.',
  },
  {
    question: 'How do I track my order?',
    answer: 'You can track your order by visiting the Orders page after logging in. You will also receive notifications via email and push notifications (if enabled) for order status updates.',
  },
  {
    question: 'Are prices at the canteen different from regular stores?',
    answer: 'Yes, our canteen offers products at special prices for eligible personnel. The discounts vary by product category and are reflected in the displayed prices.',
  },
  {
    question: 'Do you deliver outside cantonment areas?',
    answer: 'Yes, we deliver to most locations. However, delivery times may be longer for addresses outside cantonment areas. Enter your pincode during checkout to check delivery availability.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach our customer support team via phone at +91 1800-123-456 (toll-free), email at support@spgcanteen.com, or visit our Contact page for more options.',
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
  },
];

const FAQ = () => {
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

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Find answers to commonly asked questions about our services, orders, and policies.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 bg-accent/50 rounded-xl p-6 border border-border text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
