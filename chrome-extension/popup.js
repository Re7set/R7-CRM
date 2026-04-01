// RE7SET CRM Chrome Extension — Popup logic

const SUPABASE_URL = 'https://lamecepfpotprpwnuqsk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbWVjZXBmcG90cHJwd251cXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTMxNjIsImV4cCI6MjA5MDUyOTE2Mn0.oFO_DsLja7OJFkvMSopDMAXp5FmF1uS1tEtQ0lDdE8U';
const CRM_URL = 'https://r7-crm-peach.vercel.app';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation',
};

// Elements
const statusEl = document.getElementById('status');
const scrapedInfo = document.getElementById('scraped-info');
const btnSave = document.getElementById('btnSave');
const btnClear = document.getElementById('btnClear');
const openCRM = document.getElementById('openCRM');

// Show status
function showStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = `status show ${isError ? 'error' : ''}`;
  if (!isError) setTimeout(() => { statusEl.className = 'status'; }, 4000);
}

// On popup open — scrape current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) return;

  chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape' }, (response) => {
    if (chrome.runtime.lastError || !response) return;

    let filled = false;

    if (response.title) {
      // Clean title: remove " - Avocat Paris" type suffixes for cleaner name
      let name = response.title.split('|')[0].split('–')[0].split('-')[0].trim();
      document.getElementById('clientName').value = name;
      filled = true;
    }

    if (response.emails?.length > 0) {
      document.getElementById('email').value = response.emails[0];
      if (response.emails.length > 1) {
        document.getElementById('contactEmail').value = response.emails[1];
      }
      filled = true;
    }

    if (response.phones?.length > 0) {
      document.getElementById('phone').value = response.phones[0];
      filled = true;
    }

    if (response.profession) {
      document.getElementById('profession').value = response.profession;
      filled = true;
    }

    if (response.url) {
      document.getElementById('website').value = response.url;
      filled = true;
    }

    if (response.address) {
      document.getElementById('address').value = response.address;
      filled = true;
    }

    if (filled) {
      scrapedInfo.style.display = 'block';
    }
  });
});

// Clear form
btnClear.addEventListener('click', () => {
  document.querySelectorAll('input').forEach(i => { i.value = ''; });
  document.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
  scrapedInfo.style.display = 'none';
});

// Open CRM
openCRM.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: CRM_URL });
});

// Save to CRM
btnSave.addEventListener('click', async () => {
  const clientName = document.getElementById('clientName').value.trim();
  if (!clientName) {
    showStatus('Le nom du client est requis', true);
    return;
  }

  btnSave.disabled = true;
  btnSave.innerHTML = '<div class="spinner"></div> Envoi...';

  try {
    // 1. Create client
    const clientRes = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: clientName,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        website: document.getElementById('website').value.trim(),
        address: document.getElementById('address').value.trim(),
        status: 'prospect',
      }),
    });

    if (!clientRes.ok) throw new Error('Erreur création client');
    const client = (await clientRes.json())[0];

    // 2. Create contact if provided
    let contactId = null;
    const firstName = document.getElementById('contactFirst').value.trim();
    const lastName = document.getElementById('contactLast').value.trim();
    if (firstName && lastName) {
      const contactRes = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          role: document.getElementById('contactRole').value.trim(),
          email: document.getElementById('contactEmail').value.trim(),
          client_id: client.id,
        }),
      });
      if (contactRes.ok) {
        const contact = (await contactRes.json())[0];
        contactId = contact.id;
      }
    }

    // 3. Create deal if requested
    const createDeal = document.getElementById('createDeal').value === 'yes';
    if (createDeal) {
      const profession = document.getElementById('profession').value || null;
      const barreau = document.getElementById('barreau').value.trim();
      const source = document.getElementById('source').value;

      const dealRes = await fetch(`${SUPABASE_URL}/rest/v1/deals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: clientName,
          client_id: client.id,
          contact_id: contactId,
          stage: 'Réponse positive',
          value: 0,
          mrr: 0,
          mrr_cible: 0,
          probability: 10,
          profession,
          barreau_ordre: barreau,
          source,
        }),
      });
      if (!dealRes.ok) throw new Error('Erreur création deal');
    }

    showStatus(`${clientName} ajouté au CRM !`);

    // Reset form after success
    setTimeout(() => {
      document.querySelectorAll('input').forEach(i => { i.value = ''; });
      scrapedInfo.style.display = 'none';
    }, 1500);

  } catch (err) {
    showStatus(err.message || 'Erreur', true);
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = 'Ajouter au CRM';
  }
});
