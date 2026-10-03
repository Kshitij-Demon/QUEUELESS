import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface AdminQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName?: string;
  venueSlug?: string;
  currentQueueCount?: number;
}

export const AdminQrModal: React.FC<AdminQrModalProps> = ({
  isOpen,
  onClose,
  venueName = 'SmileCare Dental Clinic',
  venueSlug = 'smilecare-dental',
  currentQueueCount = 12,
}) => {
  const [selectedLane, setSelectedLane] = useState('Counter 01 — General Checkup');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreenKiosk, setIsFullscreenKiosk] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getJoinUrl = () => {
    if (typeof window === 'undefined') return 'https://queueless.app/join/smilecare';
    const baseUrl = window.location.origin;
    const laneParam = encodeURIComponent(selectedLane.split('—')[0].trim().toLowerCase().replace(/\s+/g, '-'));
    return `${baseUrl}?venue=${venueSlug}&lane=${laneParam}&action=join`;
  };

  const currentJoinUrl = getJoinUrl();

  // Generate QR Code data URL whenever selected lane changes
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(
      currentJoinUrl,
      {
        width: 400,
        margin: 2,
        color: {
          dark: '#0b1c30',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, selectedLane, currentJoinUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentJoinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${venueSlug}-${selectedLane.split('—')[0].trim().toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // FULLSCREEN KIOSK MODE
  if (isFullscreenKiosk) {
    return (
      <div className="fixed inset-0 z-50 bg-[#151b2a] text-white flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-300 overflow-y-auto">
        {/* Kiosk Top Bar */}
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-[24px]">medical_services</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg sm:text-xl font-black text-white">{venueName}</h2>
              <span className="text-xs text-cyan-300 font-mono font-bold uppercase tracking-wider">
                {selectedLane} • Self-Service Check-In Kiosk
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreenKiosk(false)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close_fullscreen</span>
            <span>Exit Kiosk Mode</span>
          </button>
        </div>

        {/* Kiosk QR Centerpiece */}
        <div className="flex flex-col items-center justify-center text-center my-8 max-w-lg w-full">
          <span className="px-4 py-1.5 rounded-full bg-[#0051d5]/40 text-[#a2eeff] text-xs font-mono font-bold uppercase tracking-widest border border-cyan-400/30 mb-4 animate-pulse">
            Touchless Physical Check-in
          </span>
          <h1 className="font-display-hero text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
            Scan to Join Queue
          </h1>
          <p className="text-sm sm:text-base text-[#dce9ff]/80 max-w-md mb-8">
            Point your smartphone camera at the code below. Zero app download required — you will receive a digital ticket with live SMS turn alerts.
          </p>

          <div className="relative p-6 bg-white rounded-3xl shadow-2xl border-4 border-[#0051d5]/40 group">
            {/* Visual Scan Corner Brackets */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-[#0051d5] rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-[#0051d5] rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-[#0051d5] rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-[#0051d5] rounded-br-lg"></div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Queue Check-in QR Code"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] animate-spin text-[#0051d5]">sync</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 font-mono text-xs sm:text-sm text-[#dce9ff]/70">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Queue: {currentQueueCount} waiting</span>
            </span>
            <span>•</span>
            <span>Counter 01 Ready</span>
            <span>•</span>
            <span>Free Wi-Fi: &quot;SmileGuest&quot;</span>
          </div>
        </div>

        {/* Kiosk Footer */}
        <div className="w-full max-w-md text-center text-xs text-[#76777d]">
          Powered by QueueLess Real-Time Virtual Queue Platform
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151b2a]/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Modal Dialog */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative border border-[#dbe1ff] animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] shadow-xs border border-[#dbe1ff]">
              <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-[#0b1c30]">
                Generate Queue QR Code
              </h2>
              <p className="text-xs text-[#45474c] mt-0.5">
                Display or print a scannable QR code for physical check-ins at your reception desk or entrance stand.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45474c] hover:bg-[#dbe1ff] hover:text-[#0b1c30] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Lane Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Specific Counter / Queue Lane
            </label>
            <select
              value={selectedLane}
              onChange={(e) => setSelectedLane(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs sm:text-sm font-semibold border border-[#dbe1ff] focus:outline-none focus:ring-2 focus:ring-[#0051d5] cursor-pointer"
            >
              <option value="Counter 01 — General Checkup">Counter 01 — General Checkup</option>
              <option value="Counter 02 — Dental Hygiene & Clean">Counter 02 — Dental Hygiene &amp; Clean</option>
              <option value="Counter 03 — Emergency Pain Triage">Counter 03 — Emergency Pain Triage</option>
              <option value="Main Entrance — All Services Kiosk">Main Entrance — All Services Kiosk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Direct Check-In Destination
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentJoinUrl}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f8f9ff] text-[#45474c] text-xs font-mono border border-[#dbe1ff] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#0051d5] font-bold text-xs flex items-center gap-1 border border-[#dbe1ff] shrink-0 transition-all"
                title="Copy Direct URL"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable & Display Stand Preview Card */}
        <div
          ref={printRef}
          className="print-section bg-gradient-to-b from-white to-[#f8f9ff] rounded-2xl p-6 border-2 border-[#dbe1ff] shadow-md flex flex-col sm:flex-row items-center gap-6"
        >
          {/* QR Code Container */}
          <div className="relative p-3 bg-white rounded-2xl shadow-lg border-2 border-[#dbe1ff] shrink-0 flex items-center justify-center">
            {/* Guide Corners */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#0051d5]"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#0051d5]"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#0051d5]"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#0051d5]"></div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Queue Check-in QR Code"
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px] animate-spin text-[#0051d5]">sync</span>
              </div>
            )}
          </div>

          {/* Stand Signage Description */}
          <div className="flex flex-col gap-2.5 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 self-center sm:self-start bg-[#eff4ff] px-3 py-1 rounded-full border border-[#dbe1ff]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] text-[#0051d5] font-bold uppercase tracking-wider">
                Live Physical Signage Ready
              </span>
            </div>

            <h3 className="font-headline-md text-lg font-bold text-[#0b1c30]">
              {venueName}
            </h3>
            <p className="text-xs text-[#0051d5] font-bold font-mono">
              📍 {selectedLane}
            </p>

            <ul className="text-xs text-[#45474c] space-y-1 mt-1">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0051d5]">check_circle</span>
                <span>Scan camera to enter queue with zero app download</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0051d5]">check_circle</span>
                <span>Receive instant SMS &amp; Web Vibration when summoned</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0051d5]">check_circle</span>
                <span>Track exact position live from lobby or nearby café</span>
              </li>
            </ul>

            <div className="pt-2 text-[11px] font-mono text-[#76777d] border-t border-[#e2e8f0]">
              Acrylic Stand Spec: Standard 5x7&quot; / 8.5x11&quot; Tabletop Card
            </div>
          </div>
        </div>

        {/* Action Matrix: Print / Kiosk / Download */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => setIsFullscreenKiosk(true)}
            className="py-3 px-4 rounded-xl bg-[#151b2a] hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            <span>Display on Screen / iPad</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0051d5]/20 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Counter Stand Poster</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="py-3 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#0b1c30] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-[#dbe1ff] transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0051d5]">download</span>
            <span>Download PNG Asset</span>
          </button>
        </div>

        <div className="bg-[#f8f9ff] p-3 rounded-2xl flex items-center justify-between text-xs text-[#45474c] border border-[#e2e8f0]">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0051d5] text-[16px]">verified</span>
            <span>Unique queue token generated automatically for every physical arrival.</span>
          </span>
          <span className="font-mono text-[11px] text-[#76777d]">Format: QR Model 2 (High ECC)</span>
        </div>
      </div>
    </div>
  );
};
