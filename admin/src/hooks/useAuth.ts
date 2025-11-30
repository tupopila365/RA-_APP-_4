import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * Re-exports the useAuth hook from AuthContext for convenience
 */
export const useAuth = useAuthContext;

export default useAuth;
