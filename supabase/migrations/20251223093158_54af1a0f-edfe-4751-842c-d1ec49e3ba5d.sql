-- Create a function to decrease stock when order items are inserted
CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decrease stock for the ordered product
  UPDATE public.admin_products
  SET stock = GREATEST(0, COALESCE(stock, 0) - NEW.quantity)
  WHERE id::text = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically decrease stock when order items are created
DROP TRIGGER IF EXISTS trigger_decrease_stock_on_order ON public.order_items;
CREATE TRIGGER trigger_decrease_stock_on_order
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrease_stock_on_order();

-- Create a function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only restore stock if status changed to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.admin_products ap
    SET stock = COALESCE(stock, 0) + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND ap.id::text = oi.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to restore stock when order is cancelled
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON public.orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.restore_stock_on_cancel();

-- Add low_stock_threshold column to admin_products if it doesn't exist
ALTER TABLE public.admin_products 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;