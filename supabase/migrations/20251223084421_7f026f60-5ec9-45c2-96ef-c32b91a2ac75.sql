-- Create table for admin notices
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for special offers
CREATE TABLE public.special_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT DEFAULT 'View Offer',
  cta_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

-- Public read access for notices (everyone can see active notices)
CREATE POLICY "Anyone can view active notices" 
ON public.notices 
FOR SELECT 
USING (is_active = true);

-- Admin full access for notices
CREATE POLICY "Admins can manage notices" 
ON public.notices 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Public read access for special offers
CREATE POLICY "Anyone can view active special offers" 
ON public.special_offers 
FOR SELECT 
USING (is_active = true);

-- Admin full access for special offers
CREATE POLICY "Admins can manage special offers" 
ON public.special_offers 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_offers_updated_at
BEFORE UPDATE ON public.special_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.notices (title, content, is_active) VALUES
('Store Hours Update', 'Store will remain closed on 25th December for Christmas. Regular hours resume on 26th.', true);

INSERT INTO public.special_offers (title, description, cta_text, cta_link, is_active) VALUES
('Winter Sale - 20% OFF', 'Get 20% off on all winter essentials. Limited time offer!', 'Shop Now', '/category/groceries', true);