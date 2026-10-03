import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { queueStore, AppState } from '../store/queueStore';
import { notificationService, QueuelessNotification } from '../utils/notifications';
import { useQueuePosition } from '../hooks/useQueuePosition';
import {
  VENUE_COORDINATES,
  FIVE_MINUTE_RADIUS_METERS,
  calculateDistanceMeters,
  Coordinates,
} from '../utils/geolocation';

interface CustomerTicketViewProps {
  onJoinDifferentQueue: () => void;
  isOnline?: boolean;
  simulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
}

export const CustomerTicketView: React.FC<CustomerTicketViewProps> = ({
  onJoinDifferentQueue,
  isOnline = true,
  simulatedOffline = false,
  onToggleSimulateOffline,
}) => {
  const [state, setState] = useState<AppState>(queueStore.getState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showNotifHistory, setShowNotifHistory] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [notifHistory, setNotifHistory] = useState<QueuelessNotification[]>(
    notificationService.getHistory()
  );
  const [avgServiceSpeedMins, setAvgServiceSpeedMins] = useState<number>(3.5);

  // Geolocation & 5-minute arrival check-in states
  const [, setUserCoords] = useState<Coordinates | null>(null);
  const [rawDistanceMeters, setRawDistanceMeters] = useState<number | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [simulateNearVenue, setSimulateNearVenue] = useState<boolean>(true);
  const [manualCheckInDone, setManualCheckInDone] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isSwActive, setIsSwActive] = useState<boolean>(notificationService.isServiceWorkerActive());
  const [bgTestCountdown, setBgTestCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Attempt service worker readiness check
    notificationService.initServiceWorker().then((reg) => {
      if (reg) setIsSwActive(true);
    });

    const unsubscribeQueue = queueStore.subscribe((newState) => {
      setState({ ...newState });
    });
    const unsubscribeNotif = notificationService.subscribe((history) => {
      setNotifHistory(history);
      setNotificationPermission(notificationService.getPermission());
      setIsSwActive(notificationService.isServiceWorkerActive());
    });
    return () => {
      unsubscribeQueue();
      unsubscribeNotif();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRequestNotificationPermission = async () => {
    const userNum = userTicket?.ticketNumber || 44;
    const { permission, swActive } = await notificationService.requestPermissionOnTicketCreation(userNum);
    setNotificationPermission(permission);
    setIsSwActive(swActive);

    if (permission === 'granted') {
      triggerToast('Web Notifications API: Granted! Service Worker background alerts enabled.');
    } else {
      triggerToast('Notification permission was not granted by browser.');
    }
  };

  const handleTestFiveMinuteAlert = () => {
    const userNum = userTicket?.ticketNumber || 44;
    const sent = notificationService.triggerFiveMinuteAlert(
      'SmileCare Dental Clinic',
      userNum,
      position,
      waitMins || 4,
      true
    );
    if (sent) {
      triggerToast(`🔔 5-Minute Web Notification dispatched for Ticket #${userNum}!`);
    } else {
      triggerToast(`🔔 5-Minute Alert dispatched! (Permission: ${notificationPermission})`);
    }
  };

  const handleTestMinimizedAlert = () => {
    if (notificationPermission !== 'granted') {
      handleRequestNotificationPermission();
      return;
    }

    setBgTestCountdown(4);
    triggerToast('⏱️ Background test armed! Minimize or switch away from this tab now (triggers in 4s)...');

    let remaining = 4;
    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setBgTestCountdown(remaining);
      } else {
        clearInterval(timer);
        setBgTestCountdown(null);
        notificationService.dispatchNotification(
          '🔔 Background Alert: Counter 3 Summon',
          `Delivered via Service Worker while tab was minimized! Ticket #${userTicket?.ticketNumber || 44} is summoned.`,
          'test',
          userTicket?.ticketNumber || 44
        );
      }
    }, 1000);
  };

  // Real-time Queue Position hook with WebSocket-like stream and resilient background polling
  const liveQueue = useQueuePosition(state.userTicket?.ticketNumber || 44, {
    pollingIntervalMs: 2000,
    avgServiceSpeedMins,
    simulatedOffline,
    enableAudioOnMove: true,
  });

  const userTicket = liveQueue.userTicket;
  const isServing = liveQueue.isServing;
  const position = liveQueue.position;
  const ahead = liveQueue.aheadCount;
  const calculatedMinutes = liveQueue.calculatedMinutes;
  const calculatedSeconds = liveQueue.calculatedSeconds;
  const waitProgressPercent = liveQueue.waitProgressPercent;
  const calculatedEtaText = liveQueue.calculatedEtaText;
  const expectedCallTimeString = liveQueue.expectedCallTimeString;
  const etaClockTime = liveQueue.expectedCallTimeString;
  const bufferArrivalTime = liveQueue.bufferArrivalTime;
  const arrivalGuidanceText = liveQueue.arrivalGuidanceText;
  const currentSessionElapsedSec = liveQueue.currentSessionElapsedSec;
  const waitMins = liveQueue.waitMinutesEstimated;

  // Geolocation polling / lookup
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserCoords(coords);
          const dist = calculateDistanceMeters(coords, VENUE_COORDINATES);
          setRawDistanceMeters(dist);
        },
        () => {
          // If permission is denied or pending, simulation toggle remains fully available
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    }
  }, []);

  const effectiveDistanceMeters = simulateNearVenue ? 320 : (rawDistanceMeters ?? 1800);
  const isWithinFiveMinRadius = effectiveDistanceMeters <= FIVE_MINUTE_RADIUS_METERS;
  const isCheckedIn = manualCheckInDone || Boolean(userTicket?.checkedIn);

  const handleCheckIn = () => {
    setIsGeoLoading(true);

    const completeCheckIn = (distUsed: number) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      queueStore.checkInCustomer(userTicket?.ticketNumber || 44);
      setManualCheckInDone(true);
      setCheckInTime(now);
      setIsGeoLoading(false);
      triggerToast(`📍 Arrival Confirmed via Geolocation! Checked in at ${now} (${distUsed}m from desk).`);
      try {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserCoords(coords);
          const dist = calculateDistanceMeters(coords, VENUE_COORDINATES);
          setRawDistanceMeters(dist);
          completeCheckIn(dist);
        },
        () => {
          // If browser blocked prompt, confirm arrival with current simulated radius
          completeCheckIn(effectiveDistanceMeters);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      completeCheckIn(effectiveDistanceMeters);
    }
  };

  const handleDelay = () => {
    const mins = queueStore.delayCustomerTicket();
    triggerToast(`Ticket deferred by +${mins} minutes. Your position has been safely adjusted.`);
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to surrender your active queue position?')) {
      queueStore.leaveQueue();
      triggerToast('You have left the queue.');
    }
  };

  const handleAcknowledge = () => {
    triggerToast('Specialist Dr. Elena Vance notified of your arrival!');
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#151b2a] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-cyan-300 text-[20px]">info</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Offline Network Status Banner */}
      {!isOnline && (
        <div
          role="alert"
          aria-live="assertive"
          className="w-full bg-[#fff8e1] border-2 border-[#f59e0b] text-[#78350f] rounded-2xl p-4 sm:p-5 shadow-lg flex items-start gap-3.5 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[24px] animate-pulse">cloud_off</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#78350f]">You are currently offline</h3>
                <span className="text-[10px] font-mono uppercase tracking-wide bg-[#fde68a] text-[#92400e] px-2.5 py-0.5 rounded-full font-bold border border-[#f59e0b]/40">
                  Real-time updates paused
                </span>
              </div>
              {onToggleSimulateOffline && (
                <button
                  type="button"
                  onClick={onToggleSimulateOffline}
                  className="text-[11px] font-mono font-bold text-[#b45309] hover:text-[#78350f] underline flex items-center gap-1 transition-colors"
                  title="Toggle offline state simulation"
                >
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                  <span>{simulatedOffline ? 'Resume (Exit Simulation)' : 'Simulate Online'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#92400e] mt-1.5 leading-relaxed font-medium">
              Network connection lost. Real-time queue updates and desk summon notifications are temporarily paused. Your active ticket position (<strong className="font-bold text-[#78350f]">#{userTicket?.ticketNumber || 44}</strong>) is preserved locally and live telemetry will automatically resume when your connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* Broadcast SMS Alert simulation banner if available */}
      {state.lastBroadcastMessage && (
        <div className="bg-[#316bf3] text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-white/20 animate-in zoom-in-95">
          <span className="material-symbols-outlined text-white text-[24px] mt-0.5">sms</span>
          <div className="flex-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-200 block">
              Incoming Clinic SMS Update
            </span>
            <p className="text-sm font-semibold mt-0.5">&ldquo;{state.lastBroadcastMessage}&rdquo;</p>
          </div>
          <button onClick={() => queueStore.clearBroadcast()} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Real-time Position Moved Up Notification Banner */}
      {liveQueue.positionMovedUp && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-emerald-400/50 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-bounce">
              <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200 block">
                Queue Forward Movement Detected
              </span>
              <p className="text-sm font-bold mt-0.5">
                {position === 0
                  ? '🎉 Counter 3 is calling your ticket now!'
                  : `You moved forward in line! You are now #${position} (${ahead === 0 ? 'Next patient up!' : `${ahead} ahead`}).`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white/20 px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
            Auto-Updated
          </span>
        </div>
      )}

      {/* Main Ticket Card Container */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 border border-[#dbe1ff]">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#dbe1ff] opacity-40 blur-3xl pointer-events-none"></div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] shadow-sm border border-[#dbe1ff]">
              <span className="material-symbols-outlined text-[26px]">medical_services</span>
            </div>
            <div>
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-[#0b1c30]">SmileCare Dental</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {!isOnline ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] px-2.5 py-0.5 rounded-full border border-[#f59e0b]/50">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
                    <span className="text-[11px] font-mono text-[#92400e] font-bold uppercase tracking-wide">
                      Updates Paused (Offline)
                    </span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#0051d5]/25 animate-badge-glow">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveQueue.isSyncing ? 'bg-emerald-400' : 'bg-[#0051d5]'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${liveQueue.isSyncing ? 'bg-emerald-500' : 'bg-[#0051d5]'}`}></span>
                      </span>
                      <span className="text-[11px] font-mono text-[#0051d5] font-bold uppercase tracking-wide">
                        {liveQueue.isSyncing ? 'Polling Syncing...' : 'WebSocket Stream Active'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => liveQueue.forceSync()}
                      title="Force instant queue poll"
                      className="p-1 text-[#0051d5] hover:bg-[#dbe1ff] rounded-lg transition-all active:scale-90 flex items-center"
                    >
                      <span className={`material-symbols-outlined text-[15px] ${liveQueue.isSyncing ? 'animate-spin' : ''}`}>
                        sync
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-[#76777d] uppercase">Queue Lane</span>
            <span className="text-xs font-bold text-[#0b1c30] block">General Dental</span>
          </div>
        </div>

        {/* Dynamic State: Waiting or Ready */}
        {!isServing ? (
          <div className="flex flex-col gap-6">
            {/* Background Notification & Service Worker Status Card */}
            <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dbe1ff] flex flex-col gap-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                    {notificationPermission === 'granted' ? 'notifications_active' : 'notifications'}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#0b1c30] block">
                      Background Turn Alerts (Notification API &amp; Service Worker)
                    </span>
                    <span className="text-[10px] font-mono text-[#0051d5] font-semibold">
                      Service Worker: {isSwActive ? 'Active & Registered' : 'Standby'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notificationPermission === 'granted' ? (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active &amp; Armed
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestNotificationPermission}
                      className="px-2.5 py-1 bg-[#0051d5] hover:bg-[#316bf3] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_alert</span>
                      <span>Enable Background Alerts</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#45474c] leading-relaxed">
                Using the browser&apos;s native <strong>Notification API</strong> and registered <strong>Service Worker</strong>, QueueLess delivers summons and 5-minute warnings even if this tab is minimized, in the background, or your phone screen is idle.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#dbe1ff]/60">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestFiveMinuteAlert}
                    className="text-xs text-[#0051d5] font-bold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">notification_important</span>
                    <span>Test 5-Min Alert</span>
                  </button>

                  <span className="text-[#c0c6da]">•</span>

                  <button
                    onClick={handleTestMinimizedAlert}
                    disabled={bgTestCountdown !== null}
                    className="text-xs text-[#0051d5] font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px]">timer</span>
                    <span>
                      {bgTestCountdown !== null
                        ? `Minimize tab now! Firing in ${bgTestCountdown}s...`
                        : 'Test Minimized Alert (4s countdown)'}
                    </span>
                  </button>
                </div>

                {notifHistory.length > 0 && (
                  <button
                    onClick={() => setShowNotifHistory(!showNotifHistory)}
                    className="text-[11px] text-[#45474c] hover:text-[#0b1c30] underline"
                  >
                    {showNotifHistory ? 'Hide Alert Log' : `View Log (${notifHistory.length})`}
                  </button>
                )}
              </div>

              {showNotifHistory && (
                <div className="mt-2 pt-2 border-t border-[#dbe1ff] flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {notifHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-2.5 rounded-xl border border-[#dbe1ff] text-[11px] flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-[#0b1c30]">
                        <span>{item.title}</span>
                        <span className="font-mono font-normal text-[#76777d]">{item.timestamp}</span>
                      </div>
                      <p className="text-[#45474c]">{item.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pulsing Banner */}
            <div className="bg-[#eff4ff] p-4 rounded-2xl flex items-center gap-3 border border-[#dbe1ff]">
              <span className="material-symbols-outlined text-[#0051d5] text-[24px] animate-bounce">
                notifications_active
              </span>
              <div>
                <p className="text-xs sm:text-sm text-[#0b1c30] font-bold">
                  {position === 1
                    ? "You are next in line! Head to Counter 3 now."
                    : `You're #${position} in line! Please arrive within ~${waitMins + 2} mins.`}
                </p>
                <p className="text-xs text-[#45474c]">SMS haptic buzz will trigger when desk calls you.</p>
              </div>
            </div>

            {/* Token Badge */}
            <div className="text-center py-6 bg-[#eff4ff] rounded-2xl border border-[#dbe1ff] relative overflow-hidden">
              {/* Subtle ambient pulse background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0051d5]/10 via-transparent to-transparent pointer-events-none animate-pulse"></div>

              <div className="flex items-center justify-center gap-1.5 mb-1 relative z-10">
                {!isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#92400e] font-bold">
                      Updates Paused (Offline Mode)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0051d5] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0051d5]"></span>
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#0051d5] font-bold">
                      Your Live Position (Real-time Sync)
                    </span>
                  </>
                )}
              </div>

              <div className="relative z-10 my-2">
                <span className="font-queue-token text-6xl sm:text-7xl font-extrabold text-[#0051d5] tracking-tight animate-sync-pulse select-none">
                  #{position}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-[#dbe1ff] relative z-10 animate-badge-glow">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-[#0b1c30]">
                  {ahead === 0 ? 'Next patient to be summoned!' : `${ahead} person ahead of you`}
                </span>
                <span className="text-[10px] font-mono text-[#0051d5] font-semibold bg-[#eff4ff] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${liveQueue.isSyncing ? 'bg-emerald-500 animate-ping' : 'bg-[#0051d5]'}`}></span>
                  <span>{liveQueue.latencyMs}ms • Auto-Sync</span>
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#dbe1ff]/60 flex items-center justify-around text-xs font-mono text-[#45474c] relative z-10">
                <div>
                  <span className="block text-[10px] text-[#76777d] uppercase font-bold">Ticket Number</span>
                  <span className="font-bold text-sm text-[#0b1c30] inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-ping"></span>
                    #{userTicket?.ticketNumber || 44}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#76777d] uppercase font-bold">Client Ref</span>
                  <span className="font-bold text-sm text-[#0051d5]">#CUST-9481</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#76777d] uppercase font-bold">Est. Wait</span>
                  <span className="font-bold text-sm text-[#0051d5]">~{waitMins} min</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#76777d] uppercase font-bold">Arrival ETA</span>
                  <span className="font-bold text-sm text-[#0b1c30]">{etaClockTime}</span>
                </div>
              </div>
            </div>

            {/* Estimated Arrival Time (ETA) Spotlight Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dbe1ff] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#316bf3]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#0051d5] text-white flex items-center justify-center shadow-md shadow-[#0051d5]/25 flex-shrink-0">
                  <span className="material-symbols-outlined text-[26px]">departure_board</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#76777d] font-bold">
                      Estimated Arrival Time (ETA)
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-headline-lg text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight">
                      {etaClockTime}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#dbe1ff]">
                      {isServing ? 'Now' : `in ~${calculatedMinutes}m ${calculatedSeconds}s`}
                    </span>
                  </div>
                  <p className="text-xs text-[#45474c] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#0051d5]">location_on</span>
                    <span>{arrivalGuidanceText}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f0f4ff] relative z-10">
                <span className="text-[11px] font-bold text-[#0051d5] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#dbe1ff] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>On-Time Projection</span>
                </span>
                <span className="text-[11px] text-[#76777d] font-mono mt-1">
                  Lobby Arrival: <strong>{bufferArrivalTime}</strong>
                </span>
              </div>
            </div>

            {/* Dynamic Estimated Wait Time Progress Bar based on average service speed */}
            <div className="bg-[#eff4ff] p-4 sm:p-5 rounded-2xl border border-[#dbe1ff] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#0051d5] shadow-xs">
                    <span className="material-symbols-outlined text-[19px]">schedule</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0b1c30]">Estimated Wait Time</h4>
                    <span className="text-[11px] text-[#45474c] block">
                      Calculated at <strong className="text-[#0051d5]">{avgServiceSpeedMins} min / customer</strong> pace
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-1 sm:mt-0">
                  <span className="font-headline-sm text-base sm:text-lg font-black text-[#0051d5] tracking-tight block">
                    {calculatedEtaText}
                  </span>
                  <span className="text-[10px] font-mono text-[#76777d] uppercase font-semibold">
                    Expected Call: {expectedCallTimeString}
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="relative pt-1 pb-0.5">
                <div className="w-full h-3.5 rounded-full bg-[#dbe1ff] overflow-hidden p-0.5 border border-[#c0c6da]/50 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0051d5] via-[#316bf3] to-[#2fd9f4] transition-all duration-700 relative shadow-sm"
                    style={{ width: `${waitProgressPercent}%` }}
                  >
                    {/* Glowing pulse indicator at leading edge */}
                    <span className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/80 rounded-full animate-pulse"></span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-[#45474c] pt-1.5">
                  <span className="flex items-center gap-1.5 font-semibold text-[#0b1c30]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-ping"></span>
                    <span>{waitProgressPercent}% Wait Completed</span>
                  </span>
                  <span className="font-semibold text-[#0051d5]">
                    {ahead} {ahead === 1 ? 'person' : 'people'} ahead of you
                  </span>
                </div>
              </div>

              {/* Service Speed Controls & Telemetry */}
              <div className="mt-1 pt-2.5 border-t border-[#dbe1ff] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#0051d5]">speed</span>
                  <span className="text-[11px] text-[#45474c] font-medium">Avg Speed Preset:</span>
                  <div className="flex items-center gap-1">
                    {[2.5, 3.5, 5.0].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setAvgServiceSpeedMins(speed);
                          triggerToast(`Recalculated queue ETA at ${speed} min/customer speed.`);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          avgServiceSpeedMins === speed
                            ? 'bg-[#0051d5] text-white shadow-xs'
                            : 'bg-white text-[#45474c] border border-[#dbe1ff] hover:bg-[#dbe1ff]'
                        }`}
                      >
                        {speed}m
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#0051d5] bg-white px-2 py-0.5 rounded border border-[#dbe1ff]">
                  Active Session: {Math.floor(currentSessionElapsedSec / 60)}m {currentSessionElapsedSec % 60}s
                </span>
              </div>
            </div>

            {/* Geolocation Venue Proximity & Arrival Check-in Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isCheckedIn
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : isWithinFiveMinRadius
                  ? 'bg-gradient-to-br from-emerald-50 via-[#eff4ff] to-[#e0edff] border-emerald-400 shadow-md'
                  : 'bg-[#f8f9ff] border-[#dbe1ff] text-[#45474c]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isCheckedIn
                        ? 'bg-emerald-600'
                        : isWithinFiveMinRadius
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-[#76777d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isCheckedIn ? 'verified' : isWithinFiveMinRadius ? 'fmd_good' : 'location_searching'}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#0b1c30]">
                        {isCheckedIn
                          ? 'Arrival Confirmed via Geolocation'
                          : isWithinFiveMinRadius
                          ? 'Within 5-Minute Venue Radius'
                          : 'Outside 5-Minute Venue Radius'}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                          isCheckedIn
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isWithinFiveMinRadius
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {isCheckedIn ? (
                          'Checked In'
                        ) : isWithinFiveMinRadius ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            ~{effectiveDistanceMeters}m away
                          </>
                        ) : (
                          `~${Math.round((effectiveDistanceMeters / 1000) * 10) / 10} km`
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#45474c] mt-0.5">
                      {isCheckedIn
                        ? `Checked in at ${checkInTime || '09:14 AM'}. Counter 3 receptionist notified of your arrival.`
                        : isWithinFiveMinRadius
                        ? 'You are within walking proximity of 402 St. Vincent Blvd. Confirm your arrival with the Geolocation API.'
                        : 'The Check-in button will appear automatically when you are within a 5-minute radius (~500m) of SmileCare Dental.'}
                    </p>
                  </div>
                </div>

                {/* Geolocation Simulation Toggle for testing */}
                <button
                  type="button"
                  onClick={() => {
                    setSimulateNearVenue(!simulateNearVenue);
                    triggerToast(
                      !simulateNearVenue
                        ? 'Simulated GPS: Within 5-min radius (~320m).'
                        : 'Simulated GPS: Outside 5-min radius (~1.8km).'
                    );
                  }}
                  className="text-[10px] font-mono text-[#0051d5] hover:underline shrink-0 bg-white px-2 py-1 rounded-lg border border-[#dbe1ff]"
                  title="Toggle radius simulation for testing"
                >
                  {simulateNearVenue ? 'Simulate Outside' : 'Simulate 5-min Radius'}
                </button>
              </div>

              {/* Action Button inside card when within 5-min radius */}
              {isWithinFiveMinRadius && !isCheckedIn && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-900 font-medium">
                    ⚡ Front desk will prepare your consultation room immediately upon check-in.
                  </span>
                  <button
                    onClick={handleCheckIn}
                    disabled={isGeoLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isGeoLoading ? 'sync' : 'how_to_reg'}
                    </span>
                    <span>{isGeoLoading ? 'Verifying GPS...' : 'Check-in'}</span>
                  </button>
                </div>
              )}

              {isCheckedIn && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    <span>Desk Notified • Counter 3 Reception Prepared</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">GPS Verified</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              {isWithinFiveMinRadius && !isCheckedIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={isGeoLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isGeoLoading ? 'sync' : 'where_to_vote'}
                  </span>
                  <span>{isGeoLoading ? 'Confirming Arrival with Geolocation API...' : 'Check-in (Confirm Arrival at Venue)'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDelay}
                  className="py-3 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-[#dbe1ff]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#0051d5]">more_time</span>
                  <span>Delay 5 mins</span>
                </button>
                <button
                  onClick={() => setShowDirections(!showDirections)}
                  className="py-3 px-4 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  <span>Desk Directions</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TURN ACTIVE CELEBRATION */
          <div className="flex flex-col gap-6 text-center animate-in zoom-in-95">
            <div className="bg-[#0051d5] text-white p-5 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#0051d5] shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <div className="text-left">
                <span className="text-[11px] uppercase tracking-wider text-cyan-200 font-extrabold block">
                  Live Dispatch Alert
                </span>
                <p className="font-headline-sm text-xl font-extrabold text-white">IT'S YOUR TURN NOW!</p>
              </div>
            </div>

            <div className="bg-[#eff4ff] p-6 rounded-2xl flex flex-col gap-3 border border-[#dbe1ff]">
              <span className="font-mono text-xs uppercase tracking-widest text-[#76777d] font-bold">
                Assigned Station
              </span>
              <div className="font-display-hero text-5xl text-[#0051d5] font-black leading-none animate-sync-pulse">
                COUNTER 3
              </div>
              <p className="text-base font-bold text-[#0b1c30]">Dr. Elena Vance • Consultation Room 2B</p>
              <p className="text-xs text-[#45474c]">
                Please present this screen or mention Token #{userTicket?.ticketNumber || 44} to the desk receptionist.
              </p>
              <button
                onClick={handleAcknowledge}
                className="w-full py-3 bg-[#0051d5] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#316bf3] transition-all"
              >
                I Am Walking Up Now
              </button>
            </div>
          </div>
        )}

        {/* Turn-by-Turn Directions Drawer */}
        {showDirections && (
          <div className="bg-[#eff4ff] p-4 rounded-2xl flex flex-col gap-2 border border-[#dbe1ff] animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0051d5] uppercase">Turn-by-turn Desk Guidance</span>
              <button onClick={() => setShowDirections(false)} className="text-xs text-[#76777d] hover:text-[#0b1c30]">
                Dismiss
              </button>
            </div>
            <ul className="text-xs text-[#45474c] space-y-1.5 pl-2 list-disc list-inside">
              <li>Enter Medical Center via Main Atrium on St. Vincent Blvd.</li>
              <li>Take Elevator B up to Floor 2 (Wing West).</li>
              <li>Follow blue overhead signage directly to <strong>SmileCare Reception Counter #3</strong>.</li>
            </ul>
          </div>
        )}

        {/* Venue Information Shelf */}
        <div className="bg-[#f8f9ff] p-4 rounded-2xl flex items-center justify-between border border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0051d5] text-[24px]">location_on</span>
            <div className="text-xs">
              <p className="font-bold text-[#0b1c30]">Floor 2, Wing West • Counter #3</p>
              <p className="text-[#45474c]">Free Wi-Fi: &ldquo;SmileGuest&rdquo; (No password needed)</p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="text-xs text-[#ba1a1a] hover:underline font-semibold"
          >
            Leave Queue
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 px-1">
        <button
          onClick={onJoinDifferentQueue}
          className="text-xs text-[#0051d5] font-semibold hover:underline"
        >
          &larr; Browse Other Clinics &amp; Service Venues
        </button>

        {onToggleSimulateOffline && (
          <button
            type="button"
            onClick={onToggleSimulateOffline}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              !isOnline
                ? 'bg-[#fef3c7] border-[#f59e0b] text-[#92400e] hover:bg-[#fde68a]'
                : 'bg-white border-[#dbe1ff] text-[#45474c] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {!isOnline ? 'wifi' : 'wifi_off'}
            </span>
            <span>{!isOnline ? 'Resume (Simulate Online)' : 'Simulate Network Drop / Offline'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
