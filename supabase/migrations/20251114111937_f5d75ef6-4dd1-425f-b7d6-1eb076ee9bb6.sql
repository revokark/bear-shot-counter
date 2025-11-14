-- Create discipline_reports table
CREATE TABLE public.discipline_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_description TEXT NOT NULL,
  who_performed TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discipline_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view reports
CREATE POLICY "Anyone can view discipline reports" 
ON public.discipline_reports 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert reports
CREATE POLICY "Anyone can create discipline reports" 
ON public.discipline_reports 
FOR INSERT 
WITH CHECK (true);