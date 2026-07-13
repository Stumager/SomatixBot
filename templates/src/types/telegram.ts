export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  themeParams?: {
    bg_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme?: "light" | "dark";
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  isFullscreen?: boolean;
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  onEvent?: (eventType: "viewportChanged", eventHandler: () => void) => void;
  offEvent?: (eventType: "viewportChanged", eventHandler: () => void) => void;
  setHeaderColor?: (color: "bg_color" | "secondary_bg_color" | string) => void;
  setBackgroundColor?: (color: "bg_color" | "secondary_bg_color" | string) => void;
  showConfirm?: (message: string, callback: (ok: boolean) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
