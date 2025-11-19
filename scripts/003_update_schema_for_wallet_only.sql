-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can delete their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can view their portfolio positions" ON portfolio_positions;
DROP POLICY IF EXISTS "Users can insert their portfolio positions" ON portfolio_positions;
DROP POLICY IF EXISTS "Users can update their portfolio positions" ON portfolio_positions;
DROP POLICY IF EXISTS "Users can delete their portfolio positions" ON portfolio_positions;
DROP POLICY IF EXISTS "Users can view their staking positions" ON staking_positions;
DROP POLICY IF EXISTS "Users can insert their staking positions" ON staking_positions;
DROP POLICY IF EXISTS "Users can update their staking positions" ON staking_positions;
DROP POLICY IF EXISTS "Users can delete their staking positions" ON staking_positions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Alter wallets table to remove user_id foreign key and make address the primary identifier
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_address_chain_key;
ALTER TABLE wallets DROP COLUMN IF EXISTS user_id;
ALTER TABLE wallets ADD CONSTRAINT wallets_address_chain_unique UNIQUE(address, chain);

-- Alter transactions table to use wallet_address instead of user_id
ALTER TABLE transactions DROP COLUMN IF EXISTS user_id;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Alter strategies table to use wallet_address instead of user_id
ALTER TABLE strategies DROP COLUMN IF EXISTS user_id;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Alter notifications table to use wallet_address instead of user_id
ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Disable RLS since we're using wallet-based access control
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
