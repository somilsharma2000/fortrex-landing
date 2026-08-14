/**
 * FORTREX FX — Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://sheets.google.com → Create a new Google Sheet
 * 2. Name it "FORTREX FX Registrations"
 * 3. Add headers in row 1: Name | Email | Phone | Pincode | ReferralCode | ReferredBy | Timestamp
 * 4. In the sheet, go to Extensions → Apps Script
 * 5. Delete the default code, paste this entire file
 * 6. Click Deploy → New deployment → Web app
 *    - Description: "FORTREX FX Landing Backend"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the deployment URL
 * 8. Paste it into js/main.js (APPS_SCRIPT_URL) and admin.html (APPS_SCRIPT_URL)
 * 9. Also add the URL to the sheet in admin.html
 */

// ===== CONFIG =====
const SHEET_NAME = 'Registrations';

/**
 * Handle GET requests — returns registration count or all data
 */
function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  // Ensure headers
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Name', 'Email', 'Phone', 'Pincode', 'ReferralCode', 'ReferredBy', 'Timestamp']);
  }
  
  if (action === 'count') {
    const count = Math.max(0, sheet.getLastRow() - 1);
    return jsonOutput({ count: count });
  }
  
  if (action === 'leaderboard') {
    const data = sheet.getDataRange().getValues();
    const refCounts = {};
    for (let i = 1; i < data.length; i++) {
      const refCode = data[i][4]; // ReferralCode column
      if (refCode) {
        if (!refCounts[refCode]) {
          refCounts[refCode] = { name: data[i][0], invites: 0, rex: 0 };
        }
        refCounts[refCode].invites++;
      }
    }
    const leaderboard = Object.values(refCounts)
      .sort((a, b) => b.invites - a.invites)
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        invites: r.invites,
        rex: (r.invites * 50).toLocaleString()
      }));
    return jsonOutput(leaderboard);
  }
  
  if (action === 'all') {
    const data = sheet.getDataRange().getValues();
    const records = [];
    for (let i = 1; i < data.length; i++) {
      records.push({
        name: data[i][0],
        email: data[i][1],
        phone: data[i][2],
        pincode: data[i][3],
        refCode: data[i][4],
        refBy: data[i][5],
        timestamp: data[i][6]
      });
    }
    return jsonOutput({ records: records });
  }
  
  return jsonOutput({ status: 'ok', message: 'FORTREX FX backend is running.' });
}

/**
 * Handle POST requests — new registration
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    
    // Ensure headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Name', 'Email', 'Phone', 'Pincode', 'ReferralCode', 'ReferredBy', 'Timestamp']);
    }
    
    // Check for duplicates
    const existing = sheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][1] === data.email) {
        return jsonOutput({ status: 'duplicate', message: 'Email already registered.' });
      }
    }
    
    // Append new registration
    sheet.appendRow([
      data.name,
      data.email,
      data.phone,
      data.pincode,
      data.refCode || '',
      data.refBy || '',
      data.timestamp || new Date().toISOString()
    ]);
    
    // Auto-format the timestamp column
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 7).setNumberFormat('yyyy-MM-dd HH:mm:ss');
    
    return jsonOutput({ status: 'success', message: 'Registration saved.' });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

/**
 * Helper — return JSON output
 */
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
