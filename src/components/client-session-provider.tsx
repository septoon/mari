'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react';

import { clientSessionSchema, type ClientProfile, type ClientSession } from '@/lib/api/contracts';

type SessionContextValue = {
  session: ClientSession;
  status: 'loading' | 'ready';
  refreshSession: () => Promise<void>;
  setAuthenticatedClient: (client: ClientProfile) => void;
  setLoggedOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const defaultSession: ClientSession = {
  authenticated: false,
  client: null
};

export function ClientSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ClientSession>(defaultSession);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  const refreshSession = useCallback(async (withLoading = true) => {
    if (withLoading) {
      setStatus('loading');
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        cache: 'no-store'
      });
      const payload = await response.json();
      const parsed = clientSessionSchema.parse(payload.data);

      startTransition(() => {
        setSession(parsed);
        setStatus('ready');
      });
    } catch (error) {
      console.error('[SESSION_REFRESH_FAILED]', error);
      startTransition(() => {
        setSession(defaultSession);
        setStatus('ready');
      });
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void refreshSession(false);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [refreshSession]);

  const value: SessionContextValue = {
    session,
    status,
    refreshSession: async () => refreshSession(true),
    setAuthenticatedClient: (client) => {
      startTransition(() => {
        setSession({
          authenticated: true,
          client
        });
        setStatus('ready');
      });
    },
    setLoggedOut: () => {
      startTransition(() => {
        setSession(defaultSession);
        setStatus('ready');
      });
    }
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useClientSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useClientSession must be used inside ClientSessionProvider');
  }

  return context;
};
