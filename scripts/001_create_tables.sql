-- Create enum types
CREATE TYPE chain_type AS ENUM ('ethereum', 'arbitrum', 'optimism', 'polygon', 'base', 'solana');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirming', 'completed', 'failed', 'cancelled');
CREATE TYPE action_type AS ENUM ('bridge', 'swap', 'stake', 'unstake', 'compound');

-- Wallets table: stores connected wallets for each user
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain chain_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address, chain)
);

-- Portfolio positions: track token holdings across chains
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  chain chain_type NOT NULL,
  token_symbol TEXT NOT NULL,
  token_address TEXT NOT NULL,
  balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
  usd_value NUMERIC(18, 2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staking positions: track staked assets and rewards
CREATE TABLE IF NOT EXISTS staking_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  chain chain_type NOT NULL,
  protocol TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  staked_amount NUMERIC(36, 18) NOT NULL DEFAULT 0,
  rewards_earned NUMERIC(36, 18) DEFAULT 0,
  apy NUMERIC(5, 2),
  usd_value NUMERIC(18, 2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_claim TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction history: comprehensive transaction tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  tx_hash TEXT,
  action action_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  from_chain chain_type NOT NULL,
  to_chain chain_type,
  from_token TEXT NOT NULL,
  to_token TEXT,
  from_amount NUMERIC(36, 18) NOT NULL,
  to_amount NUMERIC(36, 18),
  gas_fee NUMERIC(18, 8),
  bridge_fee NUMERIC(18, 8),
  swap_fee NUMERIC(18, 8),
  estimated_time_seconds INTEGER,
  error_message TEXT,
  simulation_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Strategy configurations: save one-step execution flows
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  times_executed INTEGER DEFAULT 0,
  last_executed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications: track important events
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallets" ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallets" ON wallets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portfolio_positions
CREATE POLICY "Users can view their portfolio positions" ON portfolio_positions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = portfolio_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can insert their portfolio positions" ON portfolio_positions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = portfolio_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can update their portfolio positions" ON portfolio_positions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = portfolio_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can delete their portfolio positions" ON portfolio_positions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = portfolio_positions.wallet_id AND wallets.user_id = auth.uid()));

-- RLS Policies for staking_positions
CREATE POLICY "Users can view their staking positions" ON staking_positions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = staking_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can insert their staking positions" ON staking_positions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = staking_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can update their staking positions" ON staking_positions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = staking_positions.wallet_id AND wallets.user_id = auth.uid()));
CREATE POLICY "Users can delete their staking positions" ON staking_positions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM wallets WHERE wallets.id = staking_positions.wallet_id AND wallets.user_id = auth.uid()));

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for strategies
CREATE POLICY "Users can view their own strategies" ON strategies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own strategies" ON strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON strategies FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_portfolio_positions_wallet_id ON portfolio_positions(wallet_id);
CREATE INDEX idx_staking_positions_wallet_id ON staking_positions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
