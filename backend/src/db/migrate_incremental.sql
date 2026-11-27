-- Migración incremental: añadir columnas de logotipos y perfil
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logo_id VARCHAR(200);

CREATE TABLE IF NOT EXISTS entrepreneur_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(80) NOT NULL,
    bio_short VARCHAR(200),
    profile_photo_url VARCHAR(500),
    profile_photo_id VARCHAR(200),
    instagram_handle VARCHAR(60),
    classroom_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE entrepreneur_profiles ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500);
ALTER TABLE entrepreneur_profiles ADD COLUMN IF NOT EXISTS profile_photo_id VARCHAR(200);
ALTER TABLE entrepreneur_profiles ADD COLUMN IF NOT EXISTS bio_short VARCHAR(200);
ALTER TABLE entrepreneur_profiles ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(60);
ALTER TABLE entrepreneur_profiles ADD COLUMN IF NOT EXISTS classroom_location VARCHAR(100);
