import express from 'express';
import { createServer as createViteServer } from 'vite';
import { 
  getDbUsers, 
  insertDbUser, 
  getDbRequests, 
  insertDbRequest, 
  updateDbRequest, 
  deleteDbRequest,
  syncAllDataToSupabase,
  seedInitialDataIfEmpty 
} from './src/db/queries.ts';

const app = express();
const port = 3000;

app.use(express.json());

import { 
  getSupabaseStatus, 
  configureSupabase, 
  disconnectSupabase,
  SUPABASE_SQL_SCHEMA
} from './src/db/supabase.ts';

// Supabase configuration endpoints
app.get('/api/supabase/status', (req, res) => {
  res.json(getSupabaseStatus());
});

app.post('/api/supabase/config', async (req, res) => {
  try {
    const { url, key } = req.body;
    const result = await configureSupabase(url, key);
    res.json(result);
  } catch (error: any) {
    console.error('Error configuring Supabase:', error);
    res.status(400).json({ error: error.message || 'Falha ao conectar com o Supabase' });
  }
});

app.post('/api/supabase/disconnect', (req, res) => {
  res.json(disconnectSupabase());
});

app.post('/api/supabase/sync', async (req, res) => {
  try {
    const result = await syncAllDataToSupabase();
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing data to Supabase:', error);
    res.status(500).json({ error: error.message || 'Falha ao sincronizar dados com o Supabase' });
  }
});

app.get('/api/supabase/sql-schema', (req, res) => {
  res.json({ sql: SUPABASE_SQL_SCHEMA });
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const data = await getDbUsers();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar colaboradores' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await insertDbUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: error.message || 'Erro ao cadastrar colaborador' });
  }
});

// Vacation requests endpoints
app.get('/api/requests', async (req, res) => {
  try {
    const data = await getDbRequests();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar solicitações de férias' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const newReq = await insertDbRequest(req.body);
    res.status(201).json(newReq);
  } catch (error: any) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar solicitação de férias' });
  }
});

app.patch('/api/requests/:id', async (req, res) => {
  try {
    const updated = await updateDbRequest(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar solicitação de férias' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await deleteDbRequest(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir solicitação de férias' });
  }
});

async function startServer() {
  // Check and seed initial data if database is empty
  await seedInitialDataIfEmpty();

  // In development, mount Vite dev server middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} with PostgreSQL / Cloud SQL integration`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
