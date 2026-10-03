import { useState, useEffect, useRef, useCallback } from 'react';
import { queueStore, AppState } from '../store/queueStore';
import { soundManager } from '../utils/audio';
import { notificationService } from '../utils/notifications';
import { QueueEntry } from '../types/queue';

export interface UseQueuePositionOptions {
  pollingIntervalMs?: number;
  avgServiceSpeedMins?: number;
  simulatedOffline?: boolean;
  enableAudioOnMove?: boolean;
}

export interface LiveQueuePositionResult {
  // Position & status
  position: number; // 0 = serving now, 1 = next in line, 2+ = waiting ahead
  aheadCount: number; // number of patrons directly ahead in queue
  isServing: boolean;
  isNext: boolean;
  isCompleted: boolean;
  userTicket: QueueEntry | null;
  servingTicket: QueueEntry | null;

  // Real-time dynamic wait calculations
  waitMinutesEstimated: number;
  calculatedMinutes: number;
  calculatedSeconds: number;
  calculatedEtaText: string;
  waitProgressPercent: number;
  expectedCallTimeString: string;
  bufferArrivalTime: string;
  arrivalGuidanceText: string;
  currentSessionElapsedSec: number;

  // Real-time connection & polling telemetry
  connectionStatus: 'connected' | 'polling' | 'offline';
  connectionModeText: string;
  latencyMs: number;
  lastSyncTime: Date;
  syncCount: number;
  isSyncing: boolean;

  // Position change tracking
  previousPosition: number | null;
  positionMovedUp: boolean;

  // Actions
  forceSync: () => void;
}

/**
 * Custom hook that maintains a real-time WebSocket-like connection with
 * resilient background polling to automatically update queue position and wait times
 * without requiring the user to refresh their browser.
 */
export function useQueuePosition(
  ticketNumber?: number,
  options: UseQueuePositionOptions = {}
): LiveQueuePositionResult {
  const {
    pollingIntervalMs = 2500,
    avgServiceSpeedMins = 3.5,
    simulatedOffline = false,
    enableAudioOnMove = true,
  } = options;

  const [state, setState] = useState<AppState>(() => queueStore.getState());
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date());
  const [syncCount, setSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [previousPosition, setPreviousPosition] = useState<number | null>(null);
  const [positionMovedUp, setPositionMovedUp] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const prevPosRef = useRef<number | null>(null);
  const pollingTimerRef = useRef<number | null>(null);

  // Determine current user ticket
  const userTicket =
    ticketNumber != null
      ? state.waitingQueue.find((t) => t.ticketNumber === ticketNumber) ||
        (state.servingTicket?.ticketNumber === ticketNumber ? state.servingTicket : null) ||
        state.userTicket
      : state.userTicket;

  const effectiveTicketNum = userTicket?.ticketNumber || ticketNumber || 44;

  // Sync execution handler
  const performSync = useCallback(() => {
    if (simulatedOffline || !isOnline) return;

    setIsSyncing(true);
    // Fetch latest authoritative state from store
    const latestState = queueStore.getState();
    setState({ ...latestState });
    setLastSyncTime(new Date());
    setSyncCount((prev) => prev + 1);

    // Turn off sync pulse after brief indicator
    setTimeout(() => {
      setIsSyncing(false);
    }, 400);
  }, [simulatedOffline, isOnline]);

  // 1. Subscribe to immediate state mutations (WebSocket-like reactive stream)
  useEffect(() => {
    if (simulatedOffline) return;

    const unsubscribe = queueStore.subscribe((newState) => {
      setState({ ...newState });
      setLastSyncTime(new Date());
      setSyncCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [simulatedOffline]);

  // 2. Active background polling mechanism (failsafe heartbeat)
  useEffect(() => {
    if (simulatedOffline || !isOnline) {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return;
    }

    pollingTimerRef.current = window.setInterval(() => {
      performSync();
    }, pollingIntervalMs);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [pollingIntervalMs, simulatedOffline, isOnline, performSync]);

  // 3. Tab Visibility listener (re-poll immediately when switching back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performSync]);

  // 4. Online/Offline Network Status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSync]);

  // 5. Position calculation
  const isServing =
    Boolean(state.servingTicket && state.servingTicket.ticketNumber === effectiveTicketNum);

  const waitingIndex = state.waitingQueue.findIndex(
    (t) => t.ticketNumber === effectiveTicketNum
  );

  const position = isServing ? 0 : waitingIndex !== -1 ? waitingIndex + 1 : 2;
  const aheadCount = Math.max(0, position - 1);
  const isNext = position === 1;
  const isCompleted = !isServing && waitingIndex === -1 && (userTicket?.status === 'completed');

  // 6. Detect position movement & alert customer
  useEffect(() => {
    if (prevPosRef.current !== null && prevPosRef.current !== position) {
      const movedUp = position < prevPosRef.current;
      setPreviousPosition(prevPosRef.current);
      setPositionMovedUp(movedUp);

      if (movedUp) {
        // Position improved!
        if (enableAudioOnMove) {
          if (position === 0) {
            soundManager.playYourTurnFanfare();
          } else {
            soundManager.playDeskChime();
          }
        }

        // Haptic feedback if supported by mobile device
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([120, 80, 120]);
          } catch {
            // Ignore
          }
        }

        // Trigger Service Worker / Notification alert
        if (position === 0) {
          notificationService.dispatchNotification(
            '🎉 Counter 3 Summon: It is Your Turn!',
            `Ticket #${effectiveTicketNum} is now being served at Reception Desk 1!`,
            'serving_now',
            effectiveTicketNum
          );
        } else if (position === 1) {
          notificationService.dispatchNotification(
            '⚡ You Are Next in Line!',
            `You are now #1 in queue. Please proceed towards Counter 3.`,
            'five_min_warning',
            effectiveTicketNum
          );
        }
      }

      // Reset movement flash after 4 seconds
      const timer = setTimeout(() => {
        setPositionMovedUp(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    prevPosRef.current = position;
  }, [position, enableAudioOnMove, effectiveTicketNum]);

  // 7. Dynamic Wait Time Calculations
  const currentSessionElapsedSec = state.activeChamberSessionSeconds;
  const speedSecondsPerCustomer = Math.round(avgServiceSpeedMins * 60);
  const currentCustomerRemainingSec = isServing
    ? 0
    : Math.max(15, speedSecondsPerCustomer - (currentSessionElapsedSec % speedSecondsPerCustomer));
  const waitingAheadSeconds = aheadCount * speedSecondsPerCustomer;
  const totalRemainingSec = isServing ? 0 : currentCustomerRemainingSec + waitingAheadSeconds;
  const calculatedMinutes = Math.floor(totalRemainingSec / 60);
  const calculatedSeconds = totalRemainingSec % 60;

  const totalInitialExpectedSec = Math.max(
    totalRemainingSec,
    (aheadCount + 1) * speedSecondsPerCustomer
  );
  const waitProgressPercent = isServing
    ? 100
    : position === 1
    ? Math.min(98, Math.max(88, Math.round(((totalInitialExpectedSec - totalRemainingSec) / totalInitialExpectedSec) * 100)))
    : Math.min(92, Math.max(12, Math.round(((totalInitialExpectedSec - totalRemainingSec) / totalInitialExpectedSec) * 100)));

  const calculatedEtaText = isServing
    ? '0 min (Calling now!)'
    : calculatedMinutes === 0
    ? `< 1 min (~${calculatedSeconds}s)`
    : calculatedSeconds > 0
    ? `~${calculatedMinutes} min ${calculatedSeconds}s`
    : `~${calculatedMinutes} min`;

  const expectedCallDate = new Date(Date.now() + totalRemainingSec * 1000);
  const expectedCallTimeString = expectedCallDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const bufferArrivalDate = new Date(Math.max(Date.now(), expectedCallDate.getTime() - 5 * 60 * 1000));
  const bufferArrivalTime = bufferArrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrivalGuidanceText = isServing
    ? 'Proceed to Counter 3 immediately — Dr. Elena Vance is waiting.'
    : totalRemainingSec <= 300
    ? 'Head toward Reception Counter 3 now (Under 5 minutes remaining).'
    : `Arrive at lobby by ${bufferArrivalTime} (5 mins prior to desk summon).`;

  const waitMinutesEstimated = Math.max(1, Math.round(totalRemainingSec / 60));

  // Connection metadata
  const connectionStatus = simulatedOffline || !isOnline
    ? 'offline'
    : isSyncing
    ? 'polling'
    : 'connected';

  const connectionModeText = simulatedOffline || !isOnline
    ? 'Offline (Cached Queue Mode)'
    : isSyncing
    ? 'Live Polling Syncing...'
    : 'WebSocket Live Stream Active';

  const latencyMs = state.networkLatencyMs || 28;

  return {
    position,
    aheadCount,
    isServing,
    isNext,
    isCompleted,
    userTicket,
    servingTicket: state.servingTicket,
    waitMinutesEstimated,
    calculatedMinutes,
    calculatedSeconds,
    calculatedEtaText,
    waitProgressPercent,
    expectedCallTimeString,
    bufferArrivalTime,
    arrivalGuidanceText,
    currentSessionElapsedSec,
    connectionStatus,
    connectionModeText,
    latencyMs,
    lastSyncTime,
    syncCount,
    isSyncing,
    previousPosition,
    positionMovedUp,
    forceSync: performSync,
  };
}
