import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { HomeHero } from './views/HomeHero';
import { ServiceDirectory } from './views/ServiceDirectory';
import { CustomerTicketView } from './views/CustomerTicketView';
import { AdminLiveControl } from './views/AdminLiveControl';
import { JoinQueueModal } from './components/JoinQueueModal';
import { QrScannerModal } from './components/QrScannerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BusinessVenue } from './types/queue';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home-hero');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedVenueName, setSelectedVenueName] = useState('SmileCare Dental Clinic');

  // Track Admin Login status - default to false so public users don't see admin console
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('queueless_admin_logged_in') === 'true';
    }
    return false;
  });

  // Network Status Listener
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveIsOnline = isOnline && !simulatedOffline;

  const handleOpenJoin = (venueName?: string) => {
    if (venueName) setSelectedVenueName(venueName);
    setIsJoinModalOpen(true);
  };

  const handleJoinSuccess = (_ticketNumber: number) => {
    setActiveTab('customer-ticket');
  };

  const handleQrScanSuccess = (_venueCode: string) => {
    setSelectedVenueName('SmileCare Dental Clinic');
    setIsJoinModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('queueless_admin_logged_in', 'true');
    }
    setActiveTab('admin-live-control');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('queueless_admin_logged_in');
    }
    setActiveTab('home-hero');
  };

  const handleSelectVenue = (venue: BusinessVenue) => {
    setSelectedVenueName(venue.name);
    setIsJoinModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Universal Header - Admin Console is hidden from users unless logged in */}
      {activeTab !== 'admin-live-control' && (
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenJoinModal={() => handleOpenJoin()}
          onOpenLoginModal={() => setIsAdminLoginOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLogout={handleAdminLogout}
        />
      )}

      {/* Main View Area */}
      <main className={`flex-1 w-full ${activeTab !== 'admin-live-control' ? 'pt-16 sm:pt-20' : ''}`}>
        {activeTab === 'home-hero' && (
          <HomeHero
            onTabChange={setActiveTab}
            onOpenJoinModal={() => handleOpenJoin()}
            onOpenLoginModal={() => setIsAdminLoginOpen(true)}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeTab === 'find-service-directory' && (
          <ServiceDirectory
            onSelectVenue={handleSelectVenue}
            onOpenJoinModal={(name) => handleOpenJoin(name)}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {activeTab === 'customer-ticket' && (
          <CustomerTicketView
            onJoinDifferentQueue={() => setActiveTab('find-service-directory')}
            isOnline={effectiveIsOnline}
            simulatedOffline={simulatedOffline}
            onToggleSimulateOffline={() => setSimulatedOffline((prev) => !prev)}
          />
        )}

        {/* Admin Console View - Only displayed if admin logged in */}
        {activeTab === 'admin-live-control' && (
          isAdminLoggedIn ? (
            <AdminLiveControl
              onNavigateHome={() => setActiveTab('home-hero')}
              onNavigateDirectory={() => setActiveTab('find-service-directory')}
              onLogout={handleAdminLogout}
            />
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-[#dbe1ff] text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
                </div>
                <h2 className="font-headline-md text-2xl font-bold text-[#0b1c30]">
                  Admin Console Protected
                </h2>
                <p className="text-sm text-[#45474c] leading-relaxed">
                  The Desk Dispatch Console is strictly restricted to authorized clinic operators and desk staff. Please sign in via Admin Counter Login to view this deck.
                </p>
                <div className="pt-2 flex flex-col gap-2 w-full">
                  <button
                    onClick={() => setIsAdminLoginOpen(true)}
                    className="w-full py-3 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Admin Counter Login</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('home-hero')}
                    className="w-full py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#0b1c30] text-xs font-semibold transition-all"
                  >
                    Return to User Overview
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer on non-admin screens */}
      {activeTab !== 'admin-live-control' && (
        <Footer
          onTabChange={setActiveTab}
          onOpenJoinModal={() => handleOpenJoin()}
          onOpenLoginModal={() => setIsAdminLoginOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
        />
      )}

      {/* Global Modals */}
      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        defaultVenueName={selectedVenueName}
        onSuccess={handleJoinSuccess}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
