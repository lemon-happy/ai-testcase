import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return { user, token, isAuthenticated, setAuth, clearAuth, logout };
}
