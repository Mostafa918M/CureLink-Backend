// services/analytics.service.test.js
'use strict';

jest.mock('../models/donation.model');
jest.mock('../models/request.model');
jest.mock('../models/user.model');
jest.mock('../models/medicine.model');
jest.mock('../models/institution.model');

const Donation    = require('../models/donation.model');
const Request     = require('../models/request.model');
const User        = require('../models/user.model');
const Institution = require('../models/institution.model');

const analyticsService = require('./analytics.service');

/* ────────────────────────── helpers ──────────────────────────── */
function mockAggregate(model, ...resolvedValues) {
  // Each call to .aggregate() returns the next value in the list
  let callIndex = 0;
  model.aggregate.mockImplementation(() =>
    Promise.resolve(resolvedValues[callIndex++ % resolvedValues.length])
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

/* ══════════════════════════════════════════════════════════════
   DONATION ANALYTICS
   ══════════════════════════════════════════════════════════════ */

describe('getDonationAnalytics()', () => {
  it('returns correct summary when totals exist', async () => {
    const byStatus = [{ _id: 'delivered', count: 45 }, { _id: 'pending', count: 30 }];
    const totals   = [{ _id: null, total: 120, delivered: 45, pending: 30, expired: 10, matched: 35 }];
    mockAggregate(Donation, byStatus, totals);

    const result = await analyticsService.getDonationAnalytics();

    expect(result.summary.total).toBe(120);
    expect(result.summary.deliveryRate).toBe('37.5%');
    expect(result.byStatus).toEqual(byStatus);
  });

  it('returns zeroed summary when collection is empty', async () => {
    mockAggregate(Donation, [], []);

    const result = await analyticsService.getDonationAnalytics();
    expect(result.summary.total).toBe(0);
    expect(result.summary.deliveryRate).toBe('0%');
  });
});

describe('getDonationTrends()', () => {
  it('returns correctly shaped data points', async () => {
    const trendData = [
      { period: '2025-10', count: 12 },
      { period: '2025-11', count: 18 },
    ];
    Donation.aggregate.mockResolvedValue(trendData);

    const result = await analyticsService.getDonationTrends({ period: 'monthly' });

    expect(result.period).toBe('monthly');
    expect(result.data).toEqual(trendData);
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
  });

  it('defaults to monthly when no period given', async () => {
    Donation.aggregate.mockResolvedValue([]);
    const result = await analyticsService.getDonationTrends({});
    expect(result.period).toBe('monthly');
  });
});

describe('getDonationCategories()', () => {
  it('returns category array', async () => {
    const cats = [{ category: 'Antibiotics', count: 34, totalQuantity: 210 }];
    Donation.aggregate.mockResolvedValue(cats);

    const result = await analyticsService.getDonationCategories();
    expect(result.data).toEqual(cats);
  });
});

describe('getDonationGeographic()', () => {
  it('returns byGovernorate and byDonorCarrier from two aggregation pipelines', async () => {
    const byGov     = [{ governorate: 'Cairo', count: 40 }];
    const byCarrier = [{ phonePrefix: '010', carrier: 'Vodafone', count: 55 }];
    // getDonationGeographic runs TWO Donation.aggregate calls
    mockAggregate(Donation, byGov, byCarrier);

    const result = await analyticsService.getDonationGeographic();
    expect(result.byGovernorate).toEqual(byGov);
    expect(result.byDonorCarrier).toEqual(byCarrier);
  });
});

/* ══════════════════════════════════════════════════════════════
   INSTITUTION ANALYTICS
   ══════════════════════════════════════════════════════════════ */

describe('getInstitutionAnalytics()', () => {
  it('returns summary with verified/pending/rejected from Institution model', async () => {
    const profileSummary = [{ _id: null, total: 25, verified: 18, pending: 5, rejected: 2 }];
    const byVerification = [{ status: 'verified', count: 18 }];
    const userSummary    = [{ _id: null, total: 25, active: 20 }];

    // Institution.aggregate called twice (Promise.all), User.aggregate called once
    mockAggregate(Institution, profileSummary, byVerification);
    mockAggregate(User, userSummary);

    const result = await analyticsService.getInstitutionAnalytics();

    expect(result.summary.total).toBe(25);
    expect(result.summary.verified).toBe(18);
    expect(result.summary.inactive).toBe(5);   // 25 - 20
    expect(result.summary.active).toBe(20);
  });

  it('handles empty collection gracefully', async () => {
    mockAggregate(Institution, [], []);
    mockAggregate(User, []);

    const result = await analyticsService.getInstitutionAnalytics();
    expect(result.summary.total).toBe(0);
    expect(result.summary.inactive).toBe(0);
  });
});

describe('getInstitutionsByType()', () => {
  it('returns type array using Institution model', async () => {
    const types = [
      { type: 'hospital',  count: 10 },
      { type: 'pharmacy',  count: 8  },
      { type: 'clinic',    count: 7  },
    ];
    Institution.aggregate.mockResolvedValue(types);

    const result = await analyticsService.getInstitutionsByType();
    expect(result.data).toEqual(types);
  });
});

describe('getInstitutionPerformance()', () => {
  it('calls Institution.aggregate with limit', async () => {
    Institution.aggregate.mockResolvedValue([]);
    await analyticsService.getInstitutionPerformance({ limit: '5' });
    expect(Institution.aggregate).toHaveBeenCalledTimes(1);
  });

  it('defaults limit to 10 when not specified', async () => {
    Institution.aggregate.mockResolvedValue([]);
    await analyticsService.getInstitutionPerformance({});
    expect(Institution.aggregate).toHaveBeenCalledTimes(1);
  });
});

/* ══════════════════════════════════════════════════════════════
   REQUEST ANALYTICS
   ══════════════════════════════════════════════════════════════ */

describe('getRequestAnalytics()', () => {
  it('calculates fulfilledRate correctly', async () => {
    const byStatus  = [{ _id: 'open', count: 30 }];
    const totals    = [{ _id: null, total: 80, open: 30, fulfilled: 25, partial: 15, cancelled: 5, expired: 5 }];
    const byPriority = [{ _id: 'high', count: 20 }];
    mockAggregate(Request, byStatus, totals, byPriority);

    const result = await analyticsService.getRequestAnalytics();

    expect(result.summary.total).toBe(80);
    expect(result.summary.fulfilledRate).toBe('31.3%');
  });

  it('returns 0% fulfillment rate when total is 0', async () => {
    mockAggregate(Request, [], [], []);
    const result = await analyticsService.getRequestAnalytics();
    expect(result.summary.fulfilledRate).toBe('0%');
  });
});

describe('getRequestTrends()', () => {
  it('returns trend data with period label', async () => {
    const trendData = [{ period: '2025-10', count: 8 }];
    Request.aggregate.mockResolvedValue(trendData);

    const result = await analyticsService.getRequestTrends({ period: 'monthly' });
    expect(result.data).toEqual(trendData);
  });
});

describe('getRequestFulfillment()', () => {
  it('returns fulfillment object with rates', async () => {
    const raw = [{
      total: 80,
      fullyFulfilled: 25,
      partiallyFulfilled: 15,
      unfulfilled: 30,
      avgFulfillmentPct: 48.3,
      fullFulfillmentRate: 31.3,
    }];
    Request.aggregate.mockResolvedValue(raw);

    const result = await analyticsService.getRequestFulfillment();
    expect(result.total).toBe(80);
    expect(result.fullFulfillmentRate).toBe(31.3);
  });

  it('returns zeroed object when collection is empty', async () => {
    Request.aggregate.mockResolvedValue([]);
    const result = await analyticsService.getRequestFulfillment();
    expect(result.total).toBe(0);
    expect(result.fullFulfillmentRate).toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════
   MATCHING ANALYTICS
   ══════════════════════════════════════════════════════════════ */

describe('getMatchingAnalytics()', () => {
  it('returns match rate', async () => {
    const data = [{ total: 120, matched: 80, delivered: 45, unmatched: 40, matchRate: 66.7 }];
    Donation.aggregate.mockResolvedValue(data);

    const result = await analyticsService.getMatchingAnalytics();
    expect(result.matchRate).toBe(66.7);
  });

  it('returns zero values when no donations exist', async () => {
    Donation.aggregate.mockResolvedValue([]);
    const result = await analyticsService.getMatchingAnalytics();
    expect(result.total).toBe(0);
    expect(result.matchRate).toBe(0);
  });
});

describe('getMatchingSuccessRate()', () => {
  it('returns overall and byStatus', async () => {
    const byStatus = [{ _id: 'delivered', count: 45 }];
    const overall  = [{ totalMatched: 80, successfullyDelivered: 45, rejectedByInstitution: 10, successRate: 56.3 }];
    mockAggregate(Donation, byStatus, overall);

    const result = await analyticsService.getMatchingSuccessRate();
    expect(result.overall.successRate).toBe(56.3);
    expect(result.byStatus).toEqual(byStatus);
  });
});

describe('getMatchingEfficiency()', () => {
  it('returns efficiency metrics and distribution', async () => {
    const efficiency   = [{ avgHours: 36.5, minHours: 0.5, maxHours: 720.0, totalMatched: 80 }];
    const distribution = [{ _id: 0, count: 12 }, { _id: 24, count: 28 }];
    mockAggregate(Donation, efficiency, distribution);

    const result = await analyticsService.getMatchingEfficiency();
    expect(result.efficiency.avgHours).toBe(36.5);
    expect(result.distribution).toEqual(distribution);
  });

  it('returns zeroed efficiency when no matched donations exist', async () => {
    mockAggregate(Donation, [], []);
    const result = await analyticsService.getMatchingEfficiency();
    expect(result.efficiency.avgHours).toBe(0);
    expect(result.efficiency.totalMatched).toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════
   USER ANALYTICS
   ══════════════════════════════════════════════════════════════ */

describe('getUserAnalytics()', () => {
  it('computes inactive count correctly', async () => {
    const byRole = [{ _id: 'donor', count: 450 }];
    const totals = [{ _id: null, total: 500, active: 460, verified: 420, locked: 3 }];
    mockAggregate(User, byRole, totals);

    const result = await analyticsService.getUserAnalytics();
    expect(result.summary.total).toBe(500);
    expect(result.summary.inactive).toBe(40);
    expect(result.summary.locked).toBe(3);
  });
});

describe('getUserGrowth()', () => {
  it('returns correct structure with period', async () => {
    const growthData = [{ period: '2025-10', total: 42, donors: 38, institutions: 4 }];
    User.aggregate.mockResolvedValue(growthData);

    const result = await analyticsService.getUserGrowth({ period: 'monthly' });
    expect(result.period).toBe('monthly');
    expect(result.data).toEqual(growthData);
  });
});

describe('getUserEngagement()', () => {
  it('returns engagement object with active counts', async () => {
    const engagement = [{ total: 500, activeThisWeek: 120, activeThisMonth: 310, neverLoggedIn: 45 }];
    const loginStats = [{ lastLogin: new Date(), firstLogin: new Date('2024-01-01') }];
    mockAggregate(User, engagement, loginStats);

    const result = await analyticsService.getUserEngagement();
    expect(result.engagement.activeThisWeek).toBe(120);
    expect(result.engagement.neverLoggedIn).toBe(45);
  });

  it('returns zeroed engagement when no users exist', async () => {
    mockAggregate(User, [], []);
    const result = await analyticsService.getUserEngagement();
    expect(result.engagement.total).toBe(0);
    expect(result.loginStats.lastLogin).toBeNull();
  });
});
