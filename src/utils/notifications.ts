import { soundManager } from './audio';

export interface QueuelessNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'five_min_warning' | 'serving_now' | 'broadcast' | 'test';
  ticketNumber?: number;
  read: boolean;
  viaServiceWorker?: boolean;
}

class WebNotificationService {
  private notifiedFiveMinTickets: Set<number> = new Set();
  private notifiedServingTickets: Set<number> = new Set();
  private notificationHistory: QueuelessNotification[] = [];
  private listeners: Set<(history: QueuelessNotification[]) => void> = new Set();
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSwRegistering: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('queueless_notifications_history');
        if (stored) {
          this.notificationHistory = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      // Automatically register the Service Worker on startup if supported
      this.initServiceWorker();
    }
  }

  /**
   * Register the background Service Worker for persistent notification handling
   */
  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    if (this.swRegistration) {
      return this.swRegistration;
    }

    if (this.isSwRegistering) {
      try {
        const reg = await navigator.serviceWorker.ready;
        this.swRegistration = reg;
        return reg;
      } catch {
        return null;
      }
    }

    this.isSwRegistering = true;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Service worker updated
            }
          });
        }
      });

      return reg;
    } catch {
      // In sandboxed cross-origin iframes, service worker registration may be restricted
      return null;
    } finally {
      this.isSwRegistering = false;
    }
  }

  /**
   * Check if the browser supports the Web Notifications API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Check if Service Worker is supported in current browser environment
   */
  public isServiceWorkerSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  }

  /**
   * Check if Service Worker is currently active and ready
   */
  public isServiceWorkerActive(): boolean {
    return Boolean(this.swRegistration && this.swRegistration.active);
  }

  /**
   * Get active ServiceWorkerRegistration
   */
  public getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }

  /**
   * Current notification permission state
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request permission from the user to display notifications
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';

    try {
      // Modern browsers return a Promise from Notification.requestPermission()
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        soundManager.playAlertPing();
        // Also ensure service worker is active
        await this.initServiceWorker();
      }
      return permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Request Notification API permissions upon ticket creation
   * and ensure the background Service Worker is armed.
   */
  public async requestPermissionOnTicketCreation(ticketNumber?: number): Promise<{
    permission: NotificationPermission;
    swActive: boolean;
  }> {
    // 1. Initialize Service Worker in parallel
    const swPromise = this.initServiceWorker().catch(() => null);

    // 2. Request Notification permission
    const permission = await this.requestPermission();

    const swReg = await swPromise;
    const swActive = Boolean(swReg && swReg.active);

    // 3. If granted, deliver background confirmation alert
    if (permission === 'granted' && ticketNumber) {
      await this.dispatchNotification(
        `🎟️ Ticket #${ticketNumber} Active in Queue`,
        `Background alerts armed via Service Worker. You will be alerted even if this tab is minimized!`,
        'test',
        ticketNumber,
        `ticket-enrolled-${ticketNumber}`
      );
    }

    return {
      permission,
      swActive,
    };
  }

  /**
   * Dispatch a real browser Web Notification.
   * Leverages ServiceWorkerRegistration.showNotification first so alerts appear
   * reliably in the background even if the browser tab is minimized or out of focus.
   */
  public async dispatchNotification(
    title: string,
    body: string,
    type: 'five_min_warning' | 'serving_now' | 'broadcast' | 'test',
    ticketNumber?: number,
    tag?: string
  ): Promise<boolean> {
    let deliveredViaSw = false;

    // Haptic vibration if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch {
        // ignore
      }
    }

    // Play appropriate sound
    if (type === 'serving_now') {
      soundManager.playYourTurnFanfare();
    } else {
      soundManager.playDeskChime();
    }

    // 1. Try Service Worker showNotification first (native background support even when tab is minimized)
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        let reg = this.swRegistration;
        if (!reg && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          reg = await navigator.serviceWorker.ready;
          this.swRegistration = reg;
        }

        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: tag || `queue-${type}-${ticketNumber || 'alert'}`,
            data: { ticketNumber, type },
            requireInteraction: type === 'serving_now',
          });
          deliveredViaSw = true;
        }
      } catch {
        // Fallback to standard window Notification below
      }

      // 2. Fallback to standard window Notification if SW showNotification was unavailable
      if (!deliveredViaSw) {
        try {
          const notif = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: tag || `queue-${type}-${ticketNumber || 'alert'}`,
            badge: '/favicon.ico',
            requireInteraction: type === 'serving_now',
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };
          deliveredViaSw = false;
        } catch {
          // May fail in restricted environments
        }
      }
    }

    // Save to history
    const item: QueuelessNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      ticketNumber,
      read: false,
      viaServiceWorker: deliveredViaSw,
    };

    this.notificationHistory.unshift(item);
    if (this.notificationHistory.length > 30) {
      this.notificationHistory = this.notificationHistory.slice(0, 30);
    }
    this.persistHistory();
    this.notifyHistoryListeners();

    return deliveredViaSw || (this.isSupported() && Notification.permission === 'granted');
  }

  /**
   * Alert customer when they are ~5 minutes away from being served
   */
  public triggerFiveMinuteAlert(
    businessName: string,
    ticketNumber: number,
    position: number,
    estimatedWaitMins: number,
    force: boolean = false
  ): boolean {
    if (!force && this.notifiedFiveMinTickets.has(ticketNumber)) {
      return false;
    }

    this.notifiedFiveMinTickets.add(ticketNumber);

    const title = `🔔 5 Minutes Away: Ticket #${ticketNumber}`;
    const body = `You're ~${estimatedWaitMins} min away from being served at ${businessName}! You are #${position} in line. Please proceed toward Counter 3.`;

    // Fire dispatch asynchronously
    this.dispatchNotification(
      title,
      body,
      'five_min_warning',
      ticketNumber,
      `five-min-${ticketNumber}`
    );

    return true;
  }

  /**
   * Alert customer when their ticket is actively summoned to the desk
   */
  public triggerServingNowAlert(
    businessName: string,
    ticketNumber: number,
    station: string = 'Counter 3',
    force: boolean = false
  ): boolean {
    if (!force && this.notifiedServingTickets.has(ticketNumber)) {
      return false;
    }

    this.notifiedServingTickets.add(ticketNumber);

    const title = `🎉 IT'S YOUR TURN: Ticket #${ticketNumber}!`;
    const body = `Please head to ${station} now at ${businessName}. Dr. Elena Vance is ready to serve you.`;

    // Fire dispatch asynchronously
    this.dispatchNotification(
      title,
      body,
      'serving_now',
      ticketNumber,
      `serving-now-${ticketNumber}`
    );

    return true;
  }

  /**
   * Reset tracking sets (e.g. on simulation reset)
   */
  public resetTracking() {
    this.notifiedFiveMinTickets.clear();
    this.notifiedServingTickets.clear();
  }

  public getHistory(): QueuelessNotification[] {
    return [...this.notificationHistory];
  }

  public clearHistory() {
    this.notificationHistory = [];
    this.persistHistory();
    this.notifyHistoryListeners();
  }

  public subscribe(listener: (history: QueuelessNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.notificationHistory);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private persistHistory() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'queueless_notifications_history',
          JSON.stringify(this.notificationHistory)
        );
      } catch {
        // ignore
      }
    }
  }

  private notifyHistoryListeners() {
    for (const listener of this.listeners) {
      listener([...this.notificationHistory]);
    }
  }
}

export const notificationService = new WebNotificationService();
