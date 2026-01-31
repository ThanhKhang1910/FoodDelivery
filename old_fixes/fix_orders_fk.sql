-- Fix Foreign Key Constraint for Orders table
-- Problem: Orders.customer_id references "customers" table but should reference "users"

-- Step 1: Drop old constraint
ALTER TABLE Orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- Step 2: Add correct constraint pointing to Users table
ALTER TABLE Orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Step 3: Verify
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name = 'orders_customer_id_fkey';

-- Should show: orders_customer_id_fkey | orders
