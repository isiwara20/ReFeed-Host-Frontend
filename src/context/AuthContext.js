import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(undefined);

const LOCAL_STORAGE_KEY = "currentUser";
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

const isSessionExpired = (userData) => {
  if (!userData || !userData._expiresAt) return false;
  return Date.now() > userData._expiresAt;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isSessionExpired(parsed)) {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Persist user changes.
  useEffect(() => {
    try {
      if (currentUser) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to persist currentUser to storage", error);
    }
  }, [currentUser]);

  // Check expiry every minute while the tab is open.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUser((prev) => {
        if (prev && isSessionExpired(prev)) {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          return null;
        }
        return prev;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    if (!userData) return setCurrentUser(null);
    // Stamp an expiry time onto the session object.
    setCurrentUser({
      ...userData,
      _expiresAt: Date.now() + SESSION_DURATION_MS,
    });
  };

  const logout = () => setCurrentUser(null);

  const value = {
    user: currentUser,
    currentUser,
    setCurrentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    loading,
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        setCurrentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};