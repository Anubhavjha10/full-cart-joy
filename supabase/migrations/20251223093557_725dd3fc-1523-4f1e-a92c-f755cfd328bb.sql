-- Create store_settings table for store hours and status control
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view store settings
CREATE POLICY "Anyone can view store settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can manage store settings
CREATE POLICY "Admins can manage store settings"
ON public.store_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default store settings
INSERT INTO public.store_settings (setting_key, setting_value) VALUES
  ('store_open_time', '09:00'),
  ('store_close_time', '21:00'),
  ('store_force_status', 'auto'),
  ('store_closed_message', 'Store is closed right now. Please come back during store hours.');

-- Create trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_seen column to notices for user tracking
CREATE TABLE IF NOT EXISTS public.notice_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

-- Enable RLS on notice_views
ALTER TABLE public.notice_views ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own notice views
CREATE POLICY "Users can manage their notice views"
ON public.notice_views
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);