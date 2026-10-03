import React from 'react';

export type ActiveTab =
  | 'home-hero'
  | 'find-service-directory'
  | 'customer-ticket'
  | 'admin-live-control';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenJoinModal: () => void;
  onOpenLoginModal: () => void;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenJoinModal,
  onOpenLoginModal,
  isAdminLoggedIn = false,
  onAdminLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e8f0]/60">
      {/* Top Banner */}
      <div className="w-full bg-[#151b2a] text-[#fefcff] px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] sm:text-[12px] font-bold tracking-wider">
        <div className="flex items-center gap-2 mx-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2fd9f4] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0051d5]"></span>
          </span>
          <span className="text-[#fefcff] font-medium tracking-wide">
            QueueLess Real-Time Platform: Zero Physical Lines • Live Virtual Queues
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="h-16 sm:h-20 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Sync Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => onTabChange('home-hero')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0051d5] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,81,213,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">bolt</span>
            </div>
            <span className="font-headline-md text-xl sm:text-2xl text-[#0b1c30] font-extrabold tracking-tight">
              Queue<span className="text-[#0051d5]">Less</span>
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 bg-[#eff4ff] px-3 py-1 rounded-full border border-[#dbe1ff]">
            <span className="material-symbols-outlined text-[#0051d5] text-[15px] animate-spin [animation-duration:4s]">
              sync
            </span>
            <span className="text-[11px] text-[#0051d5] uppercase font-bold tracking-wide">
              Real-time sync active
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Only show user tabs unless Admin is logged in */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onTabChange('home-hero')}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === 'home-hero'
                ? 'bg-[#0051d5] text-white font-bold shadow-sm'
                : 'text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
            }`}
          >
            Home / Overview
          </button>
          <button
            onClick={() => onTabChange('find-service-directory')}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === 'find-service-directory'
                ? 'bg-[#0051d5] text-white font-bold shadow-sm'
                : 'text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
            }`}
          >
            Find Service &amp; Directory
          </button>
          <button
            onClick={() => onTabChange('customer-ticket')}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === 'customer-ticket'
                ? 'bg-[#0051d5] text-white font-bold shadow-sm'
                : 'text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
            }`}
          >
            Customer Ticket
          </button>

          {/* Admin Live Control tab is ONLY shown if admin is logged in */}
          {isAdminLoggedIn && (
            <button
              onClick={() => onTabChange('admin-live-control')}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin-live-control'
                  ? 'bg-[#0051d5] text-white shadow-sm'
                  : 'text-[#0051d5] bg-[#eff4ff] hover:bg-[#dbe1ff] border border-[#dbe1ff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Right Action Matrix */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Counter Login / Session Toggle */}
          {!isAdminLoggedIn ? (
            <button
              onClick={onOpenLoginModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-[#45474c] hover:text-[#0051d5] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-[#0051d5]">lock</span>
              <span>Admin Counter Login</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onTabChange('admin-live-control')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#eff4ff] text-[#0051d5] border border-[#dbe1ff] hover:bg-[#dbe1ff] transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Counter 01 Active</span>
              </button>
              {onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  title="End Admin Session"
                  className="px-2.5 py-1.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg font-semibold transition-all"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          <button
            onClick={onOpenJoinModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-[13px] font-bold bg-[#0051d5] text-white shadow-[0_4px_20px_-2px_rgba(0,81,213,0.35)] hover:shadow-[0_8px_24px_-2px_rgba(0,81,213,0.45)] hover:bg-[#316bf3] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Join a Queue</span>
          </button>

          <button
            onClick={isAdminLoggedIn ? () => onTabChange('admin-live-control') : onOpenLoginModal}
            title={isAdminLoggedIn ? 'Admin Desk Active (Click to switch)' : 'Admin Counter Login'}
            className="w-8 h-8 rounded-full bg-[#151b2a] text-white flex items-center justify-center hover:bg-[#000000] transition-colors shadow-sm relative"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            {isAdminLoggedIn && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar: Admin Console shown ONLY if logged in */}
      <div className="lg:hidden flex items-center justify-around border-t border-[#e2e8f0] bg-white py-1.5 px-2 overflow-x-auto">
        <button
          onClick={() => onTabChange('home-hero')}
          className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap ${
            activeTab === 'home-hero' ? 'bg-[#0051d5] text-white' : 'text-[#45474c]'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('find-service-directory')}
          className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap ${
            activeTab === 'find-service-directory' ? 'bg-[#0051d5] text-white' : 'text-[#45474c]'
          }`}
        >
          Directory
        </button>
        <button
          onClick={() => onTabChange('customer-ticket')}
          className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap ${
            activeTab === 'customer-ticket' ? 'bg-[#0051d5] text-white' : 'text-[#45474c]'
          }`}
        >
          My Ticket
        </button>
        {isAdminLoggedIn ? (
          <button
            onClick={() => onTabChange('admin-live-control')}
            className={`px-3 py-1 text-xs rounded font-semibold whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'admin-live-control' ? 'bg-[#0051d5] text-white' : 'text-[#0051d5] bg-[#eff4ff]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Admin Console</span>
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="px-2.5 py-1 text-xs rounded font-semibold whitespace-nowrap text-[#45474c] flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px] text-[#0051d5]">lock</span>
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
