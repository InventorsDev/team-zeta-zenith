import { type ReactNode } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  icon?: ReactNode;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { bgClass: string; borderClass: string; textClass: string; iconClass: string; Icon: typeof CheckCircleIcon }
> = {
  success: {
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    borderClass: 'border-green-200 dark:border-green-800',
    textClass: 'text-green-800 dark:text-green-200',
    iconClass: 'text-green-600 dark:text-green-400',
    Icon: CheckCircleIcon,
  },
  error: {
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-800 dark:text-red-200',
    iconClass: 'text-red-600 dark:text-red-400',
    Icon: XCircleIcon,
  },
  warning: {
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    Icon: ExclamationTriangleIcon,
  },
  info: {
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-800 dark:text-blue-200',
    iconClass: 'text-blue-600 dark:text-blue-400',
    Icon: InformationCircleIcon,
  },
};

export function Alert({ variant, title, message, onClose, icon, className = '' }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = icon || <config.Icon className="h-5 w-5" aria-hidden="true" />;

  return (
    <div
      className={`
        border rounded-lg p-4
        ${config.bgClass}
        ${config.borderClass}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={config.iconClass}>{Icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold mb-1 ${config.textClass}`}>{title}</h4>
          )}
          <p className={`text-sm ${config.textClass}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.iconClass} hover:opacity-75 transition-opacity`}
            aria-label="Close alert"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
