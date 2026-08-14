/**
 * FORTREX FX — Google Apps Script Backend
 * With bot protection: honeypot, time trap, email+phone dedup, IP rate limiting
 * 
 * SETUP:
 * 1. Create Google Sheet named "FORTREX FX Registrations"
 * 2. Extensions → Apps Script → paste this code
 * 3. Deploy → New deployment → Web app → Execute as Me → Anyone
 * 4. Copy URL into js/main.js (APPS_SCRIPT_URL)
 */

const SHEET_NAME = 'Registrations';
const BLOCKED_SHEET = 'Blocked';
const MAX_PER_IP_PER_HOUR = 3;
const MIN_FORM_TIME_MS = 4000; // 4 seconds — bots submit too fast

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Name', 'Email', 'Phone', 'Pincode', 'ReferralCode', 'ReferredBy', 'Timestamp', 'IP', 'Fingerprint', 'FormTimeMs']);
  }
  
  if (action === 'count') {
    const count = Math.max(0, sheet.getLastRow() - 1);
    return jsonOutput({ count: count });
  }
  
  if (action === 'leaderboard') {
    const data = sheet.getDataRange().getValues();
    const refCounts = {};
    for (let i = 1; i < data.length; i++) {
      const refCode = data[i][4];
      if (refCode) {
        if (!refCounts[refCode]) refCounts[refCode] = { name: data[i][0], invites: 0 };
        refCounts[refCode].invites++;
      }
    }
    const leaderboard = Object.values(refCounts)
      .sort((a, b) => b.invites - a.invites)
      .slice(0, 10)
      .map(r => ({ name: r.name, invites: r.invites, rex: (r.invites * 50).toLocaleString() }));
    return jsonOutput(leaderboard);
  }
  
  if (action === 'all') {
    const data = sheet.getDataRange().getValues();
    const records = [];
    for (let i = 1; i < data.length; i++) {
      records.push({
        name: data[i][0], email: data[i][1], phone: data[i][2],
        pincode: data[i][3], refCode: data[i][4], refBy: data[i][5],
        timestamp: data[i][6], ip: data[i][7] || '', fingerprint: data[i][8] || ''
      });
    }
    return jsonOutput({ records: records });
  }
  
  return jsonOutput({ status: 'ok' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Name', 'Email', 'Phone', 'Pincode', 'ReferralCode', 'ReferredBy', 'Timestamp', 'IP', 'Fingerprint', 'FormTimeMs']);
    }
    
    // ===== BOT PROTECTION =====
    
    // 1. HONEYPOT — if website field is filled, it's a bot
    if (data.website && data.website.length > 0) {
      logBlocked(data, 'honeypot', ss);
      return jsonOutput({ status: 'success' }); // Pretend success so bot doesn't retry
    }
    
    // 2. TIME TRAP — if submitted in < 4 seconds, likely a bot
    if (data.formTimeMs && data.formTimeMs < MIN_FORM_TIME_MS) {
      logBlocked(data, 'too_fast', ss);
      return jsonOutput({ status: 'success' }); // Pretend success
    }
    
    // 3. EMAIL DEDUP — check if email already exists
    const existing = sheet.getDataRange().getValues();
    const emailLower = (data.email || '').toLowerCase().trim();
    const phoneClean = (data.phone || '').replace(/\D/g, '');
    
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][1] && existing[i][1].toLowerCase().trim() === emailLower) {
        return jsonOutput({ status: 'duplicate', message: 'This email is already registered.' });
      }
      // 4. PHONE DEDUP — same phone number = same person
      const existingPhone = String(existing[i][2] || '').replace(/\D/g, '');
      if (phoneClean.length >= 10 && existingPhone === phoneClean) {
        return jsonOutput({ status: 'duplicate', message: 'This phone number is already registered.' });
      }
    }
    
    // 5. IP RATE LIMITING — max 3 registrations per IP per hour
    const ip = getIP(e);
    if (ip) {
      const now = new Date();
      let ipCount = 0;
      for (let i = 1; i < existing.length; i++) {
        if (existing[i][7] === ip) {
          const rowTime = new Date(existing[i][6]);
          if ((now - rowTime) < 3600000) { // 1 hour
            ipCount++;
            if (ipCount >= MAX_PER_IP_PER_HOUR) {
              logBlocked(data, 'rate_limit', ss);
              return jsonOutput({ status: 'rate_limited', message: 'Too many registrations. Please try later.' });
            }
          }
        }
      }
    }
    
    // 6. VALIDATION — basic field validation
    if (!data.name || data.name.length < 2 || data.name.length > 50) {
      return jsonOutput({ status: 'error', message: 'Invalid name.' });
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return jsonOutput({ status: 'error', message: 'Invalid email.' });
    }
    if (!phoneClean || phoneClean.length < 10) {
      return jsonOutput({ status: 'error', message: 'Invalid phone.' });
    }
    if (!data.pincode || data.pincode.length < 5) {
      return jsonOutput({ status: 'error', message: 'Invalid pincode.' });
    }
    
    // ===== SAVE REGISTRATION =====
    sheet.appendRow([
      data.name,
      data.email,
      data.phone,
      data.pincode,
      data.refCode || '',
      data.refBy || '',
      data.timestamp || new Date().toISOString(),
      ip,
      data.fingerprint || '',
      data.formTimeMs || 0
    ]);
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 7).setNumberFormat('yyyy-MM-dd HH:mm:ss');
    
    return jsonOutput({ status: 'success', message: 'Registration saved.', spotNumber: sheet.getLastRow() - 1 });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

function getIP(e) {
  try {
    return (e.parameter && e.parameter.ip) || '';
  } catch (err) { return ''; }
}

function logBlocked(data, reason, ss) {
  try {
    let blocked = ss.getSheetByName(BLOCKED_SHEET);
    if (!blocked) blocked = ss.insertSheet(BLOCKED_SHEET);
    if (blocked.getLastRow() === 0) {
      blocked.appendRow(['Timestamp', 'Reason', 'Email', 'Phone', 'IP', 'RawData']);
    }
    blocked.appendRow([
      new Date().toISOString(), reason,
      data.email || '', data.phone || '',
      '', JSON.stringify(data).substring(0, 500)
    ]);
  } catch (err) {}
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
