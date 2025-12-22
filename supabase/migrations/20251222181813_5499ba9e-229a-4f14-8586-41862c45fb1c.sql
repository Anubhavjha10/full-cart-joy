-- Create a secure view for public review access that masks user_id
CREATE OR REPLACE VIEW public.public_product_reviews AS
SELECT 
  id,
  product_id,
  rating,
  review_text,
  created_at,
  updated_at,
  -- Only expose user_id if the current user is the review owner
  CASE 
    WHEN auth.uid() = user_id THEN user_id 
    ELSE NULL 
  END AS user_id,
  -- Flag to indicate if current user owns this review
  (auth.uid() = user_id) AS is_own_review
FROM public.product_reviews;

-- Grant access to the view
GRANT SELECT ON public.public_product_reviews TO anon, authenticated;