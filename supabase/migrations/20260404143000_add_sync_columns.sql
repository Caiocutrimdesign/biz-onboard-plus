ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS status_sincronia TEXT DEFAULT 'pendente';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS erro_log TEXT;