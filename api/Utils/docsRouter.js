import { Router } from "express";
import { swaggerSpec } from "./Swagger.js";

const docsRouter = Router();

// OpenAPI Spec JSON endpoint
docsRouter.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// Swagger & Interactive Docs UI
docsRouter.get("/", (req, res) => {
  const specJsonString = JSON.stringify(swaggerSpec).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jira API Documentation</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css" />
  <style>
    :root {
      --bg: #0B0F19;
      --surface: #111827;
      --surface-hover: #1F2937;
      --surface-card: #161F30;
      --border: #243247;
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-dim: #6B7280;
      --primary: #4F46E5;
      --primary-light: #6366F1;
      --primary-gradient: linear-gradient(135deg, #243B6B 0%, #4F46E5 100%);
      
      --get-bg: rgba(14, 165, 233, 0.12);
      --get-border: #0284C7;
      --get-text: #38BDF8;

      --post-bg: rgba(16, 185, 129, 0.12);
      --post-border: #059669;
      --post-text: #34D399;

      --patch-bg: rgba(245, 158, 11, 0.12);
      --patch-border: #D97706;
      --patch-text: #FBBF24;

      --put-bg: rgba(249, 115, 22, 0.12);
      --put-border: #EA580C;
      --put-text: #FB923C;

      --delete-bg: rgba(239, 68, 68, 0.12);
      --delete-border: #DC2626;
      --delete-text: #F87171;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Navigation Bar */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-img {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      object-fit: contain;
      background: #ffffff;
      padding: 3px;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }

    .brand-info h1 {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #FFFFFF;
    }

    .brand-info p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .server-select {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      outline: none;
      cursor: pointer;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--primary-light);
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
    }

    .btn-outline {
      background: var(--surface);
      border-color: var(--border);
      color: var(--text);
    }
    .btn-outline:hover {
      background: var(--surface-hover);
      border-color: var(--text-muted);
    }

    .view-toggle {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3px;
    }

    .view-btn {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.775rem;
      font-weight: 600;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .view-btn.active {
      background: var(--primary);
      color: #fff;
    }

    /* Main Container */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Search & Filter Toolbar */
    .search-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      width: 18px;
      height: 18px;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: var(--surface-card);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px 12px 42px;
      font-size: 0.95rem;
      color: var(--text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }

    .search-input:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .search-shortcut {
      position: absolute;
      right: 14px;
      font-size: 0.725rem;
      color: var(--text-dim);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 3px 6px;
      border-radius: 5px;
      font-family: monospace;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .chips-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .chip-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-right: 4px;
    }

    .chip {
      background: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.775rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip:hover {
      border-color: var(--text-muted);
      color: var(--text);
    }
    .chip.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      font-weight: 600;
    }

    .chip-method-get.active { background: var(--get-border); border-color: var(--get-border); }
    .chip-method-post.active { background: var(--post-border); border-color: var(--post-border); }
    .chip-method-patch.active { background: var(--patch-border); border-color: var(--patch-border); }
    .chip-method-put.active { background: var(--put-border); border-color: var(--put-border); }
    .chip-method-delete.active { background: var(--delete-border); border-color: var(--delete-border); }

    .counter-badge {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .counter-badge strong {
      color: var(--text);
    }

    /* Endpoints Group / Accordion */
    .tag-section {
      margin-bottom: 24px;
    }

    .tag-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .tag-title {
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tag-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .endpoint-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 10px;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .endpoint-card:hover {
      border-color: #374151;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }

    .endpoint-header {
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      gap: 12px;
    }

    .endpoint-summary-group {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    .method-badge {
      font-size: 0.725rem;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 6px;
      letter-spacing: 0.04em;
      min-width: 60px;
      text-align: center;
      border: 1px solid transparent;
      font-family: 'Fira Code', monospace;
    }
    .method-get { background: var(--get-bg); border-color: var(--get-border); color: var(--get-text); }
    .method-post { background: var(--post-bg); border-color: var(--post-border); color: var(--post-text); }
    .method-patch { background: var(--patch-bg); border-color: var(--patch-border); color: var(--patch-text); }
    .method-put { background: var(--put-bg); border-color: var(--put-border); color: var(--put-text); }
    .method-delete { background: var(--delete-bg); border-color: var(--delete-border); color: var(--delete-text); }

    .endpoint-path {
      font-family: 'Fira Code', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }

    .endpoint-title {
      font-size: 0.825rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .endpoint-badges {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lock-icon {
      color: var(--patch-text);
      font-size: 0.75rem;
      padding: 2px 6px;
      background: var(--patch-bg);
      border-radius: 4px;
      font-weight: 600;
    }

    .endpoint-body {
      display: none;
      padding: 20px;
      background: var(--surface-card);
      border-top: 1px solid var(--border);
    }
    .endpoint-card.open .endpoint-body {
      display: block;
    }

    .endpoint-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 18px;
      line-height: 1.6;
    }

    .section-subtitle {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .param-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 0.825rem;
    }
    .param-table th, .param-table td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .param-table th {
      color: var(--text-muted);
      font-weight: 600;
      background: var(--surface);
    }
    .param-table code {
      font-family: 'Fira Code', monospace;
      color: var(--get-text);
    }
    .param-required {
      color: var(--delete-text);
      font-size: 0.7rem;
      font-weight: 700;
    }

    .param-input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.825rem;
      outline: none;
      font-family: 'Fira Code', monospace;
    }

    .code-editor {
      width: 100%;
      min-height: 130px;
      background: #0D1117;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: #79C0FF;
      font-family: 'Fira Code', monospace;
      font-size: 0.825rem;
      padding: 12px;
      outline: none;
      resize: vertical;
      margin-bottom: 16px;
    }

    .test-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
    }

    .response-box {
      margin-top: 18px;
      display: none;
    }
    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 0.8rem;
    }
    .response-status {
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 0.75rem;
    }
    .status-2xx { background: var(--post-bg); color: var(--post-text); border: 1px solid var(--post-border); }
    .status-4xx { background: var(--delete-bg); color: var(--delete-text); border: 1px solid var(--delete-border); }
    .status-5xx { background: var(--delete-bg); color: var(--delete-text); border: 1px solid var(--delete-border); }

    .response-content {
      background: #0D1117;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      color: #A5D6FF;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      max-height: 350px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* Modal for Bearer Auth */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
    }
    .modal-backdrop.open {
      display: flex;
    }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .modal-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .modal-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    /* Swagger UI Container */
    #swagger-ui-view {
      display: none;
      background: #FFFFFF;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <header>
    <a href="/docs" class="brand">
      <img src="/logo.png" alt="Logo" class="brand-logo-img">
      <div class="brand-info">
        <h1>Jira Enterprise API</h1>
        <p>RESTful OpenAPI 3.0.3 Documentation</p>
      </div>
    </a>

    <div class="top-actions">
      <select id="serverSelect" class="server-select">
        <option value="http://localhost:8000">Localhost:8000 (Express Local)</option>
        <option value="http://localhost:5000">Localhost:5000 (Docker Backend)</option>
      </select>

      <button id="authBtn" class="btn btn-outline">
        <span id="authIcon">🔒</span>
        <span id="authBtnText">Authorize</span>
      </button>

      <div class="view-toggle">
        <button id="viewFastBtn" class="view-btn active" onclick="switchView('fast')">Search UI</button>
        <button id="viewSwaggerBtn" class="view-btn" onclick="switchView('swagger')">Swagger UI</button>
      </div>

      <a href="/docs/openapi.json" target="_blank" class="btn btn-outline" style="text-decoration:none;">
        JSON Spec
      </a>
    </div>
  </header>

  <div class="container" id="interactive-view">
    <!-- Search and Filter Panel -->
    <div class="search-panel">
      <div class="search-input-wrapper">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          id="searchInput" 
          class="search-input" 
          placeholder="Search endpoints by path (e.g. /users, /auth), method, or keyword..." 
          autocomplete="off"
        />
        <span class="search-shortcut">/ or Ctrl+K</span>
      </div>

      <div class="filter-row">
        <div class="chips-group" id="tagChipsGroup">
          <span class="chip-label">Module:</span>
          <button class="chip active" data-tag="ALL">All Modules</button>
        </div>

        <div class="chips-group" id="methodChipsGroup">
          <span class="chip-label">Method:</span>
          <button class="chip active" data-method="ALL">ALL</button>
          <button class="chip chip-method-get" data-method="GET">GET</button>
          <button class="chip chip-method-post" data-method="POST">POST</button>
          <button class="chip chip-method-patch" data-method="PATCH">PATCH</button>
          <button class="chip chip-method-put" data-method="PUT">PUT</button>
          <button class="chip chip-method-delete" data-method="DELETE">DELETE</button>
        </div>

        <div class="counter-badge" id="counterBadge">
          Showing <strong id="visibleCount">0</strong> of <strong id="totalCount">0</strong> endpoints
        </div>
      </div>
    </div>

    <!-- Endpoints Container -->
    <div id="endpointsContainer"></div>
  </div>

  <!-- Embedded Swagger UI View -->
  <div class="container">
    <div id="swagger-ui-view">
      <div id="swagger-ui"></div>
    </div>
  </div>

  <!-- Bearer Auth Modal -->
  <div class="modal-backdrop" id="authModal">
    <div class="modal">
      <h3 class="modal-title">Authorize Bearer JWT</h3>
      <p class="modal-desc">Paste your JWT token. It will automatically be included as <code>Bearer &lt;token&gt;</code> in all interactive API executions.</p>
      <input type="text" id="tokenInput" class="param-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." style="margin-bottom: 16px; padding: 10px;" />
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-outline" onclick="closeAuthModal()">Cancel</button>
        <button class="btn btn-outline" style="color:var(--delete-text);" onclick="clearAuthToken()">Clear Token</button>
        <button class="btn btn-primary" onclick="saveAuthToken()">Set Token</button>
      </div>
    </div>
  </div>

  <!-- Swagger UI Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js"></script>

  <script>
    const SPEC = ${specJsonString};

    let activeTag = 'ALL';
    let activeMethod = 'ALL';
    let searchQuery = '';
    let authToken = localStorage.getItem('tf_auth_token') || '';

    // Initialize UI
    document.addEventListener('DOMContentLoaded', () => {
      buildTagChips();
      renderEndpoints();
      updateAuthBtnState();
      initSwaggerUI();

      // Search event
      const searchInput = document.getElementById('searchInput');
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderEndpoints();
      });

      // Keyboard shortcut for search
      window.addEventListener('keydown', (e) => {
        if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
        if (e.key === 'Escape') {
          closeAuthModal();
        }
      });

      // Method chips
      document.querySelectorAll('#methodChipsGroup .chip').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#methodChipsGroup .chip').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          activeMethod = btn.dataset.method;
          renderEndpoints();
        });
      });

      // Server select
      const serverSelect = document.getElementById('serverSelect');
      const savedServer = localStorage.getItem('tf_server_url');
      if (savedServer) serverSelect.value = savedServer;
      serverSelect.addEventListener('change', (e) => {
        localStorage.setItem('tf_server_url', e.target.value);
      });

      // Auth modal trigger
      document.getElementById('authBtn').addEventListener('click', openAuthModal);
    });

    function buildTagChips() {
      const container = document.getElementById('tagChipsGroup');
      SPEC.tags.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.dataset.tag = t.name;
        btn.textContent = t.name;
        btn.addEventListener('click', () => {
          document.querySelectorAll('#tagChipsGroup .chip').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          activeTag = t.name;
          renderEndpoints();
        });
        container.appendChild(btn);
      });
    }

    function renderEndpoints() {
      const container = document.getElementById('endpointsContainer');
      container.innerHTML = '';

      let totalCount = 0;
      let visibleCount = 0;

      // Group paths by tags
      const tagMap = {};
      SPEC.tags.forEach(t => { tagMap[t.name] = []; });
      tagMap['General'] = [];

      for (const [path, methods] of Object.entries(SPEC.paths)) {
        for (const [method, details] of Object.entries(methods)) {
          totalCount++;
          const methodUpper = method.toUpperCase();
          const tag = details.tags && details.tags[0] ? details.tags[0] : 'General';

          // Match filters
          const matchesTag = (activeTag === 'ALL' || activeTag === tag);
          const matchesMethod = (activeMethod === 'ALL' || activeMethod === methodUpper);
          const queryText = (path + ' ' + methodUpper + ' ' + (details.summary || '') + ' ' + (details.description || '') + ' ' + tag).toLowerCase();
          const matchesSearch = !searchQuery || queryText.includes(searchQuery);

          if (matchesTag && matchesMethod && matchesSearch) {
            visibleCount++;
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push({ path, method: methodUpper, details });
          }
        }
      }

      document.getElementById('totalCount').textContent = totalCount;
      document.getElementById('visibleCount').textContent = visibleCount;

      if (visibleCount === 0) {
        container.innerHTML = \`
          <div style="text-align:center; padding: 48px; background:var(--surface); border:1px dashed var(--border); border-radius:12px;">
            <p style="font-size:1.1rem; font-weight:600; color:var(--text); margin-bottom:6px;">No matching endpoints found</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">Try searching with different keywords or clearing tag/method filters.</p>
          </div>
        \`;
        return;
      }

      for (const [tagName, items] of Object.entries(tagMap)) {
        if (!items || items.length === 0) continue;

        const tagInfo = SPEC.tags.find(t => t.name === tagName) || { description: '' };
        const section = document.createElement('div');
        section.className = 'tag-section';

        section.innerHTML = \`
          <div class="tag-header">
            <h2 class="tag-title">\${tagName} <span style="font-size:0.75rem; color:var(--text-dim); font-weight:500;">(\${items.length})</span></h2>
            \${tagInfo.description ? \`<p class="tag-desc">\${tagInfo.description}</p>\` : ''}
          </div>
        \`;

        items.forEach((item, idx) => {
          const card = createEndpointCard(item.path, item.method, item.details);
          section.appendChild(card);
        });

        container.appendChild(section);
      }
    }

    function createEndpointCard(path, method, details) {
      const card = document.createElement('div');
      card.className = 'endpoint-card';
      const endpointId = 'ep-' + method.toLowerCase() + '-' + path.replace(/[^a-zA-Z0-9]/g, '-');

      const isSecured = details.security && details.security.length > 0;
      const sampleBody = getSampleRequestBody(details);

      card.innerHTML = \`
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-summary-group">
            <span class="method-badge method-\${method.toLowerCase()}">\${method}</span>
            <span class="endpoint-path">\${path}</span>
            <span class="endpoint-title">\${details.summary || ''}</span>
          </div>
          <div class="endpoint-badges">
            \${isSecured ? '<span class="lock-icon" title="Requires JWT Bearer Auth">🔒 Auth</span>' : ''}
            <span style="color:var(--text-dim); font-size:0.8rem;">▼</span>
          </div>
        </div>

        <div class="endpoint-body">
          <p class="endpoint-desc">\${details.description || 'No description provided.'}</p>

          \${renderParametersTable(details.parameters)}

          \${details.requestBody ? \`
            <div class="section-subtitle">Request Body (application/json)</div>
            <textarea class="code-editor" id="body-\${endpointId}">\${sampleBody}</textarea>
          \` : ''}

          <div class="test-actions">
            <button class="btn btn-primary" onclick="executeEndpoint('\${endpointId}', '\${method}', '\${path}', \${isSecured})">
              ▶ Execute Request
            </button>
            <button class="btn btn-outline" onclick="copyCurl('\${endpointId}', '\${method}', '\${path}')">
              Copy cURL
            </button>
          </div>

          <div class="response-box" id="res-\${endpointId}">
            <div class="response-header">
              <span>Server Response:</span>
              <span class="response-status" id="status-\${endpointId}">200 OK</span>
            </div>
            <pre class="response-content" id="content-\${endpointId}"></pre>
          </div>
        </div>
      \`;

      return card;
    }

    function renderParametersTable(parameters) {
      if (!parameters || parameters.length === 0) return '';
      return \`
        <div class="section-subtitle">Parameters</div>
        <table class="param-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>In</th>
              <th>Description</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            \${parameters.map(p => \`
              <tr>
                <td>
                  <code>\${p.name}</code>
                  \${p.required ? '<span class="param-required">* required</span>' : ''}
                </td>
                <td>\${p.schema ? p.schema.type : 'string'}</td>
                <td><span style="color:var(--text-dim);">\${p.in}</span></td>
                <td>\${p.description || '-'}</td>
                <td>
                  <input type="text" class="param-input" data-param-name="\${p.name}" data-param-in="\${p.in}" value="\${p.schema && p.schema.example ? p.schema.example : (p.schema && p.schema.default !== undefined ? p.schema.default : '')}" />
                </td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      \`;
    }

    function getSampleRequestBody(details) {
      if (!details.requestBody || !details.requestBody.content) return '';
      const jsonContent = details.requestBody.content['application/json'];
      if (!jsonContent || !jsonContent.schema) return '{}';

      const schema = jsonContent.schema;
      if (schema.properties) {
        const obj = {};
        for (const [k, v] of Object.entries(schema.properties)) {
          obj[k] = v.example !== undefined ? v.example : (v.type === 'integer' ? 1 : (v.type === 'boolean' ? true : 'string'));
        }
        return JSON.stringify(obj, null, 2);
      }
      return '{}';
    }

    function toggleCard(headerEl) {
      headerEl.parentElement.classList.toggle('open');
    }

    async function executeEndpoint(endpointId, method, path, isSecured) {
      const serverUrl = document.getElementById('serverSelect').value;
      const cardEl = document.getElementById(endpointId) || document.querySelector('#body-' + endpointId)?.closest('.endpoint-card') || document.querySelector('#res-' + endpointId)?.closest('.endpoint-card');

      let resolvedPath = path;
      const queryParams = new URLSearchParams();

      if (cardEl) {
        cardEl.querySelectorAll('input[data-param-name]').forEach(input => {
          const pName = input.dataset.paramName;
          const pIn = input.dataset.paramIn;
          const pVal = input.value.trim();

          if (pIn === 'path' && pVal) {
            resolvedPath = resolvedPath.replace('{' + pName + '}', encodeURIComponent(pVal));
          } else if (pIn === 'query' && pVal) {
            queryParams.append(pName, pVal);
          }
        });
      }

      const queryString = queryParams.toString();
      const targetUrl = serverUrl + resolvedPath + (queryString ? '?' + queryString : '');

      const headers = {
        'Accept': 'application/json',
      };

      if (isSecured && authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : ('Bearer ' + authToken);
      }

      let reqBody = undefined;
      const bodyEl = document.getElementById('body-' + endpointId);
      if (bodyEl && ['POST', 'PUT', 'PATCH'].includes(method)) {
        headers['Content-Type'] = 'application/json';
        reqBody = bodyEl.value.trim() || undefined;
      }

      const resBox = document.getElementById('res-' + endpointId);
      const statusBadge = document.getElementById('status-' + endpointId);
      const contentBox = document.getElementById('content-' + endpointId);

      resBox.style.display = 'block';
      statusBadge.textContent = 'Executing...';
      statusBadge.className = 'response-status';
      contentBox.textContent = 'Sending request to ' + targetUrl + ' ...';

      const startTime = performance.now();

      try {
        const response = await fetch(targetUrl, {
          method,
          headers,
          body: reqBody,
        });

        const elapsed = Math.round(performance.now() - startTime);
        const statusText = response.status + ' ' + response.statusText;
        statusBadge.textContent = statusText + ' (' + elapsed + 'ms)';

        if (response.status >= 200 && response.status < 300) {
          statusBadge.className = 'response-status status-2xx';
        } else if (response.status >= 400 && response.status < 500) {
          statusBadge.className = 'response-status status-4xx';
        } else {
          statusBadge.className = 'response-status status-5xx';
        }

        const data = await response.json().catch(() => null);
        if (data) {
          contentBox.textContent = JSON.stringify(data, null, 2);
        } else {
          contentBox.textContent = await response.text();
        }
      } catch (err) {
        statusBadge.textContent = 'Request Error';
        statusBadge.className = 'response-status status-5xx';
        contentBox.textContent = 'Network Error: Failed to fetch from ' + targetUrl + '\\n\\nDetails: ' + err.message + '\\n(Make sure the server is running on ' + serverUrl + ' and accessible)';
      }
    }

    function copyCurl(endpointId, method, path) {
      const serverUrl = document.getElementById('serverSelect').value;
      const bodyEl = document.getElementById('body-' + endpointId);
      let curl = \`curl -X \${method} "\${serverUrl}\${path}"\`;
      
      if (authToken) {
        curl += \` -H "Authorization: Bearer \${authToken}"\`;
      }

      if (bodyEl && ['POST', 'PUT', 'PATCH'].includes(method)) {
        curl += \` -H "Content-Type: application/json" -d '\${bodyEl.value.replace(/'/g, "'\\\\''")}'\`;
      }

      navigator.clipboard.writeText(curl).then(() => {
        alert('cURL command copied to clipboard!');
      });
    }

    /* Auth modal handlers */
    function openAuthModal() {
      document.getElementById('tokenInput').value = authToken;
      document.getElementById('authModal').classList.add('open');
    }
    function closeAuthModal() {
      document.getElementById('authModal').classList.remove('open');
    }
    function saveAuthToken() {
      const val = document.getElementById('tokenInput').value.trim();
      authToken = val.replace(/^Bearer\\s+/i, '');
      localStorage.setItem('tf_auth_token', authToken);
      updateAuthBtnState();
      closeAuthModal();
    }
    function clearAuthToken() {
      authToken = '';
      localStorage.removeItem('tf_auth_token');
      document.getElementById('tokenInput').value = '';
      updateAuthBtnState();
      closeAuthModal();
    }
    function updateAuthBtnState() {
      const btn = document.getElementById('authBtn');
      const text = document.getElementById('authBtnText');
      if (authToken) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
        text.textContent = 'Authorized';
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
        text.textContent = 'Authorize';
      }
    }

    /* View Switcher */
    function switchView(view) {
      const fastView = document.getElementById('interactive-view');
      const swaggerView = document.getElementById('swagger-ui-view');
      const fastBtn = document.getElementById('viewFastBtn');
      const swaggerBtn = document.getElementById('viewSwaggerBtn');

      if (view === 'swagger') {
        fastView.style.display = 'none';
        swaggerView.style.display = 'block';
        fastBtn.classList.remove('active');
        swaggerBtn.classList.add('active');
      } else {
        fastView.style.display = 'block';
        swaggerView.style.display = 'none';
        fastBtn.classList.add('active');
        swaggerBtn.classList.remove('active');
      }
    }

    /* Initialize Swagger UI */
    function initSwaggerUI() {
      SwaggerUIBundle({
        spec: SPEC,
        dom_id: '#swagger-ui',
        deepLinking: true,
        filter: true, // Enables Swagger UI search filter!
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    }
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default docsRouter;
