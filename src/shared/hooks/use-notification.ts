import { App } from 'antd';

export function useNotification() {
  const { notification } = App.useApp();
  return notification;
}

export function useAppMessage() {
  const { message } = App.useApp();
  return message;
}
