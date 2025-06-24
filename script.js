const API_BASE_URL = 'https://web-auth-nz74yizzl-danis-projects-3f247b67.vercel.app'; // Ganti dengan URL API Anda
let apiKey = "Dani***Sigma";

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKey');
const logContent = document.getElementById('logContent');
const authContent = document.getElementById('authContent');
const refreshLogsBtn = document.getElementById('refreshLogs');
const clearLogsBtn = document.getElementById('clearLogs');
const refreshAuthBtn = document.getElementById('refreshAuth');
const saveAuthBtn = document.getElementById('saveAuth');
const statusBar = document.getElementById('status');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
apiKeyInput.value = apiKey;
loadLogs();
loadAuthData();

// Event Listeners
saveKeyBtn.addEventListener('click', saveApiKey);
refreshLogsBtn.addEventListener('click', loadLogs);
clearLogsBtn.addEventListener('click', clearLogs);
refreshAuthBtn.addEventListener('click', loadAuthData);
saveAuthBtn.addEventListener('click', saveAuthData);

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    switchTab(tabId);
  });
});

// Functions
function saveApiKey() {
  apiKey = apiKeyInput.value.trim();
  localStorage.setItem('apiKey', apiKey);
  showStatus('API Key disimpan', 'success');
}

function switchTab(tabId) {
  tabBtns.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

async function loadLogs() {
  try {
    showStatus('Memuat logs...');
    const response = await fetch(`${API_BASE_URL}/logs`);
    if (!response.ok) throw new Error('Gagal memuat logs');
    const logs = await response.text();
    logContent.textContent = logs || 'Log kosong';
    showStatus('Logs berhasil dimuat', 'success');
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
    logContent.textContent = `Gagal memuat logs: ${error.message}`;
  }
}

async function clearLogs() {
  if (!confirm('Yakin ingin menghapus semua logs?')) return;
  
  try {
    showStatus('Menghapus logs...');
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'DELETE',
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) throw new Error('Gagal menghapus logs');
    await loadLogs();
    showStatus('Logs berhasil dihapus', 'success');
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  }
}

async function loadAuthData() {
  try {
    showStatus('Memuat data auth...');
    const response = await fetch(`${API_BASE_URL}/auth`);
    if (!response.ok) throw new Error('Gagal memuat data auth');
    const data = await response.json();
    authContent.value = JSON.stringify(data, null, 2);
    showStatus('Data auth berhasil dimuat', 'success');
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
    authContent.value = `Gagal memuat data auth: ${error.message}`;
  }
}

async function saveAuthData() {
  try {
    const data = JSON.parse(authContent.value);
    showStatus('Menyimpan data auth...');
    
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Gagal menyimpan data auth');
    showStatus('Data auth berhasil disimpan', 'success');
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  }
}

function showStatus(message, type = 'info') {
  statusBar.textContent = message;
  statusBar.style.color = '';
  
  if (type === 'error') {
    statusBar.style.color = 'red';
  } else if (type === 'success') {
    statusBar.style.color = 'green';
  }
}
