export type { CurrentUser, Role, AuthConfig } from './model/types';
export { isElevated } from './model/types';
export {
  login,
  getCurrentUser,
  logout,
  getAuthConfig,
  OAUTH_LOGIN_URL,
} from './api/auth.api';
export {
  useCurrentUser,
  useAuthConfig,
  useLogin,
  useLogout,
  CURRENT_USER_KEY,
} from './model/use-auth';
