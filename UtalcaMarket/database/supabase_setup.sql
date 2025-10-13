-- Crear tabla de publicaciones en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Crear tabla publications
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('electronics', 'books', 'clothing', 'home', 'sports', 'other')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON public.publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_category ON public.publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON public.publications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_price ON public.publications(price);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Política para que cualquier usuario autenticado pueda ver todas las publicaciones
CREATE POLICY "Anyone can view publications" ON public.publications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que los usuarios solo puedan insertar sus propias publicaciones
CREATE POLICY "Users can insert their own publications" ON public.publications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propias publicaciones
CREATE POLICY "Users can update their own publications" ON public.publications
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propias publicaciones
CREATE POLICY "Users can delete their own publications" ON public.publications
    FOR DELETE USING (auth.uid() = user_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_publications_updated_at ON public.publications;
CREATE TRIGGER update_publications_updated_at
    BEFORE UPDATE ON public.publications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunas publicaciones de ejemplo (opcional)
-- Solo ejecutar si quieres datos de prueba
/*
INSERT INTO public.publications (title, description, price, category, user_id) VALUES
('iPhone 13 Pro', 'iPhone 13 Pro en excelente estado, 128GB, color azul. Incluye cargador original.', 800000, 'electronics', auth.uid()),
('Libro de Programación', 'Clean Code: A Handbook of Agile Software Craftsmanship. Estado como nuevo.', 25000, 'books', auth.uid()),
('Polera Universidad', 'Polera oficial de la universidad, talla M, color azul marino.', 15000, 'clothing', auth.uid());
*/