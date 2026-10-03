export type QueueStatus = 'waiting' | 'serving' | 'completed' | 'no_show' | 'cancelled';

export interface QueueEntry {
  id: string;
  businessId: string;
  ticketNumber: number;
  customerName: string;
  customerPhone?: string;
  serviceType: string;
  status: QueueStatus;
  joinedAt: string; // e.g. "09:12 AM" or ISO
  joinedTimestamp: number;
  servedAt?: string;
  completedAt?: string;
  notifiedAt?: string;
  waitMinutesEstimated: number;
  notes?: string;
  isCurrentUser?: boolean;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface BusinessVenue {
  id: string;
  slug: string;
  name: string;
  category: 'healthcare' | 'salon' | 'banking' | 'civic' | 'food' | 'repair';
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  tag?: string;
  address: string;
  currentQueueSize: number;
  maxCapacity: number;
  avgWaitMins: number;
  distanceKm: number;
  transitTimeText: string;
  status: string;
  hoursText: string;
  laneCapacityPercent: number;
  laneCapacityText: string;
  activeCountersCount: number;
  activeCountersText: string;
  imageUrl?: string;
  deskRouting: string;
}

export interface AdminStats {
  waitingCount: number;
  servingTicketNumber: number;
  servingCustomerName: string;
  avgCycleTimeMinutes: number;
  completedTodayCount: number;
  noShowsCount: number;
  efficiencyPercent: number;
}
