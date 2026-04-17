DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Tipos Enum
CREATE TYPE role_enum AS ENUM('visitor_registered', 'entrepreneur', 'admin');
CREATE TYPE project_status_enum AS ENUM('active', 'suspended');
CREATE TYPE claim_ticket_status_enum AS ENUM('pending', 'resolved');

-- TABLA: users
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

-- TABLA: entrepreneur_profiles
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

-- TABLA: categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    group_name VARCHAR(60) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- TABLA: projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    status project_status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: claim_tickets
CREATE TABLE claim_tickets (
    id SERIAL PRIMARY KEY,
    disputed_matricula VARCHAR(8) NOT NULL,
    claimant_whatsapp VARCHAR(20) NOT NULL,
    status claim_ticket_status_enum DEFAULT 'pending',
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
