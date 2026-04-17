DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE role_enum AS ENUM('visitor_registered', 'entrepreneur', 'admin');
CREATE TYPE project_status_enum AS ENUM('active', 'suspended');
CREATE TYPE claim_ticket_status_enum AS ENUM('pending', 'resolved');
CREATE TYPE announcement_status_enum AS ENUM('active', 'pending_review', 'rejected', 'shadowban', 'expired');
CREATE TYPE report_reason_enum AS ENUM('offensive', 'spam', 'false_info', 'other');
CREATE TYPE moderation_trigger_enum AS ENUM('vision_api', 'bad_words', 'phash', 'report_threshold');
CREATE TYPE admin_action_enum AS ENUM('approved', 'rejected', 'rejected_suspended');
CREATE TYPE notification_type_enum AS ENUM('approved', 'rejected', 'pending', 'expiring_soon', 'shadowban');

-- ═══════════════════════════════════════════════════════════════
-- TABLA: users
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(8) NOT NULL UNIQUE,
    role role_enum NOT NULL,
    password_hash VARCHAR(255),
    whatsapp_number VARCHAR(20),
    privacy_accepted BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: entrepreneur_profiles (ADR-09)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE entrepreneur_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(80) NOT NULL,
    bio_short VARCHAR(200),
    profile_photo_url VARCHAR(500),
    profile_photo_id VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: categories
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    group_name VARCHAR(60) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: projects (RN-03: max 5 activos validado en backend)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    status project_status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: announcements (RN-04: max 3 activos validado en backend)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    custom_category VARCHAR(80),
    cloudinary_url VARCHAR(500) NOT NULL,
    cloudinary_id VARCHAR(200) NOT NULL,
    status announcement_status_enum DEFAULT 'active',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: image_hashes (entidad satélite de announcements)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE image_hashes (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    dhash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: likes (RF-12, RF-14)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reverted_at TIMESTAMP,
    is_accidental BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, announcement_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: ratings (RF-13, RF-14)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP,
    reverted_at TIMESTAMP,
    is_accidental BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, announcement_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: reports (RF-36, RN-13)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    reason report_reason_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reporter_id, announcement_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: moderation_queue (RF-37, RF-38)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE moderation_queue (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    trigger_type moderation_trigger_enum NOT NULL,
    trigger_detail TEXT,
    urgency_alert_at TIMESTAMP,
    shadowban_at TIMESTAMP,
    admin_action admin_action_enum,
    admin_id INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: notifications (RF-25)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: claim_tickets (RF-35)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE claim_tickets (
    id SERIAL PRIMARY KEY,
    disputed_matricula VARCHAR(8) NOT NULL,
    claimant_whatsapp VARCHAR(20) NOT NULL,
    status claim_ticket_status_enum DEFAULT 'pending',
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
