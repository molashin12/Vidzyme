import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'loading';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  loading: Loader2,
};

const colorMap = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    text: 'text-green-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-400',
    text: 'text-yellow-300',
  },
  loading: {
    bg: 'bg-[#27AE60]/10',
    border: 'border-[#27AE60]/20',
    icon: 'text-[#27AE60]',
    text: 'text-[#27AE60]',
  },
};

export default function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = iconMap[type];
  const colors = colorMap[type];

  useEffect(() => {
    if (autoClose && type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, type, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div
        className={`
          ${colors.bg} ${colors.border} border rounded-xl p-4
          backdrop-blur-sm shadow-lg
        `}
      >
        <div className="flex items-start space-x-3">
          <Icon
            className={`
              w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5
              ${type === 'loading' ? 'animate-spin' : ''}
            `}
          />
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${colors.text}`}>{title}</h4>
            {message && (
              <p className="text-gray-300 text-sm mt-1">{message}</p>
            )}
          </div>
          {type !== 'loading' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Manager Hook
export function useNotification() {
  const [notifications, setNotifications] = useState<
    Array<NotificationProps & { id: string }>
  >([]);

  const addNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      onClose: () => removeNotification(id),
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    return addNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    return addNotification({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message });
  };

  const showLoading = (title: string, message?: string) => {
    return addNotification({ 
      type: 'loading', 
      title, 
      message, 
      autoClose: false 
    });
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    removeNotification,
    NotificationContainer,
  };
}