import React, { useState } from 'react';
import { queueStore } from '../store/queueStore';
import { notificationService } from '../utils/notifications';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVenueName?: string;
  onSuccess: (ticketNumber: number) => void;
}

export const JoinQueueModal: React.FC<JoinQueueModalProps> = ({
  isOpen,
  onClose,
  defaultVenueName = 'SmileCare Dental Clinic',
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('General Consultation / Cleaning');
  const [enableBackgroundAlerts, setEnableBackgroundAlerts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const customerName = name.trim() || 'Visitor';
    const ticket = queueStore.joinAsUser(customerName, phone, service);

    // Request Notification API permissions and arm Service Worker upon ticket creation
    if (enableBackgroundAlerts) {
      try {
        await notificationService.requestPermissionOnTicketCreation(ticket.ticketNumber);
      } catch {
        // Continue even if dismissed by user or restricted
      }
    }

    setIsSubmitting(false);
    onSuccess(ticket.ticketNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151b2a]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 relative border border-[#dbe1ff] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#0051d5]">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-[#0b1c30]">Join Queue Remotely</h3>
              <p className="text-xs text-[#0051d5] font-semibold">{defaultVenueName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45474c] hover:bg-[#dbe1ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Your Full Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] text-sm focus:outline-none focus:ring-2 focus:ring-[#0051d5] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Mobile Phone (For Real-time SMS Turn Alert)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#76777d]">
                +1 / +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full pl-20 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0051d5] transition-all"
              />
            </div>
            <span className="text-[11px] text-[#45474c] mt-1 block">
              We never spam. You only get notified when your turn approaches (≤3 people ahead).
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Service Lane Requested
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0051d5] transition-all cursor-pointer"
            >
              <option value="General Consultation / Cleaning">General Consultation &amp; Cleaning (15m)</option>
              <option value="X-Ray & Diagnostic Scan">X-Ray &amp; Diagnostic Scan (20m)</option>
              <option value="Emergency Toothache / Pain Relief">Emergency Toothache Triage (Priority)</option>
              <option value="Orthodontics & Aligners">Orthodontics &amp; Aligners (30m)</option>
            </select>
          </div>

          {/* Background Alerts Permission Upon Ticket Creation */}
          <div className="bg-[#eff4ff] p-3.5 rounded-2xl border border-[#dbe1ff] flex items-start gap-3">
            <input
              type="checkbox"
              id="bg-alerts-checkbox"
              checked={enableBackgroundAlerts}
              onChange={(e) => setEnableBackgroundAlerts(e.target.checked)}
              className="mt-1 h-4 w-4 rounded text-[#0051d5] border-[#dbe1ff] focus:ring-[#0051d5] cursor-pointer accent-[#0051d5]"
            />
            <label htmlFor="bg-alerts-checkbox" className="text-xs text-[#0b1c30] cursor-pointer">
              <span className="font-bold flex items-center gap-1.5 text-[#0051d5]">
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                Enable Background Alerts (Service Worker)
              </span>
              <span className="text-[#45474c] block mt-0.5 leading-snug">
                Requests Notification API permissions upon ticket creation so you get alerts even if this tab is minimized or in the background.
              </span>
            </label>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white font-bold text-sm shadow-lg shadow-[#0051d5]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSubmitting ? 'sync' : 'confirmation_number'}
              </span>
              <span>{isSubmitting ? 'Creating Ticket & Requesting Permission...' : 'Generate Ticket & Enter Queue'}</span>
            </button>
          </div>
        </form>

        <div className="bg-[#eff4ff] p-3 rounded-2xl flex items-center gap-2 text-xs text-[#45474c]">
          <span className="material-symbols-outlined text-[#0051d5] text-[18px]">verified</span>
          <span>Zero app download required. Background Service Worker sync enabled.</span>
        </div>
      </div>
    </div>
  );
};
