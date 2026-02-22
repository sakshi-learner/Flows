import { useAuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const c = useAuthContext();
  return {
    user: c.user,
    loading: c.loading,
    isAuthenticated: c.isAuthenticated,
    login: c.login,
    logout: c.logout,
    verifyAuth: c.verifyAuth,
    facebookLogin: c.facebookLogin,
  };
};
