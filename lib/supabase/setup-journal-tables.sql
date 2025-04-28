-- Create journal_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  mood TEXT CHECK (mood IN ('confident', 'anxious', 'frustrated', 'calm', 'excited', 'neutral')) NOT NULL,
  lessons_learned TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_media table if it doesn't exist
CREATE TABLE IF NOT EXISTS journal_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document')) NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply RLS policies for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

-- Create policies
CREATE POLICY "Users can view their own journal entries" 
  ON journal_entries FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own journal entries" 
  ON journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own journal entries" 
  ON journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own journal entries" 
  ON journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Apply RLS policies for journal_media
ALTER TABLE journal_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Users can view their own journal media" ON journal_media;
DROP POLICY IF EXISTS "Users can insert their own journal media" ON journal_media;
DROP POLICY IF EXISTS "Users can update their own journal media" ON journal_media;
DROP POLICY IF EXISTS "Users can delete their own journal media" ON journal_media;

-- Create policies
CREATE POLICY "Users can view their own journal media" 
  ON journal_media FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM journal_entries 
    WHERE journal_entries.id = journal_media.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can insert their own journal media" 
  ON journal_media FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM journal_entries 
    WHERE journal_entries.id = journal_media.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can update their own journal media" 
  ON journal_media FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM journal_entries 
    WHERE journal_entries.id = journal_media.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can delete their own journal media" 
  ON journal_media FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM journal_entries 
    WHERE journal_entries.id = journal_media.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
