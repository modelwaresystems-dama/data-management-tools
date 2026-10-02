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
    vm = re.search(r'<meta name="version" content="([^"]*)">', s)
    if vm and vm.group(1) != m.group(3):
        print("STALE  the repo version meta says %s, the build line says %s" % (vm.group(1), m.group(3)))
        sys.exit(1)
    import os as _os
    _idx = _os.path.join(_os.path.dirname(_os.path.abspath(a.file)), "index.html")
    if _os.path.exists(_idx):
        _im = re.search(r'<meta name="version" content="([^"]*)">', io.open(_idx, encoding="utf-8").read())
        if not _im:
            print("STALE  index.html has no version meta, so the Navigator card cannot update")
            sys.exit(1)
        if _im.group(1) != m.group(3):
            print("STALE  index.html says %s, the app says %s - the Navigator card would show %s"
                  % (_im.group(1), m.group(3), _im.group(1)))
            sys.exit(1)
    got = fp(s)
    print(("OK  " if got == m.group(1) else "STALE  ") + "stamp %s, file hashes to %s (v%s, %s)"
          % (m.group(1), got, m.group(3), m.group(2)))
    sys.exit(0 if got == m.group(1) else 1)
ver = a.version or m.group(3); date = a.date or m.group(2)
s = pat.sub('<meta name="crm-build" content="" data-built="%s" data-version="%s">' % (date, ver), s, count=1)
# The repo's versioning standard: one number, written in both places by this
# script so it is never typed twice (project rule 1-2).
vpat = re.compile(r'<meta name="version" content="[^"]*">')
if vpat.search(s): s = vpat.sub('<meta name="version" content="%s">' % ver, s, count=1)
# The folder's landing page carries the same number, because that is the file
# the Asset Navigator's build-manifest.mjs reads for the card. It read 1.33.0
# while the app was at 1.50.0 for want of this one line.
import os
_idx = os.path.join(os.path.dirname(os.path.abspath(a.file)), "index.html")
if os.path.exists(_idx):
    _s = io.open(_idx, encoding="utf-8").read()
    if vpat.search(_s):
        io.open(_idx, "w", encoding="utf-8").write(vpat.sub('<meta name="version" content="%s">' % ver, _s, count=1))
        print("  index.html -> v%s (the Navigator card reads this)" % ver)
    else:
        print("  WARNING: index.html has no <meta name=\"version\"> - the Navigator card will not update")
h = fp(s)
s = s.replace('<meta name="crm-build" content=""', '<meta name="crm-build" content="%s"' % h, 1)
io.open(a.file, "w", encoding="utf-8").write(s)
print("Stamped %s  v%s  build %s  (%s)" % (a.file, ver, h, date))
