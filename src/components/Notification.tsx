// 成功・エラーなどの通知メッセージ表示用ダミーコンポーネント
// なぜ分離するか: UIの責務分離と再利用性のため
import React from 'react';

// NotificationType型をimportし、型安全性を担保
import { NotificationType } from '../types/ui';

// なぜisVisibleをpropsに持たせるか→親コンポーネントで表示制御できるようにするため
export interface NotificationProps {
  message: string | null;
  type: NotificationType | null;
  isVisible: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, isVisible }) => {
  // isVisibleかつmessageがある場合のみ表示（なぜ→不要なDOM描画を防ぐため）
  if (!isVisible || !message) return null;
  // typeによって色・アイコン等を変える（なぜ→ユーザーに成功/エラーを直感的に伝えるため）
  const colorClass = type === 'error'
    ? 'bg-red-500 text-white p-3 rounded-md border border-red-700 shadow-lg'
    : 'bg-green-500 text-white p-3 rounded-md border border-green-700 shadow-lg';
  // fixedで画面下部中央に表示（なぜ→ユーザーの視線に入りやすく、重複表示も防げるため）
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${colorClass} min-w-[200px] max-w-[90vw] text-center`}>
      {message}
    </div>
  );
};
