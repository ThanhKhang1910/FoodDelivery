DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_latitude') THEN 
        ALTER TABLE Orders ADD COLUMN customer_latitude DECIMAL(10, 8); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_longitude') THEN 
        ALTER TABLE Orders ADD COLUMN customer_longitude DECIMAL(11, 8); 
    END IF;
END $$;
