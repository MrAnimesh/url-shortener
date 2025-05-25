import { useState, useEffect } from 'react';

type ErrorInfo = {
  id: string;
  message: string;
};

let listeners: any[] = [];
let errors: ErrorInfo[] = [];

export const addError = (message: string) => {
  const id = Date.now().toString();
  errors.push({
    id,
    message: message.trim()
  });
  
  // Set auto-remove timer when adding error
  setTimeout(() => {
    removeError(id);
  }, 3000);
  
  listeners.forEach(fn => fn());
};

const removeError = (id: string) => {
  errors = errors.filter(error => error.id !== id);
  listeners.forEach(fn => fn());
};

export const useErrorStore = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const update = () => forceUpdate({});
    listeners.push(update);
    return () => {
      listeners = listeners.filter(fn => fn !== update);
    };
  }, []);

  return { 
    errors, 
    removeError 
  };
};