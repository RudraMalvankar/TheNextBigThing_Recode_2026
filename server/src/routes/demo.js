const express = require('express');
const router = express.Router();
const { eventQueue } = require('../queues/eventQueue');

/**
 * POST /api/demo/inject
 * Injects realistic fake sessions and events to make the Live Dashboard
 * look like a busy production environment during presentations.
 */
router.post('/inject', async (req, res) => {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ error: "siteId is required" });

    const demoSessionId = `demo-${Date.now()}`;
    const pages = ['/', '/pricing', '/about', '/docs', '/checkout'];
    const countries = ['US', 'GB', 'DE', 'IN', 'JP', 'CA', 'FR'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const os = ['Windows', 'MacOS', 'iOS', 'Android'];

    const fakeEvents = [
      { type: 'pageview', page: '/', country: 'US', browser: 'Chrome', os: 'Windows' },
      { type: 'click', page: '/', clickX: 0.45, clickY: 0.3, label: 'Get Started' },
      { type: 'pageview', page: '/pricing', country: 'GB', browser: 'Safari', os: 'MacOS' },
      { type: 'move', page: '/pricing', x: 0.5, y: 0.5 },
      { type: 'rage_click', page: '/pricing', clickX: 0.6, clickY: 0.7, label: 'Standard Plan' },
      { type: 'pageview', page: '/docs', country: 'DE', browser: 'Chrome', os: 'Android' },
      { type: 'custom', label: 'demo_event', customProps: JSON.stringify({ value: 100 }) },
      { type: 'pageview', page: '/checkout', country: 'US', browser: 'Chrome' },
      { type: 'click', page: '/checkout', label: 'Complete Purchase' }
    ];

    // Inject events with staggering to simulate real activity
    fakeEvents.forEach((ev, i) => {
      setTimeout(async () => {
        await eventQueue.add('process-event', {
          ...ev,
          siteId,
          sessionId: `${demoSessionId}-${i % 3}`, // Spreads across a few demo sessions
          ua: `${ev.browser || 'Chrome'}/${ev.os || 'Windows'}`,
          ts: Date.now()
        });
      }, i * 400); // 400ms delay between events
    });

    res.json({ 
      success: true, 
      message: `Injected ${fakeEvents.length} demo events. Live feed will update shortly.`,
      demoSessionId 
    });
  } catch (error) {
    console.error('[Demo] Injection failed:', error);
    res.status(500).json({ error: "Failed to inject demo events" });
  }
});

module.exports = router;
