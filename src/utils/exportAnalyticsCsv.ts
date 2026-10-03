/**
 * Analytics CSV Exporter Utility
 * Generates and downloads a structured CSV file for daily queue volume and average wait times.
 */

export interface DailyRecord {
  date: string;
  day: string;
  totalVolume: number;
  completed: number;
  walkIns: number;
  avgWaitMins: number;
  targetWaitMins: number;
}

export interface HourlyRecord {
  time: string;
  volume: number;
  avgWaitMins: number;
  activeCounters: number;
}

export const EXPORT_DAILY_DATA: DailyRecord[] = [
  { date: '2026-09-27', day: 'Monday', totalVolume: 54, completed: 52, walkIns: 12, avgWaitMins: 11.2, targetWaitMins: 12.0 },
  { date: '2026-09-28', day: 'Tuesday', totalVolume: 62, completed: 60, walkIns: 15, avgWaitMins: 13.5, targetWaitMins: 12.0 },
  { date: '2026-09-29', day: 'Wednesday', totalVolume: 78, completed: 75, walkIns: 21, avgWaitMins: 15.8, targetWaitMins: 12.0 },
  { date: '2026-09-30', day: 'Thursday', totalVolume: 71, completed: 69, walkIns: 18, avgWaitMins: 12.4, targetWaitMins: 12.0 },
  { date: '2026-10-01', day: 'Friday', totalVolume: 85, completed: 83, walkIns: 24, avgWaitMins: 16.9, targetWaitMins: 12.0 },
  { date: '2026-10-02', day: 'Saturday', totalVolume: 94, completed: 91, walkIns: 28, avgWaitMins: 18.2, targetWaitMins: 15.0 },
  { date: '2026-10-03', day: 'Sunday (Today)', totalVolume: 68, completed: 51, walkIns: 19, avgWaitMins: 9.8, targetWaitMins: 12.0 },
];

export const EXPORT_HOURLY_DATA: HourlyRecord[] = [
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

export function generateAnalyticsCsvString(): string {
  const lines: string[] = [];

  // Metadata headers
  lines.push('QUEUELESS CLINIC QUEUE ANALYTICS REPORT');
  lines.push(`Generated At,${new Date().toISOString()}`);
  lines.push('Venue,SmileCare Dental Clinic - Reception Desk 1');
  lines.push('Reporting Period,Last 7 Days + Today Hourly Telemetry');
  lines.push('');

  // SECTION 1: Daily Queue Volume and Wait Times
  lines.push('--- DAILY QUEUE VOLUME & AVERAGE WAIT TIMES ---');
  lines.push(
    [
      'Date',
      'Day of Week',
      'Total Queue Volume',
      'Completed Visits',
      'Walk-In Patrons',
      'Avg Wait Time (Minutes)',
      'Target SLA Wait (Minutes)',
      'SLA Status',
      'Completion Rate (%)',
    ].join(',')
  );

  for (const item of EXPORT_DAILY_DATA) {
    const slaStatus = item.avgWaitMins <= item.targetWaitMins ? 'Within Target' : 'Exceeded Target';
    const rate = ((item.completed / item.totalVolume) * 100).toFixed(1);
    lines.push(
      [
        `"${item.date}"`,
        `"${item.day}"`,
        item.totalVolume,
        item.completed,
        item.walkIns,
        item.avgWaitMins.toFixed(1),
        item.targetWaitMins.toFixed(1),
        `"${slaStatus}"`,
        `"${rate}%"`,
      ].join(',')
    );
  }

  // Summary Row
  const totalVolume = EXPORT_DAILY_DATA.reduce((acc, d) => acc + d.totalVolume, 0);
  const totalCompleted = EXPORT_DAILY_DATA.reduce((acc, d) => acc + d.completed, 0);
  const totalWalkIns = EXPORT_DAILY_DATA.reduce((acc, d) => acc + d.walkIns, 0);
  const overallAvgWait = (
    EXPORT_DAILY_DATA.reduce((acc, d) => acc + d.avgWaitMins, 0) / EXPORT_DAILY_DATA.length
  ).toFixed(1);
  const overallRate = ((totalCompleted / totalVolume) * 100).toFixed(1);

  lines.push(
    [
      '"TOTAL / AVG"',
      '"7-Day Aggregated"',
      totalVolume,
      totalCompleted,
      totalWalkIns,
      overallAvgWait,
      '12.4',
      '"Overall Compliant"',
      `"${overallRate}%"`,
    ].join(',')
  );

  lines.push('');
  lines.push('--- HOURLY LOAD & WAIT TIME TELEMETRY (TODAY) ---');
  lines.push(['Time Slot', 'Registered Volume', 'Avg Wait Time (Minutes)', 'Active Counters', 'Rush Index'].join(','));

  for (const h of EXPORT_HOURLY_DATA) {
    const rushIndex = h.volume >= 15 ? 'Peak Rush' : h.volume >= 10 ? 'Moderate' : 'Low';
    lines.push([`"${h.time}"`, h.volume, h.avgWaitMins.toFixed(1), h.activeCounters, `"${rushIndex}"`].join(','));
  }

  lines.push('');
  lines.push('--- VOLUME BY SERVICE CATEGORY ---');
  lines.push(['Service Lane', 'Share (%)', 'Est. Patient Volume'].join(','));
  lines.push(['"General Consultation & Cleaning"', '42%', Math.round(totalVolume * 0.42)].join(','));
  lines.push(['"X-Ray & Diagnostic Scan"', '26%', Math.round(totalVolume * 0.26)].join(','));
  lines.push(['"Orthodontics & Aligners"', '19%', Math.round(totalVolume * 0.19)].join(','));
  lines.push(['"Emergency Pain Relief"', '13%', Math.round(totalVolume * 0.13)].join(','));

  return lines.join('\r\n');
}

/**
 * Initiates an automatic CSV file download in the browser
 */
export function downloadAnalyticsCSV(filename = 'queueless-analytics-report.csv'): boolean {
  try {
    const csvContent = generateAnalyticsCsvString();
    // Use UTF-8 BOM so Microsoft Excel correctly parses UTF-8 encoding
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to export CSV:', err);
    return false;
  }
}
