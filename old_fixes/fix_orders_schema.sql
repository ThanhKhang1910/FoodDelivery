-- Add address and note if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='address') THEN
        ALTER TABLE Orders ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='note') THEN
        ALTER TABLE Orders ADD COLUMN note TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') THEN
        ALTER TABLE Orders ADD COLUMN payment_method VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_id') THEN
        -- Check if Deliveries table exists first to avoid error
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='deliveries') THEN
             ALTER TABLE Orders ADD COLUMN delivery_id INT REFERENCES Deliveries(delivery_id);
        ELSE
             -- If Deliveries doesn't exist, maybe just add the column without FK for now or create Deliveries?
             -- User suggestion implies Deliveries might exist.
             -- Let's check safely. For now, just print logic or skip.
             RAISE NOTICE 'Deliveries table does not exist, skipping delivery_id FK';
             -- We can add it as nullable int
             ALTER TABLE Orders ADD COLUMN delivery_id INT;
        END IF;
    END IF;
END
$$;
