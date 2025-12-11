CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- TABLA: dni_records
-- ============================================
CREATE TABLE dni_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    dni VARCHAR(8) NOT NULL,
    
    -- Datos cifrados con AES-256-GCM
    encrypted_data TEXT NOT NULL,      -- Datos cifrados (nombre, paterno, materno)
    iv VARCHAR(32) NOT NULL,           -- Initialization Vector
    auth_tag VARCHAR(32) NOT NULL,     -- Authentication Tag para GCM
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_dni_records_user_id ON dni_records(user_id);
CREATE INDEX idx_dni_records_dni ON dni_records(dni);
CREATE INDEX idx_dni_records_created_at ON dni_records(created_at DESC);

-- Índice compuesto para evitar duplicados por usuario
CREATE UNIQUE INDEX idx_dni_records_user_dni ON dni_records(user_id, dni);

-- ============================================
-- TABLA: audit_log (opcional - para auditoría)
-- ============================================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,        -- 'CONSULTA_DNI', 'LOGIN', 'REGISTRO'
    dni VARCHAR(8),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para dni_records
CREATE TRIGGER update_dni_records_updated_at 
    BEFORE UPDATE ON dni_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
