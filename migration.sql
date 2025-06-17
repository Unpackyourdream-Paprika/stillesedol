-- Migration to add author_name and profile_image columns to the signatures table

-- First, check if the columns already exist
DO $$
BEGIN
    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'signatures' AND column_name = 'author_name'
    ) THEN
        ALTER TABLE signatures ADD COLUMN author_name TEXT;
    END IF;
    
    -- Add profile_image column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'signatures' AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE signatures ADD COLUMN profile_image TEXT;
    END IF;
END
$$;

-- Update existing rows with unique random profile images
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM signatures WHERE author_name IS NULL OR profile_image IS NULL
    LOOP
        -- 각 레코드마다 새로운 랜덤 프로필 생성
        UPDATE signatures 
        SET 
            author_name = 'Ye Fan', 
            profile_image = '/profiles/k' || (floor(random() * 8) + 1)::TEXT || '.gif'
        WHERE 
            id = r.id;
    END LOOP;
END
$$; 