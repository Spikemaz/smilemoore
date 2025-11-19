// Voucher System Configuration
// This manages the dynamic voucher counter and value tiers

export interface VoucherTier {
  min: number;
  max: number;
  value: number;
  message: string;
}

// Voucher value tiers based on total signups
export const VOUCHER_TIERS: VoucherTier[] = [
  { min: 0, max: 500, value: 50, message: '£50 Voucher' },
  { min: 500, max: 1000, value: 40, message: '£40 Voucher' },
  { min: 1000, max: 1500, value: 30, message: '£30 Voucher' },
  { min: 1500, max: 2000, value: 20, message: '£20 Voucher' },
  { min: 2000, max: 5000, value: 10, message: '£10 Voucher' },
  { min: 5000, max: 999999, value: 0, message: 'Entry to Win 1 Year Free Dentistry' },
];

// Configuration
const BATCH_SIZE = 90; // Release 100, hold back 10
const TOTAL_PER_BATCH = 100;
const MIN_DISPLAY_THRESHOLD = 16; // Don't go below this when displaying

export class VoucherCounter {
  private totalSignups: number;
  private currentBatch: number;
  private vouchersClaimedInBatch: number;

  constructor(totalSignups: number = 0) {
    this.totalSignups = totalSignups;
    this.currentBatch = Math.floor(totalSignups / BATCH_SIZE);
    this.vouchersClaimedInBatch = totalSignups % BATCH_SIZE;
  }

  // Get current voucher tier based on total signups
  getCurrentTier(): VoucherTier {
    for (const tier of VOUCHER_TIERS) {
      if (this.totalSignups >= tier.min && this.totalSignups < tier.max) {
        return tier;
      }
    }
    return VOUCHER_TIERS[VOUCHER_TIERS.length - 1];
  }

  // Calculate how many vouchers to display on page load
  getInitialDisplay(): number {
    const vouchersLeftInBatch = BATCH_SIZE - this.vouchersClaimedInBatch;

    // Show actual remaining vouchers (no randomization)
    return vouchersLeftInBatch;
  }

  // Get random decrease amount during form filling
  getRandomDecrease(currentDisplay: number, step: number): number {
    // No fake decreases - counter stays at real value
    return 0;
  }

  // Check if new batch should be released
  shouldReleaseBatch(): boolean {
    return this.vouchersClaimedInBatch >= BATCH_SIZE;
  }

  // Get batch announcement message
  getBatchAnnouncementMessage(): string {
    const batchNumber = this.currentBatch + 1;
    const totalClaimed = this.totalSignups;

    return `🎉 ${totalClaimed} vouchers already claimed! ${TOTAL_PER_BATCH} more have been made available!`;
  }

  // Simulate what happens during form completion
  simulateFormProgress(initialDisplay: number): number[] {
    const displays = [initialDisplay];
    let current = initialDisplay;

    // At each step, potentially decrease
    for (let step = 1; step <= 4; step++) {
      const decrease = this.getRandomDecrease(current, step);
      current = Math.max(current - decrease, MIN_DISPLAY_THRESHOLD);
      displays.push(current);
    }

    return displays;
  }

  // Get progress message for header
  getHeaderMessage(vouchersShown: number): {
    text: string;
    tier: VoucherTier;
    urgency: 'high' | 'medium' | 'low';
  } {
    const tier = this.getCurrentTier();
    let urgency: 'high' | 'medium' | 'low' = 'medium';

    if (vouchersShown <= 20) {
      urgency = 'high';
    } else if (vouchersShown <= 50) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    let text = '';
    if (tier.value > 0) {
      text = `Only ${vouchersShown} ${tier.message}s Remaining!`;
    } else {
      text = `Join ${vouchersShown} spots left to win 1 Year Free Dentistry!`;
    }

    return { text, tier, urgency };
  }

  // Track new signup
  recordSignup(): void {
    this.totalSignups++;
    this.vouchersClaimedInBatch++;

    if (this.shouldReleaseBatch()) {
      this.currentBatch++;
      this.vouchersClaimedInBatch = 0;
    }
  }
}

// Client-side helper for localStorage persistence
export class VoucherDisplayManager {
  private counter: VoucherCounter;
  private sessionVoucherCount: number;

  constructor(totalSignups: number) {
    this.counter = new VoucherCounter(totalSignups);

    // Get or set session voucher count
    const stored = sessionStorage.getItem('voucherDisplay');
    if (stored) {
      this.sessionVoucherCount = parseInt(stored);
    } else {
      this.sessionVoucherCount = this.counter.getInitialDisplay();
      sessionStorage.setItem('voucherDisplay', this.sessionVoucherCount.toString());
    }
  }

  getCurrentDisplay(): number {
    return this.sessionVoucherCount;
  }

  decreaseForStep(step: number): void {
    const decrease = this.counter.getRandomDecrease(this.sessionVoucherCount, step);
    this.sessionVoucherCount = Math.max(
      this.sessionVoucherCount - decrease,
      MIN_DISPLAY_THRESHOLD
    );
    sessionStorage.setItem('voucherDisplay', this.sessionVoucherCount.toString());
  }

  getHeaderMessage(): { text: string; tier: VoucherTier; urgency: 'high' | 'medium' | 'low' } {
    return this.counter.getHeaderMessage(this.sessionVoucherCount);
  }
}

// API endpoint helper to get current state
export function getCurrentVoucherState(totalSignups: number) {
  const counter = new VoucherCounter(totalSignups);
  const tier = counter.getCurrentTier();
  const initialDisplay = counter.getInitialDisplay();

  return {
    totalSignups,
    currentTier: tier,
    initialDisplay,
    batchInfo: {
      currentBatch: Math.floor(totalSignups / BATCH_SIZE),
      vouchersInBatch: totalSignups % BATCH_SIZE,
      shouldAnnounce: counter.shouldReleaseBatch(),
      announcement: counter.shouldReleaseBatch() ? counter.getBatchAnnouncementMessage() : null,
    }
  };
}
