import React, { useState, useEffect } from 'react';
import { 
  Database, 
  KeyRound, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  RefreshCw,
  PowerOff,
  FileCode,
  ShieldCheck,
  HardDrive,
  ChevronDown,
  ChevronUp,
  UploadCloud
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{
    isConfigured: boolean;
    url: string;
    hasKey: boolean;
    keyPreview: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      loadSql();
    }
  }, [isOpen]);

  const loadSql = async () => {
    try {
      const res = await fetch('/api/supabase/sql-schema');
      if (res.ok) {
        const data = await res.json();
        setSqlContent(data.sql || '');
      }
    } catch (e) {
      console.error(e);
    }
  };


  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.url) setUrl(data.url);
      }
    } catch (err) {
      console.error('Failed to get Supabase status:', err);
    }
  };

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), key: apiKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao conectar ao Supabase');
      }

      setMessage({ type: 'success', text: data.message || 'Conectado com sucesso ao Supabase!' });
      await fetchStatus();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Falha ao conectar' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch('/api/supabase/disconnect', { method: 'POST' });
      setUrl('');
      setApiKey('');
      setMessage({ type: 'success', text: 'Supabase desconectado. Usando banco Cloud SQL local.' });
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao sincronizar dados com o Supabase');
      }
      setMessage({ 
        type: 'success', 
        text: data.message || `Sincronização concluída! ${data.usersSynced || 0} colaboradores e ${data.requestsSynced || 0} solicitações foram enviados para o Supabase!` 
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao sincronizar informações com o Supabase.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = async () => {
    try {
      const res = await fetch('/api/supabase/sql-schema');
      const data = await res.json();
      await navigator.clipboard.writeText(data.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Conexão Supabase
                </h3>
                {status?.isConfigured ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Conectado
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    Cloud SQL Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Insira a URL e a API Key do seu projeto Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {message && (
            <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            
            {/* Field: Supabase Project URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                URL do Projeto (Project URL)
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API
              </span>
            </div>

            {/* Field: API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  API Key (Chave Anon ou Service Role)
                </label>
                {status?.hasKey && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Atual: {status.keyPreview}
                  </span>
                )}
              </div>
              <input
                type="password"
                required={!status?.isConfigured}
                placeholder={status?.isConfigured ? 'Digite para alterar a chave atual' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Sua chave pública (anon/public) ou service_role key do Supabase.
              </span>
            </div>

            {/* Submit & Disconnect Buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Salvar &amp; Conectar Supabase</span>
              </button>

              {status?.isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading || syncing}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Desconectar Supabase e voltar para Cloud SQL local"
                >
                  <PowerOff className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>

          {/* Sync All Data to Supabase Card */}
          {status?.isConfigured && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-200">
                      Enviar Informações para o Supabase
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Envie todos os colaboradores e pedidos existentes diretamente para as tabelas do Supabase.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSync}
                disabled={syncing || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/40"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando dados para o Supabase...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Sincronizar Todas as Informações Agora</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Helper: SQL with Storage and RLS Policies */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Script SQL + Políticas de Armazenamento
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Tabelas, RLS e Bucket de Storage prontos
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSqlPreview(!showSqlPreview)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>{showSqlPreview ? 'Recolher' : 'Visualizar'}</span>
                    {showSqlPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Badges of what is included */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px]">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <Database className="w-3 h-3 mr-1 text-emerald-400" />
                  Tabelas: users &amp; vacation_requests
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3 h-3 mr-1 text-cyan-400" />
                  RLS Ativado (8 Políticas)
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <HardDrive className="w-3 h-3 mr-1 text-amber-400" />
                  Bucket: vacation-documents
                </span>
              </div>

              {/* Expandable Preview */}
              {showSqlPreview && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span>Preview do Script SQL:</span>
                    <span className="text-[10px] text-slate-500">Cole no Supabase &gt; SQL Editor</span>
                  </div>
                  <pre className="max-h-56 overflow-y-auto p-3 bg-slate-950 rounded-lg text-[10px] text-emerald-300/90 font-mono border border-slate-800/90 whitespace-pre leading-relaxed select-all">
                    {sqlContent || 'Carregando script...'}
                  </pre>
                </div>
              )}
            </div>
          </div>


        </div>

      </div>
    </div>
  );
};
