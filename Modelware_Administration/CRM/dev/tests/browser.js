/* Where Chromium is. Playwright's own download is used unless CRM_CHROMIUM
   names a browser, or the cloud workspace's pre-installed one is present. */
const fs = require('fs');
const cloud = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const exe = process.env.CRM_CHROMIUM || (fs.existsSync(cloud) ? cloud : undefined);
module.exports = exe ? { executablePath: exe } : {};
