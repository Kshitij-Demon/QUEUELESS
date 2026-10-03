import React, { useState } from 'react';
import { ActiveTab } from '../components/Header';
import { queueStore } from '../store/queueStore';

interface HomeHeroProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenJoinModal: () => void;
  onOpenLoginModal: () => void;
  isAdminLoggedIn?: boolean;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onTabChange,
  onOpenJoinModal,
  onOpenLoginModal,
  isAdminLoggedIn = false,
}) => {
  const [simProgress, setSimProgress] = useState(78);
  const [userTokenNumber, setUserTokenNumber] = useState(45);
  const [userWaitMins, setUserWaitMins] = useState(6);
  const [alertFired, setAlertFired] = useState(false);

  const handleHeroDelay = () => {
    setUserWaitMins((prev) => prev + 5);
    setAlertFired(true);
    setTimeout(() => setAlertFired(false), 2500);
  };

  const handleHeroLeave = () => {
    setUserTokenNumber(0);
    setAlertFired(true);
    setTimeout(() => setAlertFired(false), 2500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO VIEWPORT */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-10 lg:py-20 bg-[#f8f9ff]">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#0051d5]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-[#2fd9f4]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Copy & Conversions */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Live System Pill */}
            <div className="inline-flex items-center gap-2 bg-[#dce9ff] px-3.5 py-1.5 rounded-full w-fit shadow-sm border border-[#c0c6da]">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0051d5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0051d5]"></span>
              </span>
              <span className="font-mono text-xs text-[#0b1c30] font-semibold tracking-wide uppercase">
                Zero Physical Lines • Live Telemetry
              </span>
            </div>

            {/* Headline & Impact Statement */}
            <div className="flex flex-col gap-3">
              <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-[#0b1c30] font-extrabold tracking-tight leading-[1.1]">
                Your time shouldn't be spent <span className="text-[#0051d5]">waiting.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#45474c] max-w-xl leading-relaxed">
                Join queues remotely, track your position in real time, and arrive exactly when it's your turn.
              </p>
            </div>

            {/* Action Matrix */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenJoinModal}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-base font-bold bg-[#0051d5] text-white shadow-xl shadow-[#0051d5]/25 hover:shadow-2xl hover:shadow-[#0051d5]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
              >
                <span>Join a Queue</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
              <button
                onClick={isAdminLoggedIn ? () => onTabChange('admin-live-control') : onOpenLoginModal}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl text-base font-semibold bg-white text-[#0b1c30] shadow-sm hover:bg-[#eff4ff] hover:shadow-md transition-all border border-[#dbe1ff]"
              >
                <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                  {isAdminLoggedIn ? 'admin_panel_settings' : 'storefront'}
                </span>
                <span>{isAdminLoggedIn ? 'Open Admin Console' : "I'm a Business / Admin"}</span>
              </button>
            </div>

            {/* Social Proof Micro-row */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-[#45474c] text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0051d5] text-[18px]">verified</span>
                <span>Zero App Download</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0051d5] text-[18px]">speed</span>
                <span>Instant Socket Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0051d5] text-[18px]">notifications_active</span>
                <span>SMS &amp; Web Vibration</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D / Glossy Live Queue Card Representation */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#316bf3]/20 to-[#2fd9f4]/20 rounded-3xl blur-2xl -z-10"></div>

            {/* Floating Micro-Widget Top-Left: Average Wait */}
            <div className="absolute -top-5 -left-4 z-30 bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#dbe1ff] hidden sm:flex">
              <div className="w-8 h-8 rounded-xl bg-[#d3e4fe] flex items-center justify-center text-[#0051d5]">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
              </div>
              <div>
                <p className="text-[10px] text-[#45474c] uppercase tracking-wider font-bold">Pace Estimate</p>
                <p className="font-headline-sm text-sm font-bold text-[#0b1c30]">
                  Avg 4m <span className="text-xs font-normal text-[#76777d]">/ person</span>
                </p>
              </div>
            </div>

            {/* Floating Micro-Widget Bottom-Left */}
            <div className="absolute -bottom-6 -left-3 z-30 bg-[#151b2a] text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-cyan-400/30">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a2eeff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a2eeff]"></span>
              </span>
              <span className="font-mono text-[11px] text-white">Realtime sync active • 18ms</span>
            </div>

            {/* Floating Alert Banner (Hovering over the Card) */}
            <div className="absolute top-12 -right-4 z-30 bg-white px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-[#dbe1ff] animate-bounce [animation-duration:3s]">
              <span className="w-7 h-7 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#0051d5] font-bold text-sm">
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              </span>
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">Almost your turn!</p>
                <p className="text-[11px] text-[#45474c]">2 people ahead • Counter 3</p>
              </div>
            </div>

            {/* Main Glossy 3D Perspective Card */}
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#dbe1ff] hover:shadow-[0_25px_60px_-15px_rgba(0,81,213,0.3)] transition-all duration-500">
              {/* Card Header Chamber */}
              <div className="bg-[#151b2a] text-white p-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-[#0051d5]/30 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between pb-3 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#a2eeff] text-[20px]">stream</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#a2eeff] font-bold">
                      QueueLess Live Queue
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0051d5] text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                    Lane A
                  </span>
                </div>

                {/* Focus Item Token Display */}
                <div className="flex items-baseline justify-between relative z-10">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#dce9ff]/80 font-bold">
                      Your Assigned Ticket
                    </p>
                    <p className="font-queue-token text-5xl font-extrabold tracking-tight text-white">
                      #{userTokenNumber || '--'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-[#a2eeff] block font-bold">Estimated Arrival</span>
                    <span className="font-headline-md text-xl text-white font-bold">11:42 AM</span>
                  </div>
                </div>

                {/* Dynamic Progress Meter */}
                <div className="mt-4 w-full bg-white/15 h-2 rounded-full overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-[#316bf3] to-[#2fd9f4] h-full rounded-full transition-all duration-500"
                    style={{ width: `${simProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] font-mono text-[#dce9ff]/70">
                  <span>Token Created: 11:15 AM</span>
                  <span>Progression: {simProgress}%</span>
                </div>
              </div>

              {/* Queue Flow List */}
              <div className="p-5 flex flex-col gap-2 bg-white">
                {/* Entry 1: Served */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff] opacity-60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#dce9ff] flex items-center justify-center font-mono text-xs font-bold text-[#45474c]">
                      #42
                    </span>
                    <span className="text-xs text-[#0b1c30] line-through">Dr. Evans Room</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#45474c] font-bold">
                    Served
                  </span>
                </div>

                {/* Entry 2: Processing */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#dbe1ff] text-[#00174b] flex items-center justify-center font-mono text-xs font-bold">
                      #43
                    </span>
                    <span className="text-xs font-semibold text-[#0b1c30]">Station Counter 2</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#0051d5] text-white font-bold">
                    Processing
                  </span>
                </div>

                {/* Entry 3: Waiting Ahead */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#d3e4fe] text-[#0b1c30] flex items-center justify-center font-mono text-xs font-bold">
                      #44
                    </span>
                    <span className="text-xs text-[#0b1c30]">Waiting Ahead</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] font-bold">
                    1 Ahead
                  </span>
                </div>

                {/* Entry 4: Highlighted User Card */}
                {userTokenNumber > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#dbe1ff]/50 shadow-sm relative overflow-hidden border border-[#0051d5]/30">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0051d5]"></div>
                    <div className="flex items-center gap-2.5 pl-1">
                      <div className="w-9 h-9 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-mono text-sm font-extrabold shadow-md shadow-[#0051d5]/30">
                        #{userTokenNumber}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#0b1c30] flex items-center gap-1">
                          YOU
                          <span className="inline-block w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
                        </span>
                        <span className="text-xs text-[#0051d5] font-semibold">
                          Ready in ~{userWaitMins} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#0051d5] font-bold block">
                        Next Up
                      </span>
                      <span className="font-mono text-xs font-bold text-[#0b1c30]">Door B</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Shelf */}
              <div className="px-5 py-3 bg-[#eff4ff] flex items-center justify-between border-t border-[#dbe1ff]">
                <button
                  onClick={handleHeroDelay}
                  className="text-xs text-[#45474c] hover:text-[#0b1c30] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">more_time</span>
                  <span>Delay 5 mins</span>
                </button>
                <button
                  onClick={handleHeroLeave}
                  className="text-xs text-[#ba1a1a] font-semibold flex items-center gap-1 hover:underline transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>Leave Queue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE ANTHEM / KEY VALUE PROPOSITION BANNER */}
      <section className="w-full bg-[#151b2a] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0051d5]/15 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4 relative z-10">
          <span className="font-mono text-xs tracking-widest text-[#a2eeff] uppercase font-bold">
            The Autonomous Transit Promise
          </span>
          <h2 className="font-display-hero text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl">
            &ldquo;No queues. No waiting. Just your time.&rdquo;
          </h2>
          <p className="text-base sm:text-lg text-[#dce9ff]/80 max-w-2xl">
            Traditional waiting rooms drain 4.2 billion human hours globally every single year. QueueLess restores absolute sovereignty to how people spend every minute.
          </p>

          {/* Live Counter Matrix Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-6 max-w-4xl">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10">
              <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[#a2eeff] block">0 sec</span>
              <span className="text-xs sm:text-sm text-[#dce9ff]/70">Lobby Waiting</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10">
              <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[#dbe1ff] block">100%</span>
              <span className="text-xs sm:text-sm text-[#dce9ff]/70">Web Browser Native</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10">
              <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[#a2eeff] block">&lt; 34ms</span>
              <span className="text-xs sm:text-sm text-[#dce9ff]/70">Socket Latency</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl text-center border border-white/10">
              <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[#dbe1ff] block">42,000+</span>
              <span className="text-xs sm:text-sm text-[#dce9ff]/70">Hours Saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE BRAND PILLARS */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-xl">
              <span className="text-xs uppercase tracking-widest text-[#0051d5] font-bold">
                Architected for Speed
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-[#0b1c30] font-extrabold">
                Three simple touchpoints. Zero friction.
              </h2>
            </div>
            <p className="text-sm text-[#45474c] max-w-md">
              Engineered so your customers never feel glued to a chair or tethered to a physical service counter.
            </p>
          </div>

          {/* Bento-style 3 Pillar Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-[#e2e8f0]">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">fmd_good</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase text-[#0051d5] font-bold">Step 01</span>
                  <h3 className="font-headline-md text-xl font-bold text-[#0b1c30]">15m On-Site Check-in</h3>
                </div>
                <p className="text-sm text-[#45474c] leading-relaxed">
                  Arrive within 15 meters of the entrance counter to check in. On-site geofencing ensures only present customers hold queue positions.
                </p>
              </div>
              <div className="mt-6 p-4 bg-[#eff4ff] rounded-2xl flex items-center gap-3 border border-[#dbe1ff]">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#0051d5]">
                  <span className="material-symbols-outlined text-[22px]">touch_app</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0b1c30]">1-Tap Enrollment</span>
                  <span className="font-mono text-[11px] text-[#45474c]">Instant token generation</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-[#e2e8f0]">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#dbe1ff] flex items-center justify-center text-[#0051d5] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">radar</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase text-[#0051d5] font-bold">Step 02</span>
                  <h3 className="font-headline-md text-xl font-bold text-[#0b1c30]">Live Tracking</h3>
                </div>
                <p className="text-sm text-[#45474c] leading-relaxed">
                  Watch your ticket move forward in real time over resilient WebSocket backbones. Grab a coffee, shop nearby, or take a walk without refreshing the screen.
                </p>
              </div>
              <div className="mt-6 p-4 bg-[#eff4ff] rounded-2xl flex flex-col gap-2 border border-[#dbe1ff]">
                <div className="flex justify-between items-center font-mono text-xs text-[#0b1c30]">
                  <span>Lane velocity</span>
                  <span className="text-[#0051d5] font-bold">Active • 98.4%</span>
                </div>
                <svg className="w-full h-8 text-[#0051d5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 100 24">
                  <path d="M0 18 Q 20 22, 35 12 T 70 8 T 100 4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-[#e2e8f0]">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d3e4fe] flex items-center justify-center text-[#0051d5] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">alarm_on</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase text-[#0051d5] font-bold">Step 03</span>
                  <h3 className="font-headline-md text-xl font-bold text-[#0b1c30]">Arrive Exactly On Time</h3>
                </div>
                <p className="text-sm text-[#45474c] leading-relaxed">
                  QueueLess buzzes your device with haptic prompts and proactive SMS reminders at your custom threshold (e.g. 5 minutes away). Walk straight to the desk.
                </p>
              </div>
              <div className="mt-6 p-4 bg-[#0051d5] text-white rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">door_front</span>
                  <span className="text-xs font-bold">Proceed to Desk 04</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: 15-METER PROXIMITY GEOFENCE & PROTOCOL HIGHLIGHT */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#eff4ff] relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-[#0051d5] font-bold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>15-Meter Geofenced Check-In Protocol</span>
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-[#0b1c30] font-extrabold">
              Fair, On-Site Virtual Queuing
            </h2>
            <p className="text-sm sm:text-base text-[#45474c]">
              Queue bookings strictly require physical presence within 15 meters of the venue location, preventing phantom bookings and ensuring only arrived patrons take line spots.
            </p>
          </div>

          {/* Demonstration Layout: 15m Geofence Terminal & Flow Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 15-Meter On-Site Physical Proximity Radar Terminal */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden border border-[#dbe1ff]">
                <div className="absolute top-0 left-0 right-0 h-3 bg-[#0051d5]"></div>
                
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5] border border-[#dbe1ff]">
                    <span className="material-symbols-outlined text-[20px]">near_me</span>
                  </div>
                  <div className="text-left">
                    <span className="font-headline-sm text-base font-bold text-[#0b1c30] block">SmileCare Dental</span>
                    <span className="font-mono text-[10px] text-[#0051d5] font-semibold">15-Meter Proximity Gate</span>
                  </div>
                </div>

                <p className="text-xs text-[#45474c] pt-2 pb-4">
                  Queue bookings are strictly locked until your device is physically within 15 meters of the venue entrance.
                </p>

                {/* 15-Meter Radar Geofence Graphic */}
                <div className="bg-[#f8f9ff] p-5 rounded-2xl shadow-inner flex flex-col items-center gap-4 w-full border border-[#e2e8f0] relative overflow-hidden">
                  {/* Concentric Geofence Radar Rings */}
                  <div className="w-44 h-44 rounded-full bg-[#eff4ff] border-2 border-dashed border-[#0051d5]/40 flex items-center justify-center relative p-3">
                    {/* Ring 2 (Middle) */}
                    <div className="w-32 h-32 rounded-full border border-[#0051d5]/30 flex items-center justify-center relative">
                      {/* Pulse Wave */}
                      <div className="absolute inset-0 rounded-full bg-[#0051d5]/10 animate-ping [animation-duration:3s]"></div>
                      {/* Ring 3 (Inner 15m Zone) */}
                      <div className="w-20 h-20 rounded-full bg-[#0051d5]/15 border-2 border-[#0051d5] flex flex-col items-center justify-center relative shadow-sm">
                        <span className="material-symbols-outlined text-[#0051d5] text-[28px] animate-pulse">
                          location_on
                        </span>
                        <span className="font-mono text-[9px] font-black text-[#0051d5] uppercase tracking-tighter">
                          &lt; 15m
                        </span>
                      </div>
                    </div>

                    {/* Perimeter Tag */}
                    <span className="absolute -top-2 bg-[#0051d5] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                      15-Meter Perimeter
                    </span>
                  </div>

                  {/* Geofence Status Pill */}
                  <div className="w-full bg-white p-2.5 rounded-xl border border-[#dbe1ff] flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Geofence Lock Active</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded">
                      GPS / Wi-Fi Guard
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2 w-full flex items-center justify-between text-[#45474c] text-xs uppercase tracking-wider font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>Zero Ghost Queues</span>
                  </span>
                  <span className="text-[#0051d5]">Entrance Stand #01</span>
                </div>
              </div>
            </div>

            {/* Right: Flow Diagram & Journey Walkthrough */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[#0051d5] font-bold">
                  The Zero-Waiting Protocol
                </span>
                <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-[#0b1c30]">
                  Arrive &rarr; Roam &rarr; Arrive Ready
                </h3>
              </div>

              {/* Step-by-Step Flow Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#e2e8f0]">
                  <div className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex-shrink-0 flex items-center justify-center font-headline-sm text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm font-bold text-[#0b1c30]">Arrive at Venue (&lt; 15m)</p>
                    <p className="text-xs text-[#45474c] pt-0.5">Physical presence under 15 meters unlocks queue booking automatically.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#e2e8f0]">
                  <div className="w-9 h-9 rounded-xl bg-[#d3e4fe] text-[#0051d5] flex-shrink-0 flex items-center justify-center font-headline-sm text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm font-bold text-[#0b1c30]">Instant Token Dispatch</p>
                    <p className="text-xs text-[#45474c] pt-0.5">Assigned token #45 with live ETA recalculated dynamically per patient.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#e2e8f0]">
                  <div className="w-9 h-9 rounded-xl bg-[#d3e4fe] text-[#0051d5] flex-shrink-0 flex items-center justify-center font-headline-sm text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm font-bold text-[#0b1c30]">Put Phone in Pocket &amp; Roam</p>
                    <p className="text-xs text-[#45474c] pt-0.5">Walk outdoors or sip an espresso nearby. No anxiety of losing your spot.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#e2e8f0]">
                  <div className="w-9 h-9 rounded-xl bg-[#316bf3] text-white flex-shrink-0 flex items-center justify-center font-headline-sm text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-headline-sm text-sm font-bold text-[#0b1c30]">Phone Chimes 'Your Turn!'</p>
                    <p className="text-xs text-[#45474c] pt-0.5">Sound, SMS vibration, and counter routing prompt your step into clinic.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SCALABLE INFRASTRUCTURE SECTOR PREVIEW */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[#0051d5] font-bold">
                Scalable Infrastructure
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-[#0b1c30] font-extrabold">
                Powering High-Volume Service Venues
              </h2>
            </div>
            <p className="text-sm text-[#45474c] max-w-sm">
              Deployed across critical civilian touchpoints, healthcare clinics, and commercial retail lanes.
            </p>
          </div>

          {/* Sector Mosaic Grid (5 Sectors) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Sector 1: Dental */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0]">
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Dental & Clinics"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV4U33DnzAXS7nEfbK8e_3KlFvB3TSfxn1q8yi3bNz2eGQ_w1PeFl_i965aDPx4tpXU2iwsqkAHwgn23KFT4K_jcwlJ4hCWLRj-ork7d7Ao-E1n-VTS2ZE6onihoXPyNg4YqWiA3FbO_0EykqkQfNKbMHxpMtHwYp2CQ3rV4JmnapjR6t4ih4pnwGXeWEzLuyMEJHipQSUohhJ6mSu_a0FqFuT7AuIqTRtc0_QlAp3KCKGaTa6mwvd"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2a]/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white text-[#0b1c30] text-[10px] uppercase font-bold">
                  Healthcare
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-grow justify-between">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">Dental &amp; Clinics</h4>
                  <p className="text-xs text-[#45474c] pt-1">Eliminates crowded sick waiting rooms and airborne cross-exposure.</p>
                </div>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#0051d5] font-semibold border-t border-[#eff4ff]">
                  <span>Wait reduction</span>
                  <span>-82%</span>
                </div>
              </div>
            </div>

            {/* Sector 2: Salons */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0]">
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Salons & Barbers"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV0tBOETK95D78d2AoIlnmWxEmdpwMHrrKn7M0q0JKCM_c8j92Quz9m9KjwoOOKrETWWMkuQyf2hj9O97NWJDw-F9mCJjxgSw9Xmg6TiIBPEMdL_y_W2QvPY45hM6WEhoaMSYTwneWwhUCIoSchfa9e_BJPmNL3_VCkzvLVBWlAsk3A_2ASCuSwz-DTXAx0zlN-m4-WXy9x7mZuhfcFTZUOwYrQnooFQcJwN_tzVOZbty6nUqqff8D"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2a]/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white text-[#0b1c30] text-[10px] uppercase font-bold">
                  Personal Care
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-grow justify-between">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">Salons &amp; Barbers</h4>
                  <p className="text-xs text-[#45474c] pt-1">Clients browse nearby retail rather than clogging reception seats.</p>
                </div>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#0051d5] font-semibold border-t border-[#eff4ff]">
                  <span>Seat turnover</span>
                  <span>+34%</span>
                </div>
              </div>
            </div>

            {/* Sector 3: Banking */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0]">
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Bank Branches"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwEUzMoNfwjI47NVm2rrPeiAdCiXHM7uByPkHbm1rghM6nqdKwZsavJfJiuvU_g4B8U15RaLB7qD-cKMkSUnAv5Q8prYX6M_IQNJnTL910x0tfvO07lvPQeKFZl1zzXi3ovNJLo5445R1upR6Mnpb5Ud8IQn_1kDEqXUv8TpzRnvWtNhbbGnjuazZszMdOeCE1eS1S7biUVZ1hsA9KyoMKxNlDyONU9nsMR1BN7xhwET1c3vIEL8aI"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2a]/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white text-[#0b1c30] text-[10px] uppercase font-bold">
                  Financial
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-grow justify-between">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">Bank Branches</h4>
                  <p className="text-xs text-[#45474c] pt-1">Prioritize private wealth appointments and teller transfers gracefully.</p>
                </div>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#0051d5] font-semibold border-t border-[#eff4ff]">
                  <span>SLA Target</span>
                  <span>99.8%</span>
                </div>
              </div>
            </div>

            {/* Sector 4: Government DMVs */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0]">
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Government DMVs"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2lDRyFstowlyuTAcrbEpXE04RRbfIK-oFXxxKrbYfnbKgOPDn5WHUu0Rvh34WMg0vyhwHdUgk9e2fEKBhtT0hLRfT8oLtVNuTerEcza8Nv44fMrhHUHlLOG7BoqglcWfgKV20fdye8nTXoTNQgSI3X27_NiJEQUmeRGiJDKT3dXuUtbbE5yp3bNPO6_qkK8nX2IZmFge1NBhIsnZb1rOtL6e7Hgj1dyO34rsAXHSU-XiC8iNzqI8L"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2a]/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white text-[#0b1c30] text-[10px] uppercase font-bold">
                  Civic Desks
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-grow justify-between">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">Government DMVs</h4>
                  <p className="text-xs text-[#45474c] pt-1">Transform bureaucratic gridlock into frictionless citizen transit.</p>
                </div>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#0051d5] font-semibold border-t border-[#eff4ff]">
                  <span>Civic NPS</span>
                  <span>+68 pts</span>
                </div>
              </div>
            </div>

            {/* Sector 5: Hospitality */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0]">
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Gourmet Eateries"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMXXC04jc_lBQ7xqxNyIo0ptpGL2JFyvq5Cj3xmBDjww6LpFMYNjFDaPjYvsepbn-smUa7JUvxGCjs4I3SwGRiY7S32YqsiH_D9zvHa2suvbLrzNt19GFpzSpCTAZsl-pprFhFI0GXs5-P3SJaIOc4SEfspaFCGqK5nuLTvkBOllkcvMMtyavDwRwJHZJQs-tFjzU59hJMQ1N9sDUkJZO4FpptAx8dC3wZN5iEQGeXI2bZ0cTCyCLT"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2a]/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white text-[#0b1c30] text-[10px] uppercase font-bold">
                  Hospitality
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-grow justify-between">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">Gourmet Eateries</h4>
                  <p className="text-xs text-[#45474c] pt-1">Prevent host-stand bottlenecks and walkaways during peak dinner rushes.</p>
                </div>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#0051d5] font-semibold border-t border-[#eff4ff]">
                  <span>No-shows</span>
                  <span>&lt; 1.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CONVERSION WRAPPER BANNER */}
      <section className="w-full pb-16 px-4 sm:px-6 lg:px-8 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto bg-[#151b2a] text-white rounded-3xl p-8 sm:p-14 lg:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-cyan-400/20 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0051d5]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col gap-2 max-w-xl relative z-10 text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[#a2eeff] font-bold">
              Deploy in 3 Minutes
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Ready to eliminate waiting from your customer experience?
            </h2>
            <p className="text-sm sm:text-base text-[#dce9ff]/80">
              Ensure fair queue booking with 15-meter on-site geofencing and zero physical lobby congestion.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
            <button
              onClick={onOpenJoinModal}
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl font-headline-sm text-sm font-bold bg-[#0051d5] text-white shadow-xl shadow-[#0051d5]/30 hover:bg-[#316bf3] transition-all"
            >
              Join a Queue Now
            </button>
            <button
              onClick={isAdminLoggedIn ? () => onTabChange('admin-live-control') : onOpenLoginModal}
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl font-headline-sm text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
            >
              {isAdminLoggedIn ? 'Operator Console' : 'Operator Sign In'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
