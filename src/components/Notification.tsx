// src/components/Notification.tsx
import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  notification: {
    message: string;
    type: 'success' | 'error';
  } | null;
  onClear: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClear }) => {
  if (!notification) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 animate-fade-in-down ${
        notification.type === 'success'
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      }`}
    >
      {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium">{notification.message}</span>
      <button onClick={onClear} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
        <X size={18} />
      </button>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;