'use client';

import { createContext, useContext } from 'react';
import { useModal, ModalContainer } from './Modal';
import { useToast, ToastContainer } from './Toast';

const ModalContext = createContext();

export const useGlobalModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useGlobalModal debe usarse dentro de ModalContextProvider');
  }
  return context;
};

export const ModalContextProvider = ({ children }) => {
  const modalSystem = useModal();
  const toastSystem = useToast();

  // Combinar ambos sistemas
  const combinedSystem = {
    // Modal methods
    ...modalSystem,
    // Toast methods con prefijo toast para diferenciación
    toast: toastSystem.addToast,
    toastSuccess: toastSystem.success,
    toastError: toastSystem.error,
    toastWarning: toastSystem.warning,
    toastInfo: toastSystem.info,
    // Alias más cortos para usar toasts por defecto en lugar de modales
    notify: toastSystem.success,
    notifyError: toastSystem.error,
    notifyWarning: toastSystem.warning,
    notifyInfo: toastSystem.info,
  };

  return (
    <ModalContext.Provider value={combinedSystem}>
      {children}
      <ModalContainer 
        modals={modalSystem.modals} 
        onCloseModal={modalSystem.closeModal} 
      />
      <ToastContainer 
        toasts={toastSystem.toasts} 
        onRemoveToast={toastSystem.removeToast} 
        position="top-right"
      />
    </ModalContext.Provider>
  );
};
