import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  duration = 5000, // Increased duration for better visibility
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 shadow-green-100';
      case 'error':
        return 'bg-red-50 border-red-200 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 shadow-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 shadow-blue-100';
      default:
        return 'bg-green-50 border-green-200 shadow-green-100';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div 
      className={`
        fixed top-4 right-4 z-[9999] transition-all duration-300 ease-in-out
        ${isExiting 
          ? 'opacity-0 transform translate-x-full scale-95' 
          : 'opacity-100 transform translate-x-0 scale-100'
        }
      `}
      style={{ zIndex: 9999 }} // Ensure it's above everything
    >
      <div className={`
        flex items-center space-x-3 p-4 rounded-lg border-2 shadow-lg max-w-sm min-w-[300px]
        ${getBackgroundColor()}
        backdrop-blur-sm
      `}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className={`flex-1 text-sm font-medium ${getTextColor()}`}>
          {message}
        </p>
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors 
            ${getTextColor()}
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{ 
            zIndex: 9999 + index,
            transform: `translateY(${index * 10}px)` // Slight stagger effect
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration + animation time
    setTimeout(() => {
      removeToast(id);
    }, duration + 500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess: (message, duration = 5000) => addToast(message, 'success', duration),
    showError: (message, duration = 7000) => addToast(message, 'error', duration),
    showWarning: (message, duration = 6000) => addToast(message, 'warning', duration),
    showInfo: (message, duration = 5000) => addToast(message, 'info', duration),
  };
};

export { ToastContainer };
export default Toast;

