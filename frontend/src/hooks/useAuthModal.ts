import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register } = useAuth();

  const openModal = (initialMode: 'login' | 'register' = 'login') => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    await register(name, email, password);
  };

  return {
    isOpen,
    mode,
    openModal,
    closeModal,
    switchMode,
    handleLogin,
    handleRegister,
  };
};