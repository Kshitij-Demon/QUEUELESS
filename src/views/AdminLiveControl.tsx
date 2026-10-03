import React, { useState, useEffect } from 'react';
import { queueStore, AppState } from '../store/queueStore';
import { soundManager } from '../utils/audio';
import { AdminQrModal } from '../components/AdminQrModal';
import { AnalyticsOverview } from '../components/AnalyticsOverview';
import { downloadAnalyticsCSV } from '../utils/exportAnalyticsCsv';

interface AdminLiveControlProps {
  onNavigateHome: () => void;
  onNavigateDirectory: () => void;
  onLogout?: () => void;
}

export const AdminLiveControl: React.FC<AdminLiveControlProps> = ({
  onNavigateHome,
  onNavigateDirectory,
  onLogout,
}) => {
  const [activeView, setActiveView] = useState<'dispatch' | 'analytics'>('dispatch');
  const [state, setState] = useState<AppState>(queueStore.getState());
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInCategory, setWalkInCategory] = useState('General Oral Checkup (15m)');
  const [broadcastText, setBroadcastText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = queueStore.subscribe((newState) => {
      setState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Global keyboard shortcut for space / enter to call next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === 'Space' || e.code === 'Enter') &&
        e.target instanceof HTMLElement &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        e.target.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        handleCallNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCallNext = () => {
    const result = queueStore.advanceQueue();
    if (result.calledTicket) {
      triggerToast(`Now calling Ticket #${result.calledTicket.ticketNumber} (${result.calledTicket.customerName}) to Counter 01!`);
    } else {
      triggerToast('Queue is currently clear. No more patients waiting.');
    }
  };

  const handleRecallChime = () => {
    soundManager.playDeskChime();
    triggerToast(`Chime broadcast sent to reception speaker for #${state.servingTicket?.ticketNumber || 42}!`);
  };

  const handleMarkCompleted = () => {
    queueStore.markCompleted();
    triggerToast(`Session for Ticket #${state.servingTicket?.ticketNumber} marked as completed.`);
  };

  const handleSkipNoShow = () => {
    queueStore.markNoShow();
    triggerToast(`Ticket marked as No-Show and recorded in daily audit.`);
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = queueStore.addWalkIn(walkInName, walkInPhone, walkInCategory);
    triggerToast(`Generated Ticket #${newTicket.ticketNumber} for ${newTicket.customerName}!`);
    setWalkInName('');
    setWalkInPhone('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    queueStore.broadcastSms(broadcastText);
    triggerToast(`SMS Broadcast pushed to ${state.waitingQueue.length} devices!`);
    setBroadcastText('');
  };

  const handlePrintPdf = () => {
    triggerToast('Generating high-resolution acrylic counter stand printable PDF...');
    window.print();
  };

  const elapsedMins = Math.floor(state.activeChamberSessionSeconds / 60);
  const elapsedSecs = state.activeChamberSessionSeconds % 60;
  const formattedTimer = `${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`;

  const nextTicketToCall = state.waitingQueue[0]?.ticketNumber || 48;

  return (
    <div className="flex w-full min-h-screen bg-[#f8f9ff]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#151b2a] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-cyan-300 text-[20px]">info</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#eff4ff] z-50 flex-col pt-6 pb-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#dbe1ff]">
        <div className="px-6 mb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0051d5] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
          <span className="font-headline-sm text-lg font-bold text-[#0b1c30]">
            Queue<span className="text-[#0051d5]">Control</span>
          </span>
        </div>

        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 bg-[#e5eeff] px-3 py-1.5 rounded-full border border-[#dbe1ff]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
            <span className="text-[11px] text-[#0051d5] font-bold uppercase tracking-wider">
              Counter 01 Active
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <button
            onClick={() => setActiveView('dispatch')}
            className={`flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all ${
              activeView === 'dispatch'
                ? 'bg-[#e5eeff] text-[#0b1c30] font-bold shadow-sm'
                : 'text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px] text-[#0051d5]">view_kanban</span>
            <span>Desk Dispatch</span>
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all ${
              activeView === 'analytics'
                ? 'bg-[#e5eeff] text-[#0b1c30] font-bold shadow-sm'
                : 'text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px] text-[#0051d5]">insights</span>
            <span>Analytics Overview</span>
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const ok = downloadAnalyticsCSV(`smilecare-queue-analytics-${today}.csv`);
              if (ok) {
                triggerToast('📊 Analytics CSV exported & downloaded successfully!');
              }
            }}
            className="flex items-center px-4 py-2.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-xl text-xs sm:text-sm text-left transition-all"
            title="Download Daily Queue Volume & Wait Time Analytics (CSV)"
          >
            <span className="material-symbols-outlined mr-3 text-[20px] text-emerald-600">download</span>
            <span>Export Data (CSV)</span>
          </button>
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center px-4 py-2.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-xl text-xs sm:text-sm text-left transition-all"
          >
            <span className="material-symbols-outlined mr-3 text-[20px] text-[#0051d5]">qr_code_2</span>
            <span>Generate QR Stand</span>
          </button>
          <button
            onClick={onNavigateDirectory}
            className="flex items-center px-4 py-2.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-xl text-xs sm:text-sm text-left transition-all"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">hub</span>
            <span>Lanes &amp; Services</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="flex items-center px-4 py-2.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-xl text-xs sm:text-sm text-left transition-all"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">open_in_new</span>
            <span>Public View</span>
          </button>
        </nav>

        <div className="px-4 pt-4 border-t border-[#dbe1ff]">
          <button
            onClick={onLogout || onNavigateHome}
            className="flex items-center w-full px-4 py-2 rounded-xl text-xs text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-all font-semibold"
          >
            <span className="material-symbols-outlined mr-3 text-[18px]">logout</span>
            <span>End Desk Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col w-full min-h-screen">
        {/* Desk Dispatch Sub-bar */}
        <div className="h-14 bg-white/85 backdrop-blur-xl border-b border-[#e2e8f0] flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-[#eff4ff] p-1 rounded-xl border border-[#dbe1ff]">
              <button
                onClick={() => setActiveView('dispatch')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'dispatch'
                    ? 'bg-[#0051d5] text-white shadow-xs'
                    : 'text-[#45474c] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                <span>Dispatch</span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'analytics'
                    ? 'bg-[#0051d5] text-white shadow-xs'
                    : 'text-[#45474c] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span>Analytics</span>
              </button>
            </div>
            <span className="hidden md:inline font-mono text-xs text-[#76777d]">
              STATION: CENTRAL-LOBBY // LANE-A
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                const ok = downloadAnalyticsCSV(`smilecare-queue-analytics-${today}.csv`);
                if (ok) {
                  triggerToast('📊 Analytics CSV exported & downloaded successfully!');
                }
              }}
              title="Download Daily Queue Volume & Wait Time Analytics (CSV)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Data</span>
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0051d5] text-white text-xs font-bold hover:bg-[#316bf3] shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Generate Queue QR</span>
            </button>
            <button
              onClick={() => {
                const t = queueStore.addWalkIn('VIP Fast-Track', '', 'Priority Checkup');
                triggerToast(`Fast-track Token #${t.ticketNumber} inserted!`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] hover:bg-[#dbe1ff] border border-[#dbe1ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0051d5]">add</span>
              <span>Fast-track Token</span>
            </button>
            <button
              onClick={onLogout || onNavigateHome}
              title="End Desk Session (Logout)"
              className="px-2.5 py-1.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg font-bold transition-all flex items-center gap-1 border border-[#ffdad6]"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
          {activeView === 'analytics' ? (
            <AnalyticsOverview onBackToDispatch={() => setActiveView('dispatch')} />
          ) : (
            <>
              {/* Station Bar with High Velocity Control Room styling */}
              <div className="bg-[#151b2a] text-[#dce9ff] px-6 py-4 rounded-2xl shadow-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 relative overflow-hidden border border-cyan-400/20">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#0051d5]/15 blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#316bf3] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">medical_services</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-md text-xl sm:text-2xl text-white font-extrabold tracking-tight">
                    SmileCare Dental Clinic
                  </h1>
                  <span className="font-mono text-xs text-[#a2eeff] bg-[#0051d5]/40 px-2 py-0.5 rounded border border-[#a2eeff]/30">
                    COUNTER 01
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#dce9ff]/80 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    CLINIC OPEN
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                    Dr. Harrison
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                    Reception Desk 1
                  </span>
                </div>
              </div>
            </div>

            {/* Live Controls */}
            <div className="flex items-center gap-2 relative z-10 flex-wrap">
              <button
                onClick={() => queueStore.toggleChime()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px] text-[#a2eeff]">volume_up</span>
                <span className="hidden sm:inline">Chime Alerts:</span>
                <span className={`font-bold ${state.chimeEnabled ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {state.chimeEnabled ? 'ON' : 'MUTED'}
                </span>
              </button>
              <button
                onClick={() => queueStore.toggleAutoDispatch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px] text-[#a2eeff]">bolt</span>
                <span className="hidden sm:inline">Auto-dispatch:</span>
                <span className={`font-bold ${state.autoDispatchActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {state.autoDispatchActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0051d5]/50 hover:bg-[#0051d5] text-white text-xs font-semibold transition-all border border-cyan-400/30"
              >
                <span className="material-symbols-outlined text-[18px] text-[#a2eeff]">insights</span>
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => triggerToast('Hardware audio & thermal printer interface synced.')}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
                title="Station Hardware Config"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
            </div>
          </div>

          {/* Real-time Metrics Deck (4 Key Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Waiting List */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-bold">WAITING LIST</span>
                <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-3xl sm:text-4xl font-extrabold text-[#0b1c30]">
                    {state.waitingQueue.length}
                  </span>
                  <span className="font-mono text-xs text-[#45474c]">patients</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#0051d5] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>&uarr; 2 from last hour</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e5eeff]">
                <div className="h-full bg-[#0051d5] w-3/5"></div>
              </div>
            </div>

            {/* Stat 2: Currently Serving */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#0051d5] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
                  CURRENTLY SERVING
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-3xl sm:text-4xl font-extrabold text-[#0051d5]">
                    #{state.servingTicket?.ticketNumber || '--'}
                  </span>
                  <span className="font-mono text-xs text-[#45474c]">Counter 1</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#45474c] font-mono">
                  <span className="material-symbols-outlined text-[16px] text-[#76777d]">timer</span>
                  <span>Active: {formattedTimer}</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e5eeff]">
                <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
              </div>
            </div>

            {/* Stat 3: Avg Wait Time */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-bold">AVG. WAIT TIME</span>
                <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#45474c]">
                  <span className="material-symbols-outlined text-[18px]">hourglass_bottom</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-3xl sm:text-4xl font-extrabold text-[#0b1c30]">18</span>
                  <span className="text-base text-[#0b1c30] font-bold">min</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  <span>Down 22% with QueueLess</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e5eeff]">
                <div className="h-full bg-emerald-500 w-4/5"></div>
              </div>
            </div>

            {/* Stat 4: Completed Today */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-bold">COMPLETED TODAY</span>
                <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#45474c]">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-3xl sm:text-4xl font-extrabold text-[#0b1c30]">
                    {state.completedTodayCount}
                  </span>
                  <span className="font-mono text-xs text-[#45474c]">served</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#45474c]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>{state.noShowsCount} no-shows recorded</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e5eeff]">
                <div className="h-full bg-[#316bf3] w-full"></div>
              </div>
            </div>
          </div>

          {/* Main Grid: Active Chamber + Waitlist Table + Tools */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              {/* Central Action Zone: Elevated Hero Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-[#dbe1ff]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border border-emerald-200">
                        DESK 01 SESSION ENGAGED
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#76777d] uppercase tracking-wider">
                      CURRENT DISPATCH CALL
                    </span>
                    <div className="flex items-baseline gap-4 mt-1">
                      <span className="font-queue-token text-4xl sm:text-5xl text-[#0051d5] font-black leading-none">
                        #{state.servingTicket?.ticketNumber || '--'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-headline-md text-xl sm:text-2xl text-[#0b1c30] font-bold">
                          {state.servingTicket?.customerName || 'None'}
                        </span>
                        <span className="text-xs text-[#45474c] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[16px] text-[#0051d5]">dentistry</span>
                          {state.servingTicket?.serviceType || 'General Oral Examination & Cleaning'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Duration Chronometer */}
                  <div className="bg-[#eff4ff] px-4 py-3 rounded-xl flex md:flex-col items-center justify-between md:items-end gap-1 border border-[#dbe1ff]">
                    <span className="font-mono text-[10px] text-[#76777d] uppercase font-bold">Active Duration</span>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#0051d5] text-[20px] animate-pulse">timer</span>
                      <span className="font-mono text-lg font-bold text-[#0b1c30] tracking-wider">
                        {formattedTimer}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#45474c]">Scheduled: 15 min</span>
                  </div>
                </div>

                {/* THE GIANT PRIMARY ACTION BUTTON */}
                <div className="pt-2 pb-4">
                  <button
                    onClick={handleCallNext}
                    className="w-full group relative overflow-hidden bg-[#000000] text-white py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-[#151b2a] transition-all flex items-center justify-between transform active:scale-[0.99] border border-cyan-400/20"
                  >
                    <div className="flex items-center gap-4 relative z-10 text-left">
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner">
                        <span className="material-symbols-outlined text-[28px] group-hover:translate-x-1 transition-transform">
                          skip_next
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#a2eeff] uppercase tracking-wider block font-bold font-mono">
                          PRIMARY COUNTER ACTION
                        </span>
                        <span className="font-headline-md text-xl sm:text-2xl text-white font-extrabold tracking-tight">
                          CALL NEXT PATIENT
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 relative z-10">
                      <span className="font-mono text-xs text-white/70 bg-white/10 px-3 py-1 rounded border border-white/10">
                        SHORTCUT: SPACE / ENTER
                      </span>
                      <span className="material-symbols-outlined text-[30px] text-[#a2eeff] group-hover:translate-x-2 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                </div>

                {/* Auxiliary Desk Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleRecallChime}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#0b1c30] text-xs font-bold transition-all border border-[#dbe1ff]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0051d5]">campaign</span>
                    <span>Recall #{state.servingTicket?.ticketNumber || 42} (Chime)</span>
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#0b1c30] text-xs font-bold transition-all border border-[#dbe1ff]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                    <span>Mark as Completed ✓</span>
                  </button>
                  <button
                    onClick={handleSkipNoShow}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold transition-all border border-[#ba1a1a]/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_off</span>
                    <span>Skip / No Show</span>
                  </button>
                </div>
              </div>

              {/* Waiting Customers Live Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[#e2e8f0]">
                <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 bg-[#eff4ff] border-b border-[#dbe1ff]">
                  <div>
                    <span className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">
                      UPCOMING ARRIVALS
                    </span>
                    <h2 className="font-headline-sm text-base sm:text-lg text-[#0b1c30] font-bold">
                      Waiting Queue &mdash; Counter 01 Lane
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#45474c] bg-white px-2.5 py-1 rounded border border-[#dbe1ff]">
                      Auto-sort by Priority
                    </span>
                    <button className="w-8 h-8 rounded-lg bg-white hover:bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] border border-[#dbe1ff]">
                      <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    </button>
                  </div>
                </div>

                {/* Density Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f8f9ff] text-[#76777d] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                        <th className="py-2.5 px-3">Pos</th>
                        <th className="py-2.5 px-3">Ticket</th>
                        <th className="py-2.5 px-3">Patient Name</th>
                        <th className="py-2.5 px-3">Service Type</th>
                        <th className="py-2.5 px-3">Wait Duration</th>
                        <th className="py-2.5 px-3">Est. Call</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {state.waitingQueue.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                idx === 0
                                  ? 'bg-[#dbe1ff] text-[#00174b]'
                                  : 'bg-[#eff4ff] text-[#45474c]'
                              }`}
                            >
                              {idx + 1}
                              {idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-headline-sm text-sm font-bold text-[#0051d5]">
                                #{item.ticketNumber}
                              </span>
                              {item.checkedIn && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  title="Arrival Confirmed via Geolocation API"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>Arrived</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#0b1c30]">{item.customerName}</div>
                            <div className="font-mono text-[10px] text-[#76777d]">
                              {item.customerPhone || '+91 •••• ••' + (1000 + item.ticketNumber * 37)}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1.5 text-[#45474c]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]"></span>
                              {item.serviceType}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#45474c]">
                            {idx * 4 + 2} min ago
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-emerald-600">
                              ~{item.waitMinutesEstimated} min
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              {idx === 0 ? (
                                <button
                                  onClick={handleCallNext}
                                  className="px-2.5 py-1 rounded-lg bg-[#0051d5] text-white hover:bg-[#316bf3] font-bold uppercase text-[10px] shadow-sm"
                                >
                                  Call Next
                                </button>
                              ) : (
                                <button
                                  onClick={() => queueStore.prioritizeTicket(item.id)}
                                  className="px-2 py-1 rounded-lg bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dbe1ff] font-semibold uppercase text-[10px]"
                                >
                                  Call
                                </button>
                              )}
                              <button
                                onClick={() => queueStore.removeTicket(item.id)}
                                className="p-1 rounded text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]"
                                title="Remove"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-[#eff4ff] flex items-center justify-between text-xs text-[#45474c] border-t border-[#dbe1ff]">
                  <span>Showing {state.waitingQueue.length} waiting patients</span>
                  <span className="font-bold text-[#0051d5]">LANE CAPACITY: NOMINAL</span>
                </div>
              </div>
            </div>

            {/* Right Column: Auxiliary Dispatch Tools (4 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              {/* Tool 1: Walk-in Quick Add Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#76777d] uppercase tracking-wider block font-bold">
                      RECEPTION ASSIST
                    </span>
                    <h3 className="font-headline-sm text-base text-[#0b1c30] font-bold">Walk-in Quick Add</h3>
                  </div>
                </div>
                <p className="text-xs text-[#45474c] mb-3">
                  Issue instant paper token or SMS ticket for patients arriving without a smartphone.
                </p>

                <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#0b1c30] mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#0b1c30] mb-1">
                      Mobile Phone (For SMS Tracking)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[#76777d]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] font-mono focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#0b1c30] mb-1">
                      Care Category
                    </label>
                    <select
                      value={walkInCategory}
                      onChange={(e) => setWalkInCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0051d5] cursor-pointer"
                    >
                      <option value="General Oral Checkup (15m)">General Oral Checkup (15m)</option>
                      <option value="Cleaning & Scaling (30m)">Cleaning &amp; Scaling (30m)</option>
                      <option value="Emergency Toothache (Urgent)">Emergency Toothache (Urgent)</option>
                      <option value="Cosmetic / Aligners (45m)">Cosmetic / Aligners (45m)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                    <span>Issue Ticket #{nextTicketToCall}</span>
                  </button>
                </form>
              </div>

              {/* Tool 2: Broadcast Announcement Tool */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                    <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#76777d] uppercase tracking-wider block font-bold">
                      QUEUE-WIDE SMS
                    </span>
                    <h3 className="font-headline-sm text-base text-[#0b1c30] font-bold">Broadcast Announcement</h3>
                  </div>
                </div>
                <p className="text-xs text-[#45474c] mb-2">
                  Push immediate updates to phones of all {state.waitingQueue.length} currently waiting patients.
                </p>

                <form onSubmit={handleBroadcast} className="flex flex-col gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBroadcastText('Running 5m ahead of schedule. Feel free to head toward reception.')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dbe1ff] border border-[#dbe1ff]"
                    >
                      "Running 5m ahead"
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastText('Doctor handling emergency pain triage. Estimated +10m delay.')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dbe1ff] border border-[#dbe1ff]"
                    >
                      "Dr. emergency delay +10m"
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastText('Free refreshments & espresso available at our Level 2 lobby bar.')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dbe1ff] border border-[#dbe1ff]"
                    >
                      "Free coffee at Lobby Bar"
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Type custom SMS alert to broadcast..."
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0051d5] resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-[#151b2a] text-white hover:bg-[#000000] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Broadcast to {state.waitingQueue.length} Devices</span>
                  </button>
                </form>
              </div>

              {/* Tool 3: QR Code Desk Display Stand Preview & Generator */}
              <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-[#e2e8f0]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">
                      PHYSICAL CHECK-IN SIGNAGE
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-bold border border-emerald-200">
                      LIVE SYNC
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-base text-[#0b1c30] font-bold mb-1">
                    Counter QR Stand Generator
                  </h3>
                  <p className="text-xs text-[#45474c] mb-3">
                    Generate, customize, display on iPads, or print high-res counter stand posters for physical lobby check-ins.
                  </p>
                </div>

                <div className="bg-[#eff4ff] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#dbe1ff]">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-16 h-16 bg-white p-1.5 rounded-xl shadow-xs flex-shrink-0 flex items-center justify-center border border-[#dbe1ff]">
                      <svg className="w-full h-full text-[#0051d5]" fill="currentColor" viewBox="0 0 100 100">
                        <path d="M0 0h36v36H0zM6 6h24v24H6zm4 4h16v16H10zM64 0h36v36H64zM70 6h24v24H70zm4 4h16v16H74zM0 64h36v36H0zM6 70h24v24H6zm4 4h16v16H10zM44 8h12v12H44zM44 24h12v12H44zM8 44h12v12H8zM24 44h12v12H24zM44 44h12v12H44zM64 44h12v12H64zM80 44h12v12H80zM44 64h12v12H44zM44 80h12v12H44zM64 64h12v12H64zM80 64h12v12H80zM64 80h12v12H64zM80 80h12v12H80z"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-[#0051d5] font-bold block">
                        SmileCare • Counter 01
                      </span>
                      <span className="text-[11px] text-[#45474c] block mt-0.5">
                        Touchless Arrival &amp; Remote Token QR
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsQrModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                      <span>Generate &amp; Print Stand</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Footer Metrics / Heartbeat */}
          <div className="bg-[#e5eeff] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[#45474c] text-xs border border-[#dbe1ff]">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[#0b1c30] font-semibold">
                  WEBSOCKET: CONNECTED ({state.networkLatencyMs}ms)
                </span>
              </div>
              <span>•</span>
              <span>Daily Target: 80 Consultations</span>
              <span>•</span>
              <span>Lane Efficiency: 94.8%</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#76777d]">
              <span>BUILD: v4.12-PROD</span>
              <span>•</span>
              <span className="text-[#0051d5] font-bold">STATION ONLINE</span>
            </div>
          </div>
        </>
      )}
    </main>
  </div>

      {/* Generate Queue QR Code Modal & Stand Customizer */}
      <AdminQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        venueName="SmileCare Dental Clinic"
        venueSlug="smilecare-dental"
        currentQueueCount={state.waitingQueue.length}
      />
    </div>
  );
};
