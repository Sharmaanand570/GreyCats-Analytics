import { useState, useCallback } from 'react';
import type { AuditResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface AuditHistoryItem {
  id: string;
  domain: string;
  url: string;
  overall_grade: string;
  created_at: string;
}

interface RunAuditOptions {
  url: string;
  forceRefresh?: boolean;
}

export const useAudit = () => {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const getToken = () => {
    let token = localStorage.getItem("ANALYTICS_TOKEN_KEY_");
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    return token;
  };

  const runAudit = async ({ url, forceRefresh = false }: RunAuditOptions) => {
    setLoading(true);
    setError(null);
    setAudit(null);
    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/seo-report/audit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url, forceRefresh }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Audit failed');
      }
      const data = await res.json();
      setAudit(data);
      
      // Refresh history after a successful new audit
      if (token) {
        fetchMyHistory();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditById = async (id: string) => {
    setLoading(true);
    setError(null);
    setAudit(null);
    try {
      const res = await fetch(`${API_BASE_URL}/seo-report/audit/${id}`);
      if (!res.ok) throw new Error('Audit not found');
      setAudit(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const token = getToken();
      if (!token) return; // No history for anonymous

      const res = await fetch(`${API_BASE_URL}/seo-report/my-audits`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error("Unauthorized or failed to fetch history");
      
      const data = await res.json();
      setHistory(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const downloadPDF = (id: string) => {
    window.open(`${API_BASE_URL}/seo-report/audit/${id}/pdf`, '_blank');
  };

  return { audit, loading, error, history, historyLoading, runAudit, fetchAuditById, fetchMyHistory, downloadPDF, setAudit };
};
