#!/usr/bin/env python3
"""Stamp crm.html with a version, date and content fingerprint.

The fingerprint is the first 12 hex of SHA-256 over the file with the
content attribute of <meta name="crm-build"> blanked, so it covers the
version and date too.  --check verifies without writing.

Rebuilt 21 Sep 2026 after the cloud workspace was reset; verified to
reproduce the v1.43.0 stamp 945c710c99ce exactly."""
import argparse, hashlib, re, sys, io
ap = argparse.ArgumentParser()
ap.add_argument("--file", default="crm.html")
ap.add_argument("--version"); ap.add_argument("--date")
ap.add_argument("--check", action="store_true")
a = ap.parse_args()
s = io.open(a.file, encoding="utf-8").read()
pat = re.compile(r'<meta name="crm-build" content="([0-9a-f]*)" data-built="([^"]*)" data-version="([^"]*)">')
m = pat.search(s)
if not m: sys.exit("no crm-build meta in " + a.file)
def fp(text):
    return hashlib.sha256(pat.sub(lambda mm: '<meta name="crm-build" content="" data-built="%s" data-version="%s">'
                                  % (mm.group(2), mm.group(3)), text, count=1).encode("utf-8")).hexdigest()[:12]
if a.check:
    got = fp(s)
    print(("OK  " if got == m.group(1) else "STALE  ") + "stamp %s, file hashes to %s (v%s, %s)"
          % (m.group(1), got, m.group(3), m.group(2)))
    sys.exit(0 if got == m.group(1) else 1)
ver = a.version or m.group(3); date = a.date or m.group(2)
s = pat.sub('<meta name="crm-build" content="" data-built="%s" data-version="%s">' % (date, ver), s, count=1)
h = fp(s)
s = s.replace('<meta name="crm-build" content=""', '<meta name="crm-build" content="%s"' % h, 1)
io.open(a.file, "w", encoding="utf-8").write(s)
print("Stamped %s  v%s  build %s  (%s)" % (a.file, ver, h, date))
