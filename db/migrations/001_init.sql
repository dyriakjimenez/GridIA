-- Migración 001: Inicialización de la base de datos (Neon)

CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CLIENT', 'LID')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_email)
);

CREATE TABLE IF NOT EXISTS grids (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grid_versions (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER REFERENCES grids(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grid_id, version_number)
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    grid_version_id INTEGER REFERENCES grid_versions(id) ON DELETE CASCADE,
    dia INTEGER NOT NULL,
    fecha DATE NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    enfoque_publicacion VARCHAR(50),
    etapa_funnel VARCHAR(50),
    idea_principal TEXT,
    copy_in TEXT,
    copy_out TEXT,
    explicacion_arte TEXT,
    formato_arte VARCHAR(50),
    master_prompt_midjourney TEXT,
    video_details JSONB,
    paso_a_paso TEXT,
    
    -- Campos de Cliente
    estado_foco VARCHAR(100),
    tecnicismos_regionales JSONB,
    
    -- Campos de LID
    redes_sociales JSONB,
    audiencia VARCHAR(255),
    insight TEXT,
    pilar VARCHAR(100),
    propiedad VARCHAR(100),
    tipo_post VARCHAR(100),
    tema_campana VARCHAR(255),
    ficha_canal TEXT,
    repurposing TEXT,
    hashtags JSONB,

    UNIQUE(grid_version_id, dia)
);
