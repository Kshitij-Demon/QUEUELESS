import React, { useState, useEffect } from 'react';
import { BusinessVenue } from '../types/queue';
import { INITIAL_VENUES, queueStore } from '../store/queueStore';
import { notificationService } from '../utils/notifications';

interface ServiceDirectoryProps {
  onSelectVenue: (venue: BusinessVenue) => void;
  onOpenJoinModal: (venueName?: string) => void;
  onOpenQrScanner: () => void;
}

export const ServiceDirectory: React.FC<ServiceDirectoryProps> = ({
  onSelectVenue,
  onOpenJoinModal,
  onOpenQrScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('healthcare');
  const [subscribedPush, setSubscribedPush] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; token: string; wait: string } | null>(null);
  const [queueState, setQueueState] = useState(queueStore.getState());

  useEffect(() => {
    return queueStore.subscribe((s) => setQueueState({ ...s }));
  }, []);

  const categories = [
    { id: 'healthcare', label: 'Healthcare & Clinics', emoji: '🦷', count: 14 },
    { id: 'salon', label: 'Salon & Spa', emoji: '💇', count: 8 },
    { id: 'banking', label: 'Banking & Finance', emoji: '🏦', count: 11 },
    { id: 'civic', label: 'Government & Civic', emoji: '🏛', count: 5 },
    { id: 'food', label: 'Restaurants & Cafes', emoji: '🍽', count: 19 },
    { id: 'repair', label: 'Auto & Repair', emoji: '🔧', count: 7 },
  ];

  const filteredVenues = INITIAL_VENUES.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.deskRouting.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || venue.category === selectedCategory;

    return matchesSearch && (matchesCategory || searchTerm.length > 0);
  });

  const handleQuickJoin = (venue: BusinessVenue) => {
    const ticket = queueStore.addWalkIn('Visitor', '', venue.deskRouting.split('•')[0] || 'General Service');
    setToastData({
      title: venue.name,
      token: `#${ticket.ticketNumber}`,
      wait: `${ticket.waitMinutesEstimated} min`,
    });
    setTimeout(() => {
      setToastData(null);
    }, 4500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastData && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#dbe1ff] animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#0051d5] flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-[#0051d5] uppercase font-bold">
              <span>Ticket Assigned</span>
              <span className="font-mono bg-[#eff4ff] px-1 py-0.5 rounded text-[#0b1c30]">
                {toastData.token}
              </span>
            </div>
            <span className="text-sm text-[#0b1c30] font-extrabold truncate">{toastData.title}</span>
            <span className="font-mono text-[11px] text-[#45474c]">Est. wait: {toastData.wait}</span>
          </div>
          <button onClick={() => setToastData(null)} className="text-[#76777d] hover:text-[#0b1c30]">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Directory Hero Banner */}
      <div className="relative w-full overflow-hidden bg-[#eff4ff] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#dbe1ff]">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#0051d5]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-[#2fd9f4]/20 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs text-[#0051d5] uppercase tracking-wider font-bold">
                <span className="inline-flex w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
                <span>Live Dispatch Directory • Remote Transit Enabled</span>
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-[#0b1c30] font-extrabold">
                Skip Physical Lines. <span className="text-[#0051d5]">Arrive Exactly on Time.</span>
              </h1>
              <p className="text-sm text-[#45474c]">
                Explore vetted medical hubs, civic counters, financial branches, and studios. Join from your browser with zero download and receive live sync telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onOpenQrScanner}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#0b1c30] shadow-md hover:shadow-lg hover:bg-[#f8f9ff] transition-all border border-[#dbe1ff]"
              >
                <span className="material-symbols-outlined text-[#0051d5] text-[20px]">qr_code_scanner</span>
                <span>Scan Venue QR Code Directly</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full bg-white/95 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 border border-[#dbe1ff]">
            <div className="flex items-center gap-2 px-3 py-2 w-full md:flex-1">
              <span className="material-symbols-outlined text-[#0051d5] text-[24px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Where do you need to go? Search clinic, salon, branch, or service..."
                className="w-full bg-transparent text-sm text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto p-1 justify-end">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors border border-transparent hover:border-[#dbe1ff]">
                <span className="material-symbols-outlined text-[16px] text-[#0051d5]">near_me</span>
                <span>Downtown • 5 km</span>
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0051d5] text-white shadow-md hover:bg-[#316bf3] transition-all"
              >
                <span>Find Queue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#0051d5] text-white border-[#0051d5] shadow-sm'
                      : 'bg-white text-[#45474c] border-[#dbe1ff] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[11px] font-mono ${
                      isActive ? 'text-[#a2eeff]' : 'text-[#76777d]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Listings + Right Sidebar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Counter Nodes */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-xl sm:text-2xl text-[#0b1c30] font-bold">
                  Live Counter Nodes
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-[#e5eeff] text-[#0051d5] font-bold border border-[#dbe1ff]">
                  {filteredVenues.length} Verified Active
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#45474c]">
                <span>Sort:</span>
                <span className="text-[#0051d5] font-bold cursor-pointer flex items-center gap-0.5">
                  Shortest Wait <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </span>
              </div>
            </div>

            {/* List of Venues */}
            {filteredVenues.map((venue) => {
              const isSmileCare = venue.id === 'smilecare';
              const liveQueueSize = isSmileCare
                ? queueState.waitingQueue.length + (queueState.servingTicket ? 1 : 0)
                : venue.currentQueueSize;
              const maxAllowedCapacity = venue.maxCapacity || 20;
              const capacityPercent = Math.min(100, Math.round((liveQueueSize / maxAllowedCapacity) * 100));
              const spotsRemaining = Math.max(0, maxAllowedCapacity - liveQueueSize);

              let statusBadgeText = 'Optimal • Low Load';
              let statusBadgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
              let barGradient = 'from-emerald-500 to-teal-500';
              let percentTextColor = 'text-emerald-700';

              if (capacityPercent >= 80) {
                statusBadgeText = 'Near Capacity • High Demand';
                statusBadgeStyle = 'bg-rose-50 text-rose-800 border-rose-300';
                barGradient = 'from-amber-500 via-rose-500 to-red-600';
                percentTextColor = 'text-rose-700';
              } else if (capacityPercent >= 50) {
                statusBadgeText = 'Moderate • Active Flow';
                statusBadgeStyle = 'bg-[#eff4ff] text-[#0051d5] border-[#dbe1ff]';
                barGradient = 'from-[#0051d5] via-[#316bf3] to-cyan-500';
                percentTextColor = 'text-[#0051d5]';
              }

              return (
                <div
                  key={venue.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#e2e8f0] p-5 sm:p-6 flex flex-col gap-4 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {venue.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={venue.imageUrl} alt={venue.name} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-[#eff4ff] flex items-center justify-center text-[#0051d5] border border-[#dbe1ff]">
                          <span className="material-symbols-outlined text-[32px]">account_balance</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-[#eff4ff] text-[#0051d5] font-bold border border-[#dbe1ff]">
                            <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
                            <span>Accepting Customers</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] bg-[#dce9ff] text-[#0b1c30] px-2 py-0.5 rounded-md font-semibold">
                            <span className="material-symbols-outlined text-[13px] text-[#0051d5]">star</span>
                            <span>{venue.rating} ({venue.reviewsCount}+ reviews)</span>
                          </span>
                          {venue.tag && (
                            <span className="font-mono text-[11px] text-[#0051d5] font-bold uppercase tracking-wider bg-[#d3e4fe] px-2 py-0.5 rounded">
                              {venue.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="font-headline-md text-lg sm:text-xl text-[#0b1c30] font-extrabold tracking-tight">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-[#45474c]">{venue.deskRouting}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 flex-shrink-0">
                      <span className="font-mono text-xs text-[#45474c]">Next Call Window</span>
                      <span className="font-headline-sm text-base sm:text-lg text-[#0051d5] font-extrabold">
                        ~{venue.avgWaitMins} min
                      </span>
                    </div>
                  </div>

                  {/* 4 Mini Metrics for Featured Venue or Tag Strip for Others */}
                  {isSmileCare ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#eff4ff] p-3 rounded-xl border border-[#dbe1ff]">
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm text-center border border-[#e2e8f0]">
                        <span className="font-mono text-[10px] text-[#76777d] uppercase font-semibold">Queue Size</span>
                        <span className="font-headline-sm text-base text-[#0b1c30] font-extrabold">
                          {liveQueueSize}
                        </span>
                        <span className="text-[11px] text-[#45474c]">people waiting</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm text-center border border-[#e2e8f0]">
                        <span className="font-mono text-[10px] text-[#76777d] uppercase font-semibold">Est. Wait</span>
                        <span className="font-headline-sm text-base text-[#0051d5] font-extrabold">
                          {venue.avgWaitMins}m
                        </span>
                        <span className="text-[11px] text-[#45474c]">~2.9 min/pat</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm text-center border border-[#e2e8f0]">
                        <span className="font-mono text-[10px] text-[#76777d] uppercase font-semibold">Distance</span>
                        <span className="font-headline-sm text-base text-[#0b1c30] font-extrabold">
                          {venue.distanceKm} km
                        </span>
                        <span className="text-[11px] text-[#45474c]">{venue.transitTimeText}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm text-center border border-[#e2e8f0]">
                        <span className="font-mono text-[10px] text-[#76777d] uppercase font-semibold">Status</span>
                        <span className="font-headline-sm text-base text-[#316bf3] font-extrabold">
                          {venue.status}
                        </span>
                        <span className="text-[11px] text-[#45474c]">{venue.hoursText}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="bg-[#eff4ff] text-[#0b1c30] px-3 py-1 rounded-md border border-[#dbe1ff]">
                        👥 {liveQueueSize} people waiting
                      </span>
                      <span className="bg-[#eff4ff] text-[#0b1c30] px-3 py-1 rounded-md border border-[#dbe1ff]">
                        ⏱ ~{venue.avgWaitMins} min wait
                      </span>
                      <span className="bg-[#eff4ff] text-[#0b1c30] px-3 py-1 rounded-md border border-[#dbe1ff]">
                        📍 {venue.distanceKm} km away
                      </span>
                      <span className="bg-[#eff4ff] text-[#0051d5] px-3 py-1 rounded-md font-semibold border border-[#dbe1ff]">
                        {venue.activeCountersText}
                      </span>
                    </div>
                  )}

                  {/* Capacity Indicator Card */}
                  <div className="bg-[#f8f9ff] p-3.5 sm:p-4 rounded-xl border border-[#dbe1ff] flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#0051d5] shadow-xs border border-[#dbe1ff]">
                          <span className="material-symbols-outlined text-[17px]">pie_chart</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#0b1c30]">Queue Capacity Indicator</span>
                          <span className="text-[11px] text-[#45474c] font-mono ml-1.5">
                            ({liveQueueSize} of {maxAllowedCapacity} max capacity)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeStyle}`}>
                          {statusBadgeText}
                        </span>
                        <span className={`font-headline-sm text-sm font-extrabold ${percentTextColor}`}>
                          {capacityPercent}% Filled
                        </span>
                      </div>
                    </div>

                    {/* Visual Meter Bar */}
                    <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-[#dbe1ff]/60 overflow-hidden p-0.5 border border-[#c0c6da]/40 shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 relative shadow-xs`}
                        style={{ width: `${Math.max(5, capacityPercent)}%` }}
                      >
                        <span className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/70 rounded-full animate-pulse"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#45474c] pt-0.5">
                      <span>
                        {spotsRemaining > 0 ? (
                          <span>
                            <strong className="text-[#0b1c30] font-semibold">{spotsRemaining} spots</strong> remaining before queue cap
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">Queue has reached maximum allowed capacity</span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-[#76777d]">
                        Cap: {maxAllowedCapacity} customers
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#f0f4ff]">
                    <div className="flex items-center gap-1 text-[#45474c] text-xs">
                      <span className="material-symbols-outlined text-[16px] text-[#0051d5]">location_on</span>
                      <span>{venue.address}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleQuickJoin(venue)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0051d5] text-white shadow-md hover:bg-[#316bf3] hover:shadow-lg transition-all"
                      >
                        <span>View Queue &amp; Join</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Explainer and Push Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* How Remote Queuing Works */}
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5 border border-[#dbe1ff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-[22px]">airline_seat_recline_extra</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-sm text-base text-[#0b1c30] font-extrabold">
                    How Remote Queuing Works
                  </h2>
                  <span className="font-mono text-xs text-[#0051d5] font-semibold">Zero-Wait Protocol</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#316bf3] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                    1
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0b1c30]">Select Venue &amp; Tap Join</span>
                    <span className="text-xs text-[#45474c] mt-0.5">
                      Choose your service lane, verify basic details, and claim your cryptographic queue token instantly.
                    </span>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-[#d3e4fe] ml-3.5 -my-1"></div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#d3e4fe] text-[#0051d5] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0b1c30]">Live Sync &amp; Free Movement</span>
                    <span className="text-xs text-[#45474c] mt-0.5">
                      Grab a coffee, work, or run errands while the live progress engine updates your position dynamically.
                    </span>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-[#d3e4fe] ml-3.5 -my-1"></div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#e5eeff] text-[#0b1c30] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0b1c30]">Head Over at &ldquo;Almost Ready&rdquo;</span>
                    <span className="text-xs text-[#45474c] mt-0.5">
                      Get a gentle push nudge 5-10 minutes before your number is called. Walk in right as your counter turns green.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex flex-col gap-1 border border-[#dbe1ff]">
                <div className="flex items-center gap-1.5 text-[#0051d5] font-bold text-xs uppercase">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Guaranteed Slot Retainment</span>
                </div>
                <p className="text-xs text-[#45474c]">
                  Need extra time on transit? Use the &ldquo;Delay 5 min&rdquo; slider without losing your general spot in line.
                </p>
              </div>
            </div>

            {/* Web Push Toggle */}
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-3 border border-[#dbe1ff]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#0051d5] text-[26px]">notifications_active</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0b1c30]">Web Push Notifications</span>
                  <span className="font-mono text-[10px] text-[#45474c]">No phone app required</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const perm = await notificationService.requestPermission();
                  setSubscribedPush(perm === 'granted');
                  if (perm === 'granted') {
                    notificationService.dispatchNotification(
                      '✅ Web Notifications Enabled',
                      'QueueLess will alert your device when you are 5 minutes away from your counter.',
                      'test'
                    );
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subscribedPush || notificationService.getPermission() === 'granted'
                    ? 'bg-[#0051d5] text-white shadow-sm'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dbe1ff]'
                }`}
              >
                {subscribedPush || notificationService.getPermission() === 'granted' ? 'Subscribed ✓' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
