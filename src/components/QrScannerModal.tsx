import React, { useState } from 'react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (venueCode: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onScanSuccess(pin.trim());
      onClose();
    }
  };

  const handleSimulateScan = () => {
    onScanSuccess('smilecare-dental');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151b2a]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-4 relative border border-[#dbe1ff] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0051d5] text-[24px]">qr_code_scanner</span>
            <h3 className="font-headline-sm text-lg text-[#0b1c30] font-bold">Scan Venue QR</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] hover:bg-[#dbe1ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Camera simulation box */}
        <div
          onClick={handleSimulateScan}
          title="Click to simulate camera detection of SmileCare QR"
          className="w-full aspect-square bg-[#151b2a] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center cursor-pointer group shadow-inner"
        >
          <div className="absolute inset-8 rounded-xl border-2 border-dashed border-[#316bf3]/60 flex items-center justify-center pointer-events-none">
            <div className="w-full h-1 bg-[#316bf3] shadow-[0_0_12px_#316bf3] animate-pulse"></div>
          </div>
          <span className="material-symbols-outlined text-white/30 text-[64px] group-hover:scale-110 transition-transform">
            photo_camera
          </span>
          <span className="font-mono text-xs text-[#d3e4fe] mt-3 font-semibold">
            Point camera at venue kiosk QR
          </span>
          <span className="text-[11px] text-cyan-300 mt-1 bg-white/10 px-3 py-1 rounded-full">
            Tap here to simulate automatic scan
          </span>
        </div>

        {/* Manual PIN Input */}
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
          <span className="font-mono text-[11px] text-[#45474c] text-center uppercase font-semibold">
            Or manually enter 6-digit counter PIN
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 749-012 or smilecare"
              className="flex-1 bg-[#eff4ff] px-4 py-2.5 rounded-xl font-mono text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#0051d5] text-white hover:bg-[#316bf3] transition-all shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
