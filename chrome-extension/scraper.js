// Content script — scrape useful info from the current page

function scrapePageData() {
  const data = {
    url: window.location.href,
    domain: window.location.hostname,
    title: '',
    emails: [],
    phones: [],
    address: '',
    description: '',
    profession: '',
  };

  // Page title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  data.title = ogTitle?.content || document.title || '';

  // Description
  const metaDesc = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
  data.description = metaDesc?.content || '';

  // Get all visible text
  const bodyText = document.body?.innerText || '';

  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = bodyText.match(emailRegex) || [];
  // Also check mailto links
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    const email = a.href.replace('mailto:', '').split('?')[0];
    if (email && !emailMatches.includes(email)) emailMatches.push(email);
  });
  data.emails = [...new Set(emailMatches)].slice(0, 5);

  // Extract phone numbers (French format)
  const phoneRegex = /(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g;
  const phoneMatches = bodyText.match(phoneRegex) || [];
  // Also check tel links
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    const phone = a.href.replace('tel:', '').trim();
    if (phone && !phoneMatches.includes(phone)) phoneMatches.push(phone);
  });
  data.phones = [...new Set(phoneMatches.map(p => p.trim()))].slice(0, 3);

  // Try to detect profession
  const textLower = bodyText.toLowerCase();
  if (textLower.includes('avocat') || textLower.includes('barreau') || textLower.includes('maître') || textLower.includes('cabinet d\'avocats')) {
    data.profession = 'avocat';
  } else if (textLower.includes('notaire') || textLower.includes('office notarial') || textLower.includes('étude notariale')) {
    data.profession = 'notaire';
  } else if (textLower.includes('huissier') || textLower.includes('commissaire de justice')) {
    data.profession = 'commissaire_de_justice';
  } else if (textLower.includes('expert-comptable') || textLower.includes('expertise comptable') || textLower.includes('cabinet comptable')) {
    data.profession = 'expert_comptable';
  }

  // Try to find address (look for common patterns)
  const addressRegex = /\d{1,4}[\s,]+(?:rue|avenue|boulevard|place|impasse|allée|chemin|cours|passage|voie)[^,\n]{5,60},?\s*\d{5}\s+[A-ZÀ-Ü][a-zà-ü]+/gi;
  const addressMatch = bodyText.match(addressRegex);
  if (addressMatch) {
    data.address = addressMatch[0].trim();
  }

  return data;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    sendResponse(scrapePageData());
  }
  return true;
});
