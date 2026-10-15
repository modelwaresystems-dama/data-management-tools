// Generates manifests/asset-1.xml .. asset-N.xml — one numbered content add-in
// per slot. Each gets its OWN <Id> GUID, which is what makes Office keep a
// separate settings bag per slot (so slides stop clobbering each other).
//
// USAGE:
//   1. Set BASE_URL below to your live GitHub Pages site (no trailing slash).
//   2. If you ever need more/fewer slots, add/remove GUIDs (keep them unique —
//      generate with: node -e "console.log(crypto.randomUUID())").
//   3. Run:  node tools/generate-manifests.mjs
//
// Then upload the manifests to M365 Admin Center (one Deploy Add-in per file),
// or sideload them. See README.md.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ====== EDIT THESE ======
const BASE_URL = "https://modelwaresystems-dama.github.io/data-management-tools/Powerpoint_Viewer/docs";
const PROVIDER = "Modelware Systems";
const SUPPORT_URL = "https://www.modelwaresystems.com";
// One stable GUID per slot. Do not reuse a GUID across two add-ins.
const GUIDS = [
  "056ca8aa-c748-4ebc-92e3-05e1b7c2f725",
  "dd29673c-0310-4b05-987b-12f49a8acbdc",
  "916c5cd1-671d-4f4b-99ef-d362af1dbd2d",
  "782e48dd-c7ac-4e8c-9af9-c85b5b4b5867",
  "b014beb8-1d11-4626-b5b3-60d044f288ac",
  "f47cdc39-0814-4fe2-8472-92cf58a0f25a",
  "b2609ece-789b-4b49-b7ea-ca588ed92621",
  "962c6df0-9fca-477c-9678-71a28930bfed"
];
// ========================

const origin = new URL(BASE_URL).origin;
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "manifests");
mkdirSync(outDir, { recursive: true });

function manifest(n, guid) {
  const src = `${BASE_URL}/index.html?slot=${n}&label=${encodeURIComponent("Asset " + n)}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:type="ContentApp">
  <Id>${guid}</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>${PROVIDER}</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Modelware Asset ${n}" />
  <Description DefaultValue="Embed a live interactive Modelware asset on a slide (slot ${n})." />
  <IconUrl DefaultValue="${BASE_URL}/assets/icon-32.png" />
  <HighResolutionIconUrl DefaultValue="${BASE_URL}/assets/icon-80.png" />
  <SupportUrl DefaultValue="${SUPPORT_URL}" />
  <AppDomains>
    <AppDomain>${origin}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Presentation" />
  </Hosts>
  <DefaultSettings>
    <SourceLocation DefaultValue="${src}" />
    <RequestedWidth>960</RequestedWidth>
    <RequestedHeight>540</RequestedHeight>
  </DefaultSettings>
  <Permissions>ReadWriteDocument</Permissions>
</OfficeApp>
`;
}

GUIDS.forEach((guid, i) => {
  const n = i + 1;
  const file = join(outDir, `asset-${n}.xml`);
  writeFileSync(file, manifest(n, guid), "utf8");
  console.log("wrote", file);
});
console.log(`\nDone — ${GUIDS.length} manifests. BASE_URL = ${BASE_URL}`);
console.log("Remember to re-run this after changing BASE_URL.");
