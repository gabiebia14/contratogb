
type ErrorCode = 
  | 'auth/invalid-credential'
  | 'auth/invalid-login-credentials'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email';

const getLoginErrorMessage = (code: ErrorCode): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Email ou senha incorretos. Se você ainda não tem uma conta, por favor registre-se primeiro.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Por favor, registre-se primeiro.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Por favor, tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Por favor, tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
    default:
      return 'Erro ao fazer login. Por favor, tente novamente.';
  }
};

const getRegisterErrorMessage = (code: ErrorCode): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este email já está em uso. Por favor, use outro email ou faça login.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Email inválido. Por favor, verifique o formato do email.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
    default:
      return 'Erro ao criar conta. Por favor, tente novamente.';
  }
};

export { getLoginErrorMessage, getRegisterErrorMessage };
export type { ErrorCode };
