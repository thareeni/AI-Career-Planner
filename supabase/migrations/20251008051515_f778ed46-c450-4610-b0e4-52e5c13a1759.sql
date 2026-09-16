-- Create enum for user career levels
CREATE TYPE public.career_level AS ENUM ('beginner', 'learner', 'intern', 'professional');

-- Create enum for course categories
CREATE TYPE public.course_category AS ENUM ('data_science', 'web_development', 'ai_ml', 'mobile_dev', 'cloud_computing', 'cybersecurity', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  education TEXT,
  interests TEXT[],
  bio TEXT,
  career_level career_level DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career_roadmaps table
CREATE TABLE public.career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category course_category NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_tracking table
CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  roadmap_id UUID REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
  goal_title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL,
  category course_category NOT NULL,
  url TEXT NOT NULL,
  rating DECIMAL(3,2),
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Career roadmaps policies
CREATE POLICY "Users can view their own roadmaps"
  ON public.career_roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps"
  ON public.career_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON public.career_roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON public.career_roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- Progress tracking policies
CREATE POLICY "Users can view their own progress"
  ON public.progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.progress_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Courses policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_roadmaps_updated_at
  BEFORE UPDATE ON public.career_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample courses
INSERT INTO public.courses (title, description, provider, category, url, rating, difficulty) VALUES
  ('Complete Data Science Bootcamp', 'Master Data Science from beginner to advanced', 'Coursera', 'data_science', 'https://coursera.org/data-science', 4.8, 'Intermediate'),
  ('Web Development Masterclass', 'Full-stack web development with React and Node', 'Udemy', 'web_development', 'https://udemy.com/web-dev', 4.7, 'Beginner'),
  ('Machine Learning A-Z', 'Hands-on Python & R in Data Science', 'Udemy', 'ai_ml', 'https://udemy.com/ml-az', 4.9, 'Intermediate'),
  ('React Native - The Practical Guide', 'Build iOS and Android apps', 'Udemy', 'mobile_dev', 'https://udemy.com/react-native', 4.6, 'Intermediate'),
  ('AWS Certified Solutions Architect', 'Master AWS cloud platform', 'Coursera', 'cloud_computing', 'https://coursera.org/aws', 4.8, 'Advanced');