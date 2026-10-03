import { BusinessVenue, QueueEntry } from '../types/queue';
import { soundManager } from '../utils/audio';
import { notificationService } from '../utils/notifications';

const STORAGE_KEY = 'queueless_state_v1';
const BROADCAST_CHANNEL = 'queueless_realtime_sync';

export interface AppState {
  stepCount: number;
  activeChamberSessionSeconds: number;
  servingTicket: QueueEntry | null;
  waitingQueue: QueueEntry[];
  completedTodayCount: number;
  noShowsCount: number;
  userTicket: QueueEntry | null;
  isQueueClosed: boolean;
  chimeEnabled: boolean;
  autoDispatchActive: boolean;
  lastBroadcastMessage: string | null;
  lastEventDescription: string;
  networkLatencyMs: number;
}

const INITIAL_SERVING: QueueEntry = {
  id: 't-42',
  businessId: 'smilecare',
  ticketNumber: 42,
  customerName: 'Rahul Verma',
  serviceType: 'General Oral Examination & Cleaning',
  status: 'serving',
  joinedAt: '09:08 AM',
  joinedTimestamp: Date.now() - 258000,
  waitMinutesEstimated: 0,
};

const INITIAL_WAITING: QueueEntry[] = [
  {
    id: 't-43',
    businessId: 'smilecare',
    ticketNumber: 43,
    customerName: 'Priya Sharma',
    customerPhone: '+91 •••• ••8912',
    serviceType: 'General Cleaning / Teeth Cleaning',
    status: 'waiting',
    joinedAt: '09:10 AM',
    joinedTimestamp: Date.now() - 180000,
    waitMinutesEstimated: 2,
  },
  {
    id: 't-44',
    businessId: 'smilecare',
    ticketNumber: 44,
    customerName: 'Amit Patel',
    customerPhone: '+91 •••• ••2301',
    serviceType: 'X-Ray Diagnostics / Root Canal',
    status: 'waiting',
    joinedAt: '09:12 AM',
    joinedTimestamp: Date.now() - 120000,
    waitMinutesEstimated: 6,
    isCurrentUser: true,
  },
  {
    id: 't-45',
    businessId: 'smilecare',
    ticketNumber: 45,
    customerName: 'Sneha Roy',
    customerPhone: '+91 •••• ••5549',
    serviceType: 'Orthodontics Review / X-Ray',
    status: 'waiting',
    joinedAt: '09:15 AM',
    joinedTimestamp: Date.now() - 90000,
    waitMinutesEstimated: 10,
  },
  {
    id: 't-46',
    businessId: 'smilecare',
    ticketNumber: 46,
    customerName: 'Vikram Singh',
    customerPhone: '+91 •••• ••7781',
    serviceType: 'Implant Assessment / Orthodontic',
    status: 'waiting',
    joinedAt: '09:18 AM',
    joinedTimestamp: Date.now() - 60000,
    waitMinutesEstimated: 14,
  },
  {
    id: 't-47',
    businessId: 'smilecare',
    ticketNumber: 47,
    customerName: 'Daniel Cho',
    customerPhone: '+91 •••• ••4110',
    serviceType: 'Dental Hygiene',
    status: 'waiting',
    joinedAt: '09:22 AM',
    joinedTimestamp: Date.now() - 30000,
    waitMinutesEstimated: 18,
  },
];

export const INITIAL_VENUES: BusinessVenue[] = [
  {
    id: 'smilecare',
    slug: 'smilecare-dental',
    name: 'SmileCare Dental Clinic',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Clinics',
    rating: 4.9,
    reviewsCount: 180,
    tag: 'Fast Lane',
    address: '402 St. Vincent Blvd, Medical Center Fl 3',
    currentQueueSize: 12,
    maxCapacity: 20,
    avgWaitMins: 35,
    distanceKm: 1.2,
    transitTimeText: '4 min transit',
    status: 'Open',
    hoursText: 'Closes 8:00 PM',
    laneCapacityPercent: 58,
    laneCapacityText: 'Moderate Flow',
    activeCountersCount: 7,
    activeCountersText: '7 active operator suites',
    deskRouting: 'General consults, emergency pain triage',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIjnWgba0RGxtEaiFBlXWiwG1N5LVZiKoBHM__6e-yGrVmIzrwdjnHIs6L5im2vVSYkT6Htc1FtN6R7sfASXPz33NFKuq-IobkP1-wRqeoH7EqjINGf-hKIhK1e20L7cgCBJD-HTAqNv67QttYs-aC3Tzuy-Jed-8mBd_DiOF-0Fyl4UrM_V7VVgbb0RWkoeZyrq7W0K8N_AZiXV9mfmCbLk4syX9xJRelMYJgfEC71iUt9iZj5W9G',
  },
  {
    id: 'apex-metro',
    slug: 'apex-metro-bank',
    name: 'Apex Metro Bank - Downtown Branch',
    category: 'banking',
    categoryLabel: 'Banking & Finance',
    rating: 4.8,
    reviewsCount: 94,
    address: '120 Financial Plaza, Counter Suite A',
    currentQueueSize: 6,
    maxCapacity: 15,
    avgWaitMins: 14,
    distanceKm: 0.8,
    transitTimeText: '3 min transit',
    status: 'Open',
    hoursText: 'Closes 5:00 PM',
    laneCapacityPercent: 35,
    laneCapacityText: 'Light Flow',
    activeCountersCount: 4,
    activeCountersText: '4 Counters Active',
    deskRouting: 'Desk Routing: Teller Services • Loan Advisory • KYC Verification',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo8wqZ3Xr3t_yQGVRpPl9CVCIybWY7THXxVxoYBC8UPJTSOmeNkPBvxXe1zT2oysZIrri_96Vj-r6qKws_JJkbzeMVIm6AgN1ZTCCtdIcymLwOKkUWH7B9ChG0W48eBw3zOhfD52U1ua2F2cIlHQhquMvr94Ov2MvvxYm6J7o6E4BlGShsZbAjSlTxpInGR6fx5mGUnDqh1WrqbHC3WG9Nd54jstgmLw_ZET9uXp7D9EIx233EhWsE',
  },
  {
    id: 'luxe-studio',
    slug: 'luxe-studio-hair',
    name: 'Luxe Studio Hair & Esthetics',
    category: 'salon',
    categoryLabel: 'Salon & Spa',
    rating: 5.0,
    reviewsCount: 210,
    address: '88 Fashion Avenue, 2nd Floor Loft',
    currentQueueSize: 4,
    maxCapacity: 10,
    avgWaitMins: 20,
    distanceKm: 2.4,
    transitTimeText: '8 min transit',
    status: 'Open',
    hoursText: 'Closes 7:30 PM',
    laneCapacityPercent: 45,
    laneCapacityText: 'Steady Booking',
    activeCountersCount: 5,
    activeCountersText: 'Senior Stylists On-Deck',
    deskRouting: 'Hair sculpting, balayage color lab, aesthetic skincare consultations',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYUR53FeTBtaHf9VuZG6uy2rbwOkzewpuyH3zhIMTLnMHBqSyw3WHp4i9Pc_fja7HJPppaFd4Sa6XKH1WZDWsS0DdI3zdNQyzertmEEcdRh58Z9YPDr1xVYSOiBqh7z2Iwe2qdZr9RO0fRuidwxR0EfX896mIYVpwZIoDT9Ia6EmWbJapJFwi3QJi10t0erGDb1CWfm64FWSj_8UMN1_rfnRgbKKmk2FHtoGH3TB66Udo4FQHOkVXo',
  },
  {
    id: 'city-civic',
    slug: 'city-municipal-registration',
    name: 'City Municipal Registration Office',
    category: 'civic',
    categoryLabel: 'Government & Civic',
    rating: 4.3,
    reviewsCount: 412,
    tag: 'High Demand',
    address: '100 Civic Hall Square, North Atrium',
    currentQueueSize: 28,
    maxCapacity: 35,
    avgWaitMins: 55,
    distanceKm: 3.1,
    transitTimeText: '12 min transit',
    status: 'Open',
    hoursText: 'Closes 4:30 PM',
    laneCapacityPercent: 88,
    laneCapacityText: 'Heavy Civic Load',
    activeCountersCount: 12,
    activeCountersText: '12 Open Counters',
    deskRouting: 'Residential permits, vehicle licenses, business registrations • Desks 1-12',
  },
];

type Listener = (state: AppState) => void;

class QueueStore {
  private state: AppState;
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private sessionTimer: number | null = null;

  constructor() {
    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_UPDATE') {
            this.state = event.data.state;
            this.notifyListeners(false);
          }
        };
      } catch {
        // Fallback for restricted iframes
      }
    }

    this.startSessionTimer();
  }

  private loadInitialState(): AppState {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed;
        }
      } catch {
        // Use default
      }
    }

    return {
      stepCount: 0,
      activeChamberSessionSeconds: 258,
      servingTicket: { ...INITIAL_SERVING },
      waitingQueue: [...INITIAL_WAITING],
      completedTodayCount: 64,
      noShowsCount: 0,
      userTicket: { ...INITIAL_WAITING[1] }, // Token #44 Amit Patel
      isQueueClosed: false,
      chimeEnabled: true,
      autoDispatchActive: false,
      lastBroadcastMessage: null,
      lastEventDescription: "Socket.emit('COUNTER_DISPATCH', { ticket: 43, counter: 3, latency: '28ms' })",
      networkLatencyMs: 28,
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Storage quota
      }
    }
  }

  private startSessionTimer() {
    if (typeof window === 'undefined') return;
    if (this.sessionTimer) clearInterval(this.sessionTimer);

    this.sessionTimer = window.setInterval(() => {
      this.state.activeChamberSessionSeconds += 1;
      this.notifyListeners(false);
    }, 1000);
  }

  private notifyListeners(broadcast = true) {
    this.persist();
    for (const listener of this.listeners) {
      listener(this.state);
    }
    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          state: this.state,
        });
      } catch {
        // Broadcast error
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return this.state;
  }

  /**
   * Advance Queue - Call Next Customer
   */
  public advanceQueue(): { calledTicket: QueueEntry | null; userCalled: boolean } {
    if (this.state.waitingQueue.length === 0) {
      return { calledTicket: null, userCalled: false };
    }

    const nextWaiting = this.state.waitingQueue[0];
    const newWaiting = this.state.waitingQueue.slice(1);

    const oldServing = this.state.servingTicket;
    const completedIncrement = oldServing ? 1 : 0;

    this.state.stepCount += 1;
    this.state.servingTicket = {
      ...nextWaiting,
      status: 'serving',
      servedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.state.waitingQueue = newWaiting;
    this.state.completedTodayCount += completedIncrement;
    this.state.activeChamberSessionSeconds = 0; // Reset timer for new patient

    // Check if user's ticket was called
    const isUserTicket = this.state.userTicket && this.state.userTicket.ticketNumber === nextWaiting.ticketNumber;
    if (isUserTicket) {
      this.state.userTicket = { ...this.state.servingTicket };
      soundManager.playYourTurnFanfare();
    } else {
      soundManager.playDeskChime();
    }

    // Recalculate estimated wait for remaining
    this.state.waitingQueue = this.state.waitingQueue.map((ticket, idx) => ({
      ...ticket,
      waitMinutesEstimated: Math.max(1, (idx + 1) * 3),
    }));

    // Trigger Web Notification when customer is within 5 minutes of being served
    if (this.state.userTicket) {
      if (isUserTicket) {
        notificationService.triggerServingNowAlert(
          'SmileCare Dental Clinic',
          this.state.userTicket.ticketNumber,
          'Counter 3'
        );
      } else {
        const userWaitingIdx = this.state.waitingQueue.findIndex(
          (t) => t.ticketNumber === this.state.userTicket?.ticketNumber
        );
        if (userWaitingIdx !== -1) {
          const userPos = userWaitingIdx + 1;
          const userEstimatedWait = this.state.waitingQueue[userWaitingIdx].waitMinutesEstimated;
          // If within 5 minutes (or position 1 or 2 with <= 5 min wait)
          if (userEstimatedWait <= 5 || userPos <= 2) {
            notificationService.triggerFiveMinuteAlert(
              'SmileCare Dental Clinic',
              this.state.userTicket.ticketNumber,
              userPos,
              userEstimatedWait
            );
          }
        }
      }
    }

    this.state.lastEventDescription = `Socket.emit('COUNTER_DISPATCH', { ticket: ${nextWaiting.ticketNumber}, counter: 3, latency: '${Math.floor(24 + Math.random() * 8)}ms' })`;
    this.state.networkLatencyMs = Math.floor(22 + Math.random() * 12);

    this.notifyListeners(true);
    return { calledTicket: nextWaiting, userCalled: Boolean(isUserTicket) };
  }

  /**
   * Reset simulation state
   */
  public resetSimulation() {
    notificationService.resetTracking();
    this.state = {
      ...this.state,
      stepCount: 0,
      activeChamberSessionSeconds: 258,
      servingTicket: { ...INITIAL_SERVING },
      waitingQueue: [...INITIAL_WAITING],
      completedTodayCount: 64,
      noShowsCount: 0,
      userTicket: { ...INITIAL_WAITING[1] },
      lastEventDescription: "Socket.emit('COUNTER_RESET', { status: 'INITIAL_STATE' })",
      networkLatencyMs: 26,
    };
    soundManager.playAlertPing();
    this.notifyListeners(true);
  }

  /**
   * Delay Customer Ticket (+5 mins, shifts down safely)
   */
  public delayCustomerTicket(): number {
    if (!this.state.userTicket) return 0;
    const userNum = this.state.userTicket.ticketNumber;

    const idx = this.state.waitingQueue.findIndex((t) => t.ticketNumber === userNum);
    if (idx !== -1) {
      const ticket = this.state.waitingQueue[idx];
      // Move 1 position backward if possible
      const newQueue = [...this.state.waitingQueue];
      newQueue.splice(idx, 1);
      const newIdx = Math.min(newQueue.length, idx + 1);
      newQueue.splice(newIdx, 0, {
        ...ticket,
        waitMinutesEstimated: ticket.waitMinutesEstimated + 5,
      });

      this.state.waitingQueue = newQueue;
      this.state.lastEventDescription = `Socket.emit('TICKET_DEFER', { ticket: ${userNum}, offsetMins: 5 })`;
      soundManager.playAlertPing();
      this.notifyListeners(true);
      return 5;
    }
    return 0;
  }

  /**
   * Leave Queue
   */
  public leaveQueue() {
    if (!this.state.userTicket) return;
    const userNum = this.state.userTicket.ticketNumber;
    this.state.waitingQueue = this.state.waitingQueue.filter((t) => t.ticketNumber !== userNum);
    this.state.userTicket = null;
    this.state.lastEventDescription = `Socket.emit('TICKET_CANCEL', { ticket: ${userNum} })`;
    soundManager.playAlertPing();
    this.notifyListeners(true);
  }

  /**
   * Add a walk-in or newly joined customer
   */
  public addWalkIn(name: string, phone: string, serviceType: string): QueueEntry {
    const highestTicketNumber = Math.max(
      this.state.servingTicket?.ticketNumber || 40,
      ...this.state.waitingQueue.map((q) => q.ticketNumber),
      47
    );
    const newNumber = highestTicketNumber + 1;
    const now = new Date();
    const joinedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTicket: QueueEntry = {
      id: `t-${newNumber}`,
      businessId: 'smilecare',
      ticketNumber: newNumber,
      customerName: name.trim() || `Visitor #${newNumber}`,
      customerPhone: phone.trim() ? phone : undefined,
      serviceType: serviceType || 'General Oral Checkup',
      status: 'waiting',
      joinedAt,
      joinedTimestamp: Date.now(),
      waitMinutesEstimated: (this.state.waitingQueue.length + 1) * 3,
    };

    this.state.waitingQueue.push(newTicket);
    this.state.lastEventDescription = `Socket.emit('TICKET_ENROLL', { ticket: ${newNumber}, name: '${newTicket.customerName}' })`;
    soundManager.playAlertPing();
    this.notifyListeners(true);
    return newTicket;
  }

  /**
   * Join a queue as current user
   */
  public joinAsUser(name: string, phone: string, serviceType: string = 'General Dental'): QueueEntry {
    const newTicket = this.addWalkIn(name, phone, serviceType);
    newTicket.isCurrentUser = true;
    this.state.userTicket = { ...newTicket };
    this.notifyListeners(true);
    return newTicket;
  }

  /**
   * Remove a specific ticket from the roster
   */
  public removeTicket(ticketId: string) {
    this.state.waitingQueue = this.state.waitingQueue.filter((t) => t.id !== ticketId);
    this.state.lastEventDescription = `Socket.emit('TICKET_REMOVE', { ticketId: '${ticketId}' })`;
    this.notifyListeners(true);
  }

  /**
   * Check in customer via Geolocation
   */
  public checkInCustomer(ticketNumber?: number): boolean {
    const num = ticketNumber || this.state.userTicket?.ticketNumber || 44;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updated = false;
    if (this.state.userTicket && this.state.userTicket.ticketNumber === num) {
      this.state.userTicket = {
        ...this.state.userTicket,
        checkedIn: true,
        checkedInAt: now,
      };
      updated = true;
    }

    this.state.waitingQueue = this.state.waitingQueue.map((t) => {
      if (t.ticketNumber === num) {
        updated = true;
        return {
          ...t,
          checkedIn: true,
          checkedInAt: now,
        };
      }
      return t;
    });

    if (updated) {
      this.state.lastEventDescription = `Socket.emit('GEOLOCATION_CHECKIN_CONFIRMED', { ticket: ${num}, at: '${now}' })`;
      soundManager.playYourTurnFanfare();
      this.notifyListeners(true);
    }
    return updated;
  }

  /**
   * Prioritize a customer
   */
  public prioritizeTicket(ticketId: string) {
    const idx = this.state.waitingQueue.findIndex((t) => t.id === ticketId);
    if (idx > 0) {
      const item = this.state.waitingQueue[idx];
      const newQueue = [...this.state.waitingQueue];
      newQueue.splice(idx, 1);
      newQueue.unshift(item);
      this.state.waitingQueue = newQueue;
      this.state.lastEventDescription = `Socket.emit('TICKET_PRIORITIZE', { ticket: ${item.ticketNumber} })`;
      soundManager.playAlertPing();
      this.notifyListeners(true);
    }
  }

  /**
   * Broadcast SMS
   */
  public broadcastSms(message: string) {
    this.state.lastBroadcastMessage = message;
    this.state.lastEventDescription = `Socket.emit('BROADCAST_SMS', { count: ${this.state.waitingQueue.length}, message: '${message}' })`;
    soundManager.playAlertPing();
    this.notifyListeners(true);
  }

  public clearBroadcast() {
    this.state.lastBroadcastMessage = null;
    this.notifyListeners(true);
  }

  public toggleChime() {
    this.state.chimeEnabled = !this.state.chimeEnabled;
    soundManager.soundEnabled = this.state.chimeEnabled;
    if (this.state.chimeEnabled) soundManager.playAlertPing();
    this.notifyListeners(true);
  }

  public toggleAutoDispatch() {
    this.state.autoDispatchActive = !this.state.autoDispatchActive;
    soundManager.playAlertPing();
    this.notifyListeners(true);
  }

  public markCompleted() {
    if (this.state.servingTicket) {
      this.advanceQueue();
    }
  }

  public markNoShow() {
    if (this.state.servingTicket) {
      this.state.noShowsCount += 1;
      this.state.lastEventDescription = `Socket.emit('MARK_NO_SHOW', { ticket: ${this.state.servingTicket.ticketNumber} })`;
      this.advanceQueue();
    }
  }
}

export const queueStore = new QueueStore();
