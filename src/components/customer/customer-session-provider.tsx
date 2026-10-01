"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  customerApi,
  CustomerUnauthenticatedError,
  type CustomerProfile,
} from "@/lib/commerce/customer-api";

type CustomerSessionContextValue = {
  error: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: CustomerProfile | null) => void;
  user: CustomerProfile | null;
};

const CustomerSessionContext =
  createContext<CustomerSessionContextValue | null>(null);

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await customerApi.session();
      setUser(session.user);
    } catch (nextError) {
      setUser(null);
      if (!(nextError instanceof CustomerUnauthenticatedError)) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "CUSTOMER_SESSION_LOAD_FAILED",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  const logout = useCallback(async () => {
    await customerApi.logout();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<CustomerSessionContextValue>(
    () => ({
      error,
      loading,
      logout,
      refresh,
      setUser,
      user,
    }),
    [error, loading, logout, refresh, user],
  );

  return (
    <CustomerSessionContext.Provider value={value}>
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession(): CustomerSessionContextValue {
  const context = useContext(CustomerSessionContext);

  if (!context) {
    throw new Error("CUSTOMER_SESSION_PROVIDER_MISSING");
  }

  return context;
}

export function useOptionalCustomerSession(): CustomerSessionContextValue | null {
  return useContext(CustomerSessionContext);
}
