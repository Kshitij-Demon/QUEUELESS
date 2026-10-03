import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { downloadAnalyticsCSV } from '../utils/exportAnalyticsCsv';

interface DailyVolumePoint {
  date: string;
  day: string;
  totalVolume: number;
  completed: number;
  walkIns: number;
  avgWaitMins: number;
  targetWaitMins: number;
}

interface HourlyPoint {
  time: string;
  volume: number;
  avgWaitMins: number;
  activeCounters: number;
}

const DAILY_DATA: DailyVolumePoint[] = [
  { date: 'Sep 27', day: 'Mon', totalVolume: 54, completed: 52, walkIns: 12, avgWaitMins: 11.2, targetWaitMins: 12 },
  { date: 'Sep 28', day: 'Tue', totalVolume: 62, completed: 60, walkIns: 15, avgWaitMins: 13.5, targetWaitMins: 12 },
  { date: 'Sep 29', day: 'Wed', totalVolume: 78, completed: 75, walkIns: 21, avgWaitMins: 15.8, targetWaitMins: 12 },
  { date: 'Sep 30', day: 'Thu', totalVolume: 71, completed: 69, walkIns: 18, avgWaitMins: 12.4, targetWaitMins: 12 },
  { date: 'Oct 01', day: 'Fri', totalVolume: 85, completed: 83, walkIns: 24, avgWaitMins: 16.9, targetWaitMins: 12 },
  { date: 'Oct 02', day: 'Sat', totalVolume: 94, completed: 91, walkIns: 28, avgWaitMins: 18.2, targetWaitMins: 15 },
  { date: 'Oct 03', day: 'Today', totalVolume: 68, completed: 51, walkIns: 19, avgWaitMins: 9.8, targetWaitMins: 12 },
];

const HOURLY_DATA: HourlyPoint[] = [
  { time: '08:00', volume: 5, avgWaitMins: 4.2, activeCounters: 2 },
  { time: '09:00', volume: 9, avgWaitMins: 6.8, activeCounters: 3 },
  { time: '10:00', volume: 15, avgWaitMins: 13.5, activeCounters: 4 },
  { time: '11:00', volume: 18, avgWaitMins: 17.2, activeCounters: 4 },
  { time: '12:00', volume: 11, avgWaitMins: 11.0, activeCounters: 3 },
  { time: '13:00', volume: 7, avgWaitMins: 6.5, activeCounters: 2 },
  { time: '14:00', volume: 14, avgWaitMins: 12.8, activeCounters: 4 },
  { time: '15:00', volume: 16, avgWaitMins: 15.4, activeCounters: 4 },
  { time: '16:00', volume: 10, avgWaitMins: 9.6, activeCounters: 3 },
  { time: '17:00', volume: 6, avgWaitMins: 5.1, activeCounters: 2 },
];

const SERVICE_DISTRIBUTION = [
  { name: 'General Consultation & Cleaning', value: 42, color: '#0051d5' },
  { name: 'X-Ray & Diagnostic Scan', value: 26, color: '#316bf3' },
  { name: 'Orthodontics & Aligners', value: 19, color: '#2fd9f4' },
  { name: 'Emergency Pain Relief', value: 13, color: '#f59e0b' },
];

interface AnalyticsOverviewProps {
  onBackToDispatch?: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ onBackToDispatch }) => {
  const [timeRange, setTimeRange] = useState<'7d' | 'hourly'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'volume' | 'waittime'>('both');
  const [exportToast, setExportToast] = useState<string | null>(null);

  const handleExportData = () => {
    const today = new Date().toISOString().split('T')[0];
    const ok = downloadAnalyticsCSV(`smilecare-queue-analytics-${today}.csv`);
    if (ok) {
      setExportToast('Analytics CSV exported and downloaded successfully!');
      setTimeout(() => setExportToast(null), 3500);
    }
  };

  // Key KPI metrics
  const todayStats = DAILY_DATA[DAILY_DATA.length - 1];
  const weeklyTotalVolume = DAILY_DATA.reduce((acc, d) => acc + d.totalVolume, 0);
  const weeklyAvgWait = (
    DAILY_DATA.reduce((acc, d) => acc + d.avgWaitMins, 0) / DAILY_DATA.length
  ).toFixed(1);
  const completionRate = (
    (DAILY_DATA.reduce((acc, d) => acc + d.completed, 0) / weeklyTotalVolume) *
    100
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-[#151b2a] text-[#dce9ff] p-6 rounded-3xl shadow-xl border border-cyan-400/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#0051d5]/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0051d5] flex items-center justify-center text-white shadow-md shadow-[#0051d5]/40 flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-xl sm:text-2xl text-white font-extrabold tracking-tight">
                Analytics Overview
              </h2>
              <span className="font-mono text-xs text-[#a2eeff] bg-[#0051d5]/40 px-2 py-0.5 rounded border border-[#a2eeff]/30">
                DAILY &amp; HOURLY TELEMETRY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#dce9ff]/80 mt-1">
              Live tracking of queue volume throughput, bottleneck detection, and average patient wait times.
            </p>
          </div>
        </div>

        {/* Action matrix */}
        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <div className="bg-white/10 p-1 rounded-xl flex items-center border border-white/10 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === '7d'
                  ? 'bg-[#0051d5] text-white shadow-sm'
                  : 'text-[#dce9ff] hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('hourly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'hourly'
                  ? 'bg-[#0051d5] text-white shadow-sm'
                  : 'text-[#dce9ff] hover:text-white'
              }`}
            >
              Today Hourly
            </button>
          </div>

          <button
            onClick={handleExportData}
            title="Download Daily Queue Volume & Wait Time Analytics as CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-emerald-400/40"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Data</span>
          </button>

          {onBackToDispatch && (
            <button
              onClick={onBackToDispatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#0b1c30] text-xs font-bold hover:bg-[#eff4ff] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0051d5]">view_kanban</span>
              <span>Back to Desk Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Export Feedback Toast */}
      {exportToast && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400/50 flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-emerald-200">file_download_done</span>
            <span>{exportToast}</span>
          </div>
          <button onClick={() => setExportToast(null)} className="text-white/80 hover:text-white ml-4">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today Queue Volume */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbe1ff] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
              Today Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-3xl font-extrabold text-[#0b1c30]">
                {todayStats.totalVolume}
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +14% vs avg
              </span>
            </div>
            <span className="text-[11px] text-[#45474c] mt-0.5 block">
              {todayStats.completed} completed • {todayStats.walkIns} walk-ins
            </span>
          </div>
        </div>

        {/* KPI 2: Today Average Wait Time */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbe1ff] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
              Avg Wait Time (Today)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-3xl font-extrabold text-[#0051d5]">
                {todayStats.avgWaitMins}m
              </span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Under Target (12m)
              </span>
            </div>
            <span className="text-[11px] text-[#45474c] mt-0.5 block">
              Target SLA: ≤ 12 minutes per client
            </span>
          </div>
        </div>

        {/* KPI 3: 7-Day Total Served */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbe1ff] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
              7-Day Total Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-3xl font-extrabold text-[#0b1c30]">
                {weeklyTotalVolume}
              </span>
              <span className="text-xs font-mono text-[#0051d5] font-bold">patrons</span>
            </div>
            <span className="text-[11px] text-[#45474c] mt-0.5 block">
              Weekly Avg Wait: <strong>{weeklyAvgWait} mins</strong>
            </span>
          </div>
        </div>

        {/* KPI 4: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbe1ff] shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#76777d] uppercase tracking-wider">
              Desk SLA Completion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-3xl font-extrabold text-emerald-600">
                {completionRate}%
              </span>
              <span className="text-xs font-bold text-emerald-700">Exceptional</span>
            </div>
            <span className="text-[11px] text-[#45474c] mt-0.5 block">
              &lt; 2.8% cancellation / drop-off rate
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Daily Queue Volume and Wait Times */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-[#dbe1ff] shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
            <div>
              <h3 className="font-headline-sm text-base sm:text-lg font-bold text-[#0b1c30]">
                {timeRange === '7d' ? 'Daily Queue Volume & Average Wait Times' : 'Today Hourly Volume & Wait Times'}
              </h3>
              <p className="text-xs text-[#45474c] mt-0.5">
                Comparison of daily patient registrations and average waiting duration (minutes)
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setSelectedMetric('both')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'both'
                    ? 'bg-[#0051d5] text-white'
                    : 'bg-[#eff4ff] text-[#45474c] hover:bg-[#dbe1ff]'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setSelectedMetric('volume')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'volume'
                    ? 'bg-[#0051d5] text-white'
                    : 'bg-[#eff4ff] text-[#45474c] hover:bg-[#dbe1ff]'
                }`}
              >
                Volume Only
              </button>
              <button
                onClick={() => setSelectedMetric('waittime')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === 'waittime'
                    ? 'bg-[#0051d5] text-white'
                    : 'bg-[#eff4ff] text-[#45474c] hover:bg-[#dbe1ff]'
                }`}
              >
                Wait Time
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-80 sm:h-96 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {timeRange === '7d' ? (
                <AreaChart
                  data={DAILY_DATA}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0051d5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0051d5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="waitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#45474c', fontSize: 12, fontWeight: 600 }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#0051d5', fontSize: 11 }}
                    stroke="#cbd5e1"
                    label={{ value: 'Queue Volume', angle: -90, position: 'insideLeft', fill: '#0051d5', fontSize: 10, offset: 15 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#d97706', fontSize: 11 }}
                    stroke="#cbd5e1"
                    label={{ value: 'Wait Time (mins)', angle: 90, position: 'insideRight', fill: '#d97706', fontSize: 10, offset: 15 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151b2a',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid #316bf3',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Daily Queue Volume') return [`${value} patients`, name];
                      if (name === 'Avg Wait Time') return [`${value} mins`, name];
                      if (name === 'Target SLA Wait') return [`${value} mins`, name];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

                  {(selectedMetric === 'both' || selectedMetric === 'volume') && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalVolume"
                      name="Daily Queue Volume"
                      stroke="#0051d5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#volumeGradient)"
                    />
                  )}

                  {(selectedMetric === 'both' || selectedMetric === 'waittime') && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgWaitMins"
                      name="Avg Wait Time"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#waitGradient)"
                    />
                  )}

                  {selectedMetric === 'both' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="targetWaitMins"
                      name="Target SLA Wait"
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </AreaChart>
              ) : (
                <BarChart
                  data={HOURLY_DATA}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#45474c', fontSize: 11, fontWeight: 600 }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#0051d5', fontSize: 11 }}
                    stroke="#cbd5e1"
                    label={{ value: 'Hourly Volume', angle: -90, position: 'insideLeft', fill: '#0051d5', fontSize: 10, offset: 15 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#d97706', fontSize: 11 }}
                    stroke="#cbd5e1"
                    label={{ value: 'Wait Time (mins)', angle: 90, position: 'insideRight', fill: '#d97706', fontSize: 10, offset: 15 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151b2a',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid #316bf3',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

                  {(selectedMetric === 'both' || selectedMetric === 'volume') && (
                    <Bar
                      yAxisId="left"
                      dataKey="volume"
                      name="Patients Registered"
                      fill="#0051d5"
                      radius={[6, 6, 0, 0]}
                    />
                  )}

                  {(selectedMetric === 'both' || selectedMetric === 'waittime') && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgWaitMins"
                      name="Avg Wait (Minutes)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f59e0b' }}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Service Distribution & Chamber Efficiency */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Service Volume Breakdown Pie Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#dbe1ff] shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-[#0b1c30]">
                Volume by Service Category
              </h3>
              <p className="text-xs text-[#45474c] mt-0.5">
                Proportion of queue load across clinic departments
              </p>
            </div>

            <div className="w-full h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SERVICE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {SERVICE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151b2a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => [`${value}% of total visits`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 pt-1 border-t border-[#f0f4ff]">
              {SERVICE_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[#0b1c30] font-medium truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0051d5]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Performance Card */}
          <div className="bg-gradient-to-br from-[#eff4ff] to-[#dbe1ff]/60 p-5 rounded-3xl border border-[#dbe1ff] flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0051d5] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-[#0b1c30]">
                  Queue SLA Guarantee
                </h4>
                <span className="text-[11px] text-[#0051d5] font-semibold">Real-time Desk Benchmark</span>
              </div>
            </div>

            <p className="text-xs text-[#45474c] leading-relaxed">
              94.6% of today&apos;s patients were summoned within <strong>15 minutes</strong> of registration, outperforming clinic target by <strong>2.6 minutes</strong>.
            </p>

            <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#c0c6da]/50">
              <span className="text-[#45474c]">Target Wait Time</span>
              <span className="font-bold text-[#0b1c30]">12.0 mins</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#45474c]">Current Avg Wait</span>
              <span className="font-bold text-emerald-600">9.8 mins ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
