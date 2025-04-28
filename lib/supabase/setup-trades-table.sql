-- Create trades table if it doesn't exist
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  quantity NUMERIC NOT NULL,
  fees NUMERIC DEFAULT 0,
  profit_loss NUMERIC,
  profit_loss_percent NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'cancelled')),
  setup TEXT,
  tags TEXT[],
  notes TEXT,
  import_source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trade_screenshots table if it doesn't exist
CREATE TABLE IF NOT EXISTS trade_screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  screenshot_type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trades table
DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
CREATE POLICY "Users can view their own trades"
  ON trades
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;
CREATE POLICY "Users can insert their own trades"
  ON trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
CREATE POLICY "Users can update their own trades"
  ON trades
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;
CREATE POLICY "Users can delete their own trades"
  ON trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for trade_screenshots table
DROP POLICY IF EXISTS "Users can view screenshots of their trades" ON trade_screenshots;
CREATE POLICY "Users can view screenshots of their trades"
  ON trade_screenshots
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trades
    WHERE trades.id = trade_screenshots.trade_id
    AND trades.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert screenshots for their trades" ON trade_screenshots;
CREATE POLICY "Users can insert screenshots for their trades"
  ON trade_screenshots
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM trades
    WHERE trades.id = trade_screenshots.trade_id
    AND trades.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete screenshots of their trades" ON trade_screenshots;
CREATE POLICY "Users can delete screenshots of their trades"
  ON trade_screenshots
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM trades
    WHERE trades.id = trade_screenshots.trade_id
    AND trades.user_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp for trades
DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate profit_loss and profit_loss_percent
CREATE OR REPLACE FUNCTION calculate_profit_loss()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.exit_price IS NOT NULL AND NEW.entry_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
    IF NEW.direction = 'long' THEN
      NEW.profit_loss = (NEW.exit_price - NEW.entry_price) * NEW.quantity - COALESCE(NEW.fees, 0);
      NEW.profit_loss_percent = ((NEW.exit_price - NEW.entry_price) / NEW.entry_price) * 100;
    ELSE
      NEW.profit_loss = (NEW.entry_price - NEW.exit_price) * NEW.quantity - COALESCE(NEW.fees, 0);
      NEW.profit_loss_percent = ((NEW.entry_price - NEW.exit_price) / NEW.entry_price) * 100;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate profit_loss and profit_loss_percent
DROP TRIGGER IF EXISTS calculate_profit_loss_trigger ON trades;
CREATE TRIGGER calculate_profit_loss_trigger
BEFORE INSERT OR UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION calculate_profit_loss();
