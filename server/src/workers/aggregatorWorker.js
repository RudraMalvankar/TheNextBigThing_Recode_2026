const cron = require('node-cron');
const HourlyStats = require('../models/HourlyStats');
const Event = require('../models/Event');

/**
 * Run hourly rollup worker at 5 minutes past every hour.
 * This pre-aggregates raw event data into the HourlyStats model
 * for lightning-fast dashboard queries over long time ranges.
 */
cron.schedule('5 * * * *', async () => {
  const now = new Date();
  
  // Define time range (the previous full hour)
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);
  hourStart.setMilliseconds(0);
  hourStart.setHours(hourStart.getHours() - 1);
  
  const hourEnd = new Date(hourStart);
  hourEnd.setHours(hourEnd.getHours() + 1);

  console.log(`[Aggregator] Starting rollup for ${hourStart.toISOString()}`);

  try {
    // 1. Get unique sites that had events in this hour
    const sites = await Event.distinct('siteId', {
      createdAt: { $gte: hourStart, $lt: hourEnd }
    });

    for (const siteId of sites) {
      // 2. Perform aggregation for this site and hour
      const aggResult = await Event.aggregate([
        { 
          $match: {
            siteId,
            createdAt: { $gte: hourStart, $lt: hourEnd },
            isBot: { $ne: true } // Exclude bot traffic
          }
        },
        { 
          $facet: {
            pageviews: [
              { $match: { type: 'pageview' }},
              { $count: 'total' }
            ],
            clicks: [
              { $match: { type: 'click' }},
              { $count: 'total' }
            ],
            topPages: [
              { $match: { type: 'pageview' }},
              { $group: { _id: '$page', count: { $sum: 1 }}},
              { $sort: { count: -1 }},
              { $limit: 10 }
            ],
            countries: [
              { $group: { _id: '$country', count: { $sum: 1 }}},
              { $sort: { count: -1 }},
              { $limit: 10 }
            ],
            rageclicks: [
              { $match: { isRageClick: true }},
              { $count: 'total' }
            ]
          }
        }
      ]);

      const stats = aggResult[0];

      // 3. Upsert into HourlyStats
      await HourlyStats.findOneAndUpdate(
        { siteId, hour: hourStart },
        {
          siteId,
          hour: hourStart,
          pageviews: stats.pageviews[0]?.total || 0,
          clicks: stats.clicks[0]?.total || 0,
          topPages: stats.topPages || [],
          countries: stats.countries || [],
          rageClicks: stats.rageclicks[0]?.total || 0
        },
        { upsert: true }
      );
    }
    
    console.log(`[Aggregator] Hourly stats rollup successfully completed for ${sites.length} sites`);
  } catch (error) {
    console.error('[Aggregator] Failed to compute hourly stats:', error);
  }
});

console.log('[Aggregator] Cron job scheduled (5 * * * *)');
