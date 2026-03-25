/* ============================================
   EarthSama — Client Error Logger
   Catches JS errors, unhandled rejections,
   and failed fetches. Stores in localStorage.
   ============================================ */

(function() {
  const STORAGE_KEY = 'earthsama_errors';
  const MAX_ERRORS = 200;

  function getErrors() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function saveError(entry) {
    const errors = getErrors();
    errors.unshift(entry);
    if (errors.length > MAX_ERRORS) errors.length = MAX_ERRORS;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(errors)); }
    catch { /* storage full — silently drop */ }
  }

  function buildEntry(type, message, extra) {
    return {
      type: type,
      message: String(message).substring(0, 500),
      url: window.location.href,
      page: window.location.pathname.split('/').pop() || 'index.html',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 150),
      ...extra
    };
  }

  // 1. Uncaught JS errors
  window.addEventListener('error', function(e) {
    saveError(buildEntry('js_error', e.message, {
      file: e.filename ? e.filename.split('/').pop() : '',
      line: e.lineno || null,
      col: e.colno || null,
      stack: e.error && e.error.stack ? e.error.stack.substring(0, 800) : ''
    }));
  });

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    const reason = e.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    saveError(buildEntry('promise_rejection', message, {
      stack: reason instanceof Error && reason.stack ? reason.stack.substring(0, 800) : ''
    }));
  });

  // 3. Fetch failures — wrap native fetch
  const originalFetch = window.fetch;
  window.fetch = function() {
    const url = arguments[0];
    const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : String(url));

    return originalFetch.apply(this, arguments).then(function(response) {
      if (!response.ok) {
        saveError(buildEntry('fetch_error', `HTTP ${response.status} ${response.statusText}`, {
          fetchUrl: urlStr.substring(0, 300),
          status: response.status
        }));
      }
      return response;
    }).catch(function(err) {
      saveError(buildEntry('fetch_error', err.message, {
        fetchUrl: urlStr.substring(0, 300),
        stack: err.stack ? err.stack.substring(0, 400) : ''
      }));
      throw err;
    });
  };

  // 4. Console.error capture
  const originalConsoleError = console.error;
  console.error = function() {
    const msg = Array.from(arguments).map(a => {
      if (a instanceof Error) return a.message;
      if (typeof a === 'object') try { return JSON.stringify(a).substring(0, 200); } catch { return String(a); }
      return String(a);
    }).join(' ');

    saveError(buildEntry('console_error', msg));
    originalConsoleError.apply(console, arguments);
  };

  // Expose for manual error logging
  window.EarthSamaLog = {
    error: function(message, extra) {
      saveError(buildEntry('manual', message, extra || {}));
    },
    getErrors: getErrors,
    clear: function() {
      localStorage.removeItem(STORAGE_KEY);
    }
  };
})();
