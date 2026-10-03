import React from 'react';
import { ActiveTab } from './Header';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenJoinModal: () => void;
  onOpenLoginModal: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onTabChange,
  onOpenJoinModal,
  onOpenLoginModal,
  isAdminLoggedIn = false,
}) => {
  return (
    <footer className="w-full bg-[#eff4ff] py-10 shadow-[0_-1px_8px_rgba(0,0,0,0.02)] border-t border-[#dbe1ff]">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Platform Guarantees Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#e5eeff]/70 p-4 rounded-2xl border border-[#dbe1ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d3e4fe] flex items-center justify-center text-[#0051d5] shadow-sm">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <p className="text-[15px] text-[#0b1c30] font-bold">Platform Guarantees</p>
              <p className="text-[13px] text-[#45474c]">
                Zero app download required • Instant SMS &amp; Web Push sync • Bank-grade privacy
              </p>
            </div>
          </div>
          <button
            onClick={onOpenJoinModal}
            className="flex items-center gap-2 font-mono text-[12px] text-[#0051d5] bg-white px-4 py-2 rounded-xl border border-[#dbe1ff] hover:bg-[#eff4ff] shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
            <span>Scan counter QR to skip lines</span>
          </button>
        </div>

        {/* 4 Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#0051d5] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
              </div>
              <span className="text-[18px] text-[#0b1c30] font-extrabold tracking-tight">
                Queue<span className="text-[#0051d5]">Less</span>
              </span>
            </div>
            <p className="text-[13px] text-[#45474c] leading-relaxed">
              Remote queuing, transparent wait times, and frictionless transit for modern clinics, public desks, and enterprises.
            </p>
          </div>

          {/* Live Experience */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#0b1c30] font-bold">
              Live Experience
            </span>
            <button
              onClick={() => onTabChange('home-hero')}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              Overview &amp; Features
            </button>
            <button
              onClick={() => onTabChange('customer-ticket')}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              Live Ticket Tracker
            </button>
            <button
              onClick={() => onTabChange('find-service-directory')}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              Service Directory
            </button>
          </div>

          {/* Operator Suite */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#0b1c30] font-bold">
              Operator Suite
            </span>
            <button
              onClick={isAdminLoggedIn ? () => onTabChange('admin-live-control') : onOpenLoginModal}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              {isAdminLoggedIn ? 'Counter Dispatch Deck (Active)' : 'Counter Dispatch Deck'}
            </button>
            <button
              onClick={onOpenLoginModal}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              Operator Sign In
            </button>
            <button
              onClick={() => onTabChange('find-service-directory')}
              className="text-left text-[13px] text-[#45474c] hover:text-[#0051d5] transition-colors"
            >
              Lanes &amp; Venues
            </button>
          </div>

          {/* Network Telemetry */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#0b1c30] font-bold">
              Network Telemetry
            </span>
            <div className="flex items-center gap-2 font-mono text-[12px] text-[#45474c]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#0051d5]"></span>
              <span>Socket: 28ms roundtrip</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[12px] text-[#45474c]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#316bf3]"></span>
              <span>Global Clusters: Active</span>
            </div>
            <p className="text-[12px] text-[#45474c] pt-2">
              &copy; 2026 QueueLess Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
