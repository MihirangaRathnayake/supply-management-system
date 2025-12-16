import React, { createContext, useContext, useEffect, useState } from 'react';

const UnsavedChangesContext = createContext({
  hasUnsavedChanges: false,
  message: '',
  setUnsavedChanges: () => {}
});

export const UnsavedChangesProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState('You have unsaved changes.');

  useEffect(() => {
    const handler = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
      return undefined;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges, message]);

  const setUnsavedChanges = (dirty, customMessage) => {
    setHasUnsavedChanges(Boolean(dirty));
    if (customMessage) {
      setMessage(customMessage);
    }
  };

  return (
    <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, message, setUnsavedChanges }}>
      {children}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 z-50 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg shadow-lg text-sm">
          Unsaved changes — finish or save before leaving this page.
        </div>
      )}
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChanges = (isDirty, alertMessage) => {
  const { setUnsavedChanges } = useContext(UnsavedChangesContext);
  useEffect(() => {
    setUnsavedChanges(isDirty, alertMessage);
    return () => setUnsavedChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, alertMessage]);
};
