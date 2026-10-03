import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('dr.harrison@smilecare.com');
  const [counter, setCounter] = useState('Counter 01 — Reception & Consultation');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151b2a]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 relative border border-[#dbe1ff] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#151b2a] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">desktop_windows</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-[#0b1c30]">Operator Console Sign In</h3>
              <p className="text-xs text-[#0051d5] font-semibold">QueueControl Desk Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45474c] hover:bg-[#dbe1ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Assigned Chamber / Desk Station
            </label>
            <select
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0051d5] cursor-pointer"
            >
              <option value="Counter 01 — Reception & Consultation">Counter 01 — Reception &amp; Consultation</option>
              <option value="Counter 02 — Dental Hygiene & X-Ray">Counter 02 — Dental Hygiene &amp; X-Ray</option>
              <option value="Counter 03 — Surgery & Orthodontics">Counter 03 — Surgery &amp; Orthodontics</option>
              <option value="Counter 04 — Express Billing & Discharge">Counter 04 — Express Billing &amp; Discharge</option>
            </select>
          </div>

          <div className="bg-[#eff4ff] p-3 rounded-2xl flex items-center gap-2 text-xs text-[#45474c]">
            <span className="material-symbols-outlined text-[#0051d5] text-[18px]">lock</span>
            <span>Authenticated staff session with sub-second WebSocket dispatch.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white font-bold text-sm shadow-lg shadow-[#0051d5]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Access Counter Dispatch Deck</span>
          </button>
        </form>
      </div>
    </div>
  );
};
