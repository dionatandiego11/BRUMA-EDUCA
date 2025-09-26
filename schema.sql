-- ==========================
-- DROP ORDEM CORRETA
-- ==========================
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS gabaritos CASCADE;
DROP TABLE IF EXISTS questoes CASCADE;
DROP TABLE IF EXISTS provoes_turmas CASCADE;
DROP TABLE IF EXISTS provoes CASCADE;
DROP TABLE IF EXISTS turmas_professores CASCADE;
DROP TABLE IF EXISTS matriculas CASCADE;
DROP TABLE IF EXISTS alunos CASCADE;
DROP TABLE IF EXISTS professores CASCADE;
DROP TABLE IF EXISTS turmas CASCADE;
DROP TABLE IF EXISTS series CASCADE;
DROP TABLE IF EXISTS escolas CASCADE;

DROP TYPE IF EXISTS disciplina_enum CASCADE;
DROP TYPE IF EXISTS alternativa_enum CASCADE;

-- ==========================
-- ENUMS
-- ==========================
CREATE TYPE disciplina_enum AS ENUM ('Português', 'Matemática');
CREATE TYPE alternativa_enum AS ENUM ('A', 'B', 'C', 'D');

-- ==========================
-- ESCOLAS
-- ==========================
CREATE TABLE escolas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    codigo_inep TEXT NOT NULL UNIQUE,
    localizacao TEXT NOT NULL CHECK (localizacao IN ('Urbano', 'Rural')),
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- ==========================
-- SERIES
-- ==========================
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    escola_id UUID NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- ==========================
-- TURMAS
-- ==========================
CREATE TABLE turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    serie_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- ==========================
-- PROFESSORES
-- ==========================
CREATE TABLE professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- Relacionamento N:N turmas x professores
CREATE TABLE turmas_professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    UNIQUE (turma_id, professor_id)
);

-- ==========================
-- ALUNOS
-- ==========================
CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    matricula TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- Matrículas (N:N aluno ↔ turma)
CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now()),
    UNIQUE (aluno_id, turma_id)
);

-- ==========================
-- PROVÕES
-- ==========================
CREATE TABLE provoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    data DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- Relacionamento N:N provões ↔ turmas
CREATE TABLE provoes_turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provao_id UUID NOT NULL REFERENCES provoes(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    UNIQUE (provao_id, turma_id)
);

-- ==========================
-- QUESTÕES
-- ==========================
CREATE TABLE questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provao_id UUID NOT NULL REFERENCES provoes(id) ON DELETE CASCADE,
    disciplina disciplina_enum NOT NULL,
    habilidade_codigo TEXT NOT NULL,
    ordem INT,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- ==========================
-- GABARITOS
-- ==========================
CREATE TABLE gabaritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id UUID NOT NULL UNIQUE REFERENCES questoes(id) ON DELETE CASCADE,
    resposta_correta alternativa_enum NOT NULL,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- ==========================
-- SCORES
-- ==========================
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    resposta alternativa_enum NOT NULL,
    created_at TIMESTAMP DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP DEFAULT timezone('utc', now()),
    UNIQUE (aluno_id, questao_id)
);

-- ==========================
-- ÍNDICES DE PERFORMANCE
-- ==========================
CREATE INDEX idx_provoes_turmas_provao_id ON provoes_turmas(provao_id);
CREATE INDEX idx_provoes_turmas_turma_id ON provoes_turmas(turma_id);

CREATE INDEX idx_scores_aluno_questao ON scores(aluno_id, questao_id);
CREATE INDEX idx_questoes_provao_id ON questoes(provao_id);
CREATE INDEX idx_matriculas_turma_id ON matriculas(turma_id);
CREATE INDEX idx_series_escola_id ON series(escola_id);
CREATE INDEX idx_turmas_serie_id ON turmas(serie_id);
