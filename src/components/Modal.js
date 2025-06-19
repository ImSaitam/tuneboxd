'use client';

import { useState, useEffect } from 'react';

// Hook para manejo de modales
export const useModal = () => {
  const [modals, setModals] = useState([]);

  const showModal = (options) => {
    const id = Date.now() + Math.random();
    const modal = {
      id,
      title: options.title || 'Aviso',
      message: options.message || '',
      type: options.type || 'info', // 'info', 'warning', 'error', 'success', 'confirm'
      confirmText: options.confirmText || 'Aceptar',
      cancelText: options.cancelText || 'Cancelar',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      autoClose: options.autoClose || false,
      duration: options.duration || 5000
    };

    setModals(prev => [...prev, modal]);

    // Auto-close para notificaciones
    if (modal.autoClose && modal.type !== 'confirm') {
      setTimeout(() => {
        closeModal(id);
      }, modal.duration);
    }

    return id;
  };

  const closeModal = (id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  // Funciones de conveniencia
  const alert = (message, title = 'Aviso') => {
    return showModal({ message, title, type: 'info' });
  };

  const confirm = (message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      showModal({
        message,
        title,
        type: 'confirm',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const success = (message, title = 'Éxito') => {
    return showModal({ 
      message, 
      title, 
      type: 'success', 
      autoClose: true,
      duration: 3000 
    });
  };

  const error = (message, title = 'Error') => {
    return showModal({ message, title, type: 'error' });
  };

  const warning = (message, title = 'Advertencia') => {
    return showModal({ message, title, type: 'warning' });
  };

  return {
    modals,
    closeModal,
    alert,
    confirm,
    success,
    error,
    warning
  };
};

// Componente Modal
export const Modal = ({ modal, onClose }) => {
  const getModalIcon = () => {
    switch (modal.type) {
      case 'success':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
        );
    }
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={modal.type !== 'confirm' ? () => onClose() : undefined}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {getModalIcon()}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {modal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {modal.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {modal.type === 'confirm' ? (
              <>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={handleConfirm}
                >
                  {modal.confirmText}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={handleCancel}
                >
                  {modal.cancelText}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                onClick={handleConfirm}
              >
                {modal.confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente contenedor de modales
export const ModalContainer = ({ modals, onCloseModal }) => {
  return (
    <>
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          modal={modal}
          onClose={() => onCloseModal(modal.id)}
        />
      ))}
    </>
  );
};

// Componente Provider para usar en toda la app
export const ModalProvider = ({ children }) => {
  const modalSystem = useModal();

  return (
    <div>
      {children}
      <ModalContainer 
        modals={modalSystem.modals} 
        onCloseModal={modalSystem.closeModal} 
      />
    </div>
  );
};
