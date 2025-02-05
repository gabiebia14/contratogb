import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

export const useAuth = () => {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        toast.error('Email ou senha incorretos. Por favor, verifique suas credenciais.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado. Por favor, registre-se primeiro.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta. Por favor, tente novamente.');
      } else {
        toast.error('Erro ao fazer login. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está em uso. Por favor, use outro email.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido. Por favor, verifique o formato do email.');
      } else {
        toast.error('Erro ao criar conta. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout.');
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout
  };
};