-- Create table for discipline report comments
CREATE TABLE public.discipline_report_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.discipline_reports(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for discipline report likes
CREATE TABLE public.discipline_report_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.discipline_reports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments table
ALTER TABLE public.discipline_report_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on likes table
ALTER TABLE public.discipline_report_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.discipline_report_comments
FOR SELECT
USING (true);

-- Policy: Anyone can create comments
CREATE POLICY "Anyone can create comments"
ON public.discipline_report_comments
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.discipline_report_likes
FOR SELECT
USING (true);

-- Policy: Anyone can create likes
CREATE POLICY "Anyone can create likes"
ON public.discipline_report_likes
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_comments_report_id ON public.discipline_report_comments(report_id);
CREATE INDEX idx_likes_report_id ON public.discipline_report_likes(report_id);