/**
 * InsightOS Replay Worker
 * Offloads mouse movement buffering from the main thread
 * to ensure 100 Lighthouse Performance score.
 */
self.onmessage = function(e) {
  if (!self.buffer) self.buffer = [];
  
  // Push incoming mouse event to buffer
  self.buffer.push(e.data);
  
  // Initialize flush timer if not exists
  if (!self.timer) {
    self.timer = setInterval(() => {
      if (self.buffer.length > 0) {
        // Send batch back to main thread and clear buffer
        self.postMessage(self.buffer.splice(0));
      }
    }, 500); // 500ms batching interval
  }
};
