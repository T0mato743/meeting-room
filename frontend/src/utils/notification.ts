import { notification as antdNotification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const notification = {
  show: (type: NotificationType, title: string, description?: string) => {
    antdNotification[type]({
      message: title,
      description,
      placement: 'topRight',
      duration: type === 'error' ? 4.5 : 3
    });
  },
  
  success: (title: string, description?: string) => {
    notification.show('success', title, description);
  },
  
  error: (title: string, description?: string) => {
    notification.show('error', title, description);
  },
  
  info: (title: string, description?: string) => {
    notification.show('info', title, description);
  },
  
  warning: (title: string, description?: string) => {
    notification.show('warning', title, description);
  }
};