-- Enable RLS on trades table
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;

-- Create policies for trades table
CREATE POLICY "Users can view their own trades"
  ON trades
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on trade_screenshots table
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trade screenshots" ON trade_screenshots;
DROP POLICY IF EXISTS "Users can insert their own trade screenshots" ON trade_screenshots;
DROP POLICY IF EXISTS "Users can update their own trade screenshots" ON trade_screenshots;
DROP POLICY IF EXISTS "Users can delete their own trade screenshots" ON trade_screenshots;

-- Create policies for trade_screenshots table
CREATE POLICY "Users can view their own trade screenshots"
  ON trade_screenshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade screenshots"
  ON trade_screenshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade screenshots"
  ON trade_screenshots
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade screenshots"
  ON trade_screenshots
  FOR DELETE
  USING (auth.uid() = user_id);
