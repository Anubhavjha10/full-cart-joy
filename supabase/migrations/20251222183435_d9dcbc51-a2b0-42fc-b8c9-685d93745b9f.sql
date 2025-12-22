-- Add item_status to order_items for tracking out of stock items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS item_status text NOT NULL DEFAULT 'available';

-- Add adjusted_amount to orders for when items are removed
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS adjusted_amount integer;

-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for order_items table
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to validate order status transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transitions jsonb := '{
    "pending": ["accepted", "cancelled"],
    "accepted": ["packed", "cancelled"],
    "packed": ["out_for_delivery", "cancelled"],
    "out_for_delivery": ["delivered"],
    "delivered": [],
    "cancelled": []
  }'::jsonb;
  allowed_statuses jsonb;
BEGIN
  -- Skip validation if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get allowed transitions for current status
  allowed_statuses := valid_transitions -> OLD.status;
  
  -- Check if new status is in allowed list
  IF allowed_statuses IS NULL OR NOT (allowed_statuses ? NEW.status) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status validation
DROP TRIGGER IF EXISTS validate_order_status ON public.orders;
CREATE TRIGGER validate_order_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();

-- Add RLS policy for admins to update order_items
CREATE POLICY "Admins can update order items"
ON public.order_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));