import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <span className="text-cyan-400">▲</span> ContractPro
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </motion.div>
        </AnimatePresence>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;