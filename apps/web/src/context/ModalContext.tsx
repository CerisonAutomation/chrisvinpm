import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  contactOpen: boolean;
  ownerOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
  openOwner: () => void;
  closeOwner: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        contactOpen,
        ownerOpen,
        openContact: () => setContactOpen(true),
        closeContact: () => setContactOpen(false),
        openOwner: () => setOwnerOpen(true),
        closeOwner: () => setOwnerOpen(false),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
