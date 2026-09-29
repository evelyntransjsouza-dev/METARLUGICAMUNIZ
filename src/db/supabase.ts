import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

let activeSupabaseClient: SupabaseClient | null = null;
let currentSupabaseUrl = process.env.SUPABASE_URL || '';
let currentSupabaseKey = process.env.SUPABASE_KEY || '';

// Initialize if env vars are present
if (currentSupabaseUrl && currentSupabaseKey && !currentSupabaseUrl.includes('your-project')) {
  try {
    activeSupabaseClient = createClient(currentSupabaseUrl, currentSupabaseKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client from env:', err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return activeSupabaseClient;
}

export function getSupabaseStatus() {
  return {
    isConfigured: !!activeSupabaseClient,
    url: currentSupabaseUrl || '',
    hasKey: !!currentSupabaseKey,
    keyPreview: currentSupabaseKey ? `${currentSupabaseKey.slice(0, 8)}...${currentSupabaseKey.slice(-4)}` : '',
  };
}

export async function configureSupabase(url: string, key: string) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (!cleanUrl || !cleanKey) {
    throw new Error('A URL e a Chave de API do Supabase são obrigatórias.');
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('A URL do Supabase deve começar com https:// (ex: https://xyz.supabase.co)');
  }

  // Create temporary test client
  const testClient = createClient(cleanUrl, cleanKey);

  // Test connection by attempting a lightweight query
  // Even if table doesn't exist yet, Supabase returns a known error code (not a network crash)
  try {
    const { error } = await testClient.from('users').select('id').limit(1);
    // If error code is 42P01 (relation does not exist), connection is still valid, tables just need to be created!
    if (error && error.code !== '42P01') {
      console.warn('Supabase test returned message:', error.message);
    }
  } catch (err: any) {
    console.error('Connection test failed:', err);
    throw new Error(`Falha ao conectar com o Supabase: ${err.message || 'Verifique a URL e a Chave'}`);
  }

  // Apply to active client
  activeSupabaseClient = testClient;
  currentSupabaseUrl = cleanUrl;
  currentSupabaseKey = cleanKey;

  // Persist to .env if possible
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Replace or append SUPABASE_URL and SUPABASE_KEY
    if (envContent.includes('SUPABASE_URL=')) {
      envContent = envContent.replace(/SUPABASE_URL=.*/g, `SUPABASE_URL="${cleanUrl}"`);
    } else {
      envContent += `\nSUPABASE_URL="${cleanUrl}"`;
    }

    if (envContent.includes('SUPABASE_KEY=')) {
      envContent = envContent.replace(/SUPABASE_KEY=.*/g, `SUPABASE_KEY="${cleanKey}"`);
    } else {
      envContent += `\nSUPABASE_KEY="${cleanKey}"`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (e) {
    console.warn('Could not write to .env file, in-memory client will be used:', e);
  }

  return {
    success: true,
    message: 'Conectado com sucesso ao Supabase!',
    url: cleanUrl,
  };
}

export function disconnectSupabase() {
  activeSupabaseClient = null;
  currentSupabaseUrl = '';
  currentSupabaseKey = '';
  return { success: true };
}

// SQL Script for user to copy & paste in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- MUNIZ METALÚRGICA - SCRIPT SQL COMPLETO COM POLÍTICAS DE ARMAZENAMENTO E RLS
-- Copie e cole este script no SQL Editor do seu projeto Supabase (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. TABELA DE COLABORADORES E DIRETORIA
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee', -- 'employee' ou 'owner'
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  admission_date TEXT NOT NULL,
  total_vacation_days INTEGER DEFAULT 30,
  used_vacation_days INTEGER DEFAULT 0,
  badge_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE SOLICITAÇÕES DE FÉRIAS E ACORDOS
CREATE TABLE IF NOT EXISTS public.vacation_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_phone TEXT NOT NULL,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  requested_days INTEGER NOT NULL,
  agreed_days INTEGER,
  agreed_start_date TEXT,
  agreed_end_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'canceled'
  sell_vacation_allowance BOOLEAN DEFAULT FALSE,
  is_installment BOOLEAN DEFAULT FALSE,
  installment_period TEXT,
  employee_notes TEXT,
  owner_notes TEXT,
  reviewed_at TEXT,
  document_url TEXT, -- Link para documento/recibo anexado no Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) NAS TABELAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO PARA A TABELA USERS
DROP POLICY IF EXISTS "Permitir leitura de colaboradores" ON public.users;
CREATE POLICY "Permitir leitura de colaboradores" 
  ON public.users 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir cadastro de colaboradores" ON public.users;
CREATE POLICY "Permitir cadastro de colaboradores" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de colaboradores" ON public.users;
CREATE POLICY "Permitir atualização de colaboradores" 
  ON public.users 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de colaboradores" ON public.users;
CREATE POLICY "Permitir exclusão de colaboradores" 
  ON public.users 
  FOR DELETE 
  USING (true);

-- 5. POLÍTICAS DE ACESSO PARA A TABELA VACATION_REQUESTS
DROP POLICY IF EXISTS "Permitir leitura de solicitações" ON public.vacation_requests;
CREATE POLICY "Permitir leitura de solicitações" 
  ON public.vacation_requests 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir criação de solicitações" ON public.vacation_requests;
CREATE POLICY "Permitir criação de solicitações" 
  ON public.vacation_requests 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização e acordo de férias" ON public.vacation_requests;
CREATE POLICY "Permitir atualização e acordo de férias" 
  ON public.vacation_requests 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir cancelamento e exclusão de solicitações" ON public.vacation_requests;
CREATE POLICY "Permitir cancelamento e exclusão de solicitações" 
  ON public.vacation_requests 
  FOR DELETE 
  USING (true);

-- ==============================================================================
-- 6. CRIAÇÃO DO BUCKET DE ARMAZENAMENTO (STORAGE) PARA DOCUMENTOS DE FÉRIAS
-- Armazena: recibos de férias, avisos prévios assinados, atestados e comprovantes
-- ==============================================================================

-- Criar o bucket 'vacation-documents' caso não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vacation-documents',
  'vacation-documents',
  true,
  10485760, -- Limite de 10MB por arquivo
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 7. POLÍTICAS DE ARMAZENAMENTO (STORAGE POLICIES PARA STORAGE.OBJECTS)
-- Garante que o aplicativo web possa salvar e consultar arquivos de férias

-- Leitura de arquivos do bucket vacation-documents
DROP POLICY IF EXISTS "Acesso público de leitura aos documentos de férias" ON storage.objects;
CREATE POLICY "Acesso público de leitura aos documentos de férias"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vacation-documents');

-- Upload de arquivos para o bucket vacation-documents
DROP POLICY IF EXISTS "Permitir upload de documentos de férias" ON storage.objects;
CREATE POLICY "Permitir upload de documentos de férias"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'vacation-documents');

-- Atualização/substituição de documentos no bucket vacation-documents
DROP POLICY IF EXISTS "Permitir atualização de documentos de férias" ON storage.objects;
CREATE POLICY "Permitir atualização de documentos de férias"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'vacation-documents')
  WITH CHECK (bucket_id = 'vacation-documents');

-- Exclusão de documentos no bucket vacation-documents
DROP POLICY IF EXISTS "Permitir exclusão de documentos de férias" ON storage.objects;
CREATE POLICY "Permitir exclusão de documentos de férias"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'vacation-documents');
`;

