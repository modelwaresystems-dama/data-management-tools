#!/usr/bin/env python3
"""Stamp crm.html with a build date and content fingerprint.

The version is NOT this script's to decide. The repo's versioning standard
puts it in one place, <meta name="version" content="X.Y.Z"> in crm.html:
bump it there and only there. This script reads it, copies it to the
folder's index.html (the file the Asset Navigator card reads), and leaves
it alone in crm.html. Before 16 Oct 2026 the number also lived in a
data-version attribute on the crm-build line and this script copied THAT
over the meta, so a bump made the standard way was silently reverted.

The fingerprint is the first 12 hex of SHA-256 over the file with the
content attribute of <meta name="crm-build"> blanked, so it covers the
version and date too.  --check verifies without writing.

--version X.Y.Z is a convenience that writes the meta for you; it is the
same single place, not a second one."""
import argparse, hashlib, re, sys, io, os
ap = argparse.ArgumentParser()
ap.add_argument("--file", default="crm.html")
ap.add_argument("--version"); ap.add_argument("--date")
ap.add_argument("--check", action="store_true")
a = ap.parse_args()
s = io.open(a.file, encoding="utf-8").read()
pat = re.compile(r'<meta name="crm-build" content="([0-9a-f]*)" data-built="([^"]*)">')
vpat = re.compile(r'<meta name="version" content="([^"]*)">')
m = pat.search(s)
if not m: sys.exit("no crm-build meta in " + a.file)
vm = vpat.search(s)
if not vm: sys.exit('no <meta name="version"> in ' + a.file + " - the versioning standard requires it")
if not re.match(r"^\d+\.\d+\.\d+$", vm.group(1)):
    sys.exit('<meta name="version"> says "%s"; it must be MAJOR.MINOR.PATCH' % vm.group(1))

def fp(text):
    return hashlib.sha256(pat.sub(lambda mm: '<meta name="crm-build" content="" data-built="%s">' % mm.group(2),
                                  text, count=1).encode("utf-8")).hexdigest()[:12]

_idx = os.path.join(os.path.dirname(os.path.abspath(a.file)), "index.html")

if a.check:
    ver = vm.group(1)
    if os.path.exists(_idx):
        _im = vpat.search(io.open(_idx, encoding="utf-8").read())
        if not _im:
            print("STALE  index.html has no version meta, so the Navigator card cannot update")
            sys.exit(1)
        if _im.group(1) != ver:
            print("STALE  index.html says %s, the app says %s - the Navigator card would show %s"
                  % (_im.group(1), ver, _im.group(1)))
            sys.exit(1)
    got = fp(s)
    print(("OK  " if got == m.group(1) else "STALE  ") + "stamp %s, file hashes to %s (v%s, %s)"
          % (m.group(1), got, ver, m.group(2)))
    sys.exit(0 if got == m.group(1) else 1)

if a.version:
    if not re.match(r"^\d+\.\d+\.\d+$", a.version): sys.exit("--version must be MAJOR.MINOR.PATCH")
    s = vpat.sub('<meta name="version" content="%s">' % a.version, s, count=1)
ver = vpat.search(s).group(1)
date = a.date or m.group(2)
s = pat.sub('<meta name="crm-build" content="" data-built="%s">' % date, s, count=1)
# The folder's landing page carries the same number, because that is the file
# the Asset Navigator's build-manifest.mjs reads for the card. It read 1.33.0
# while the app was at 1.50.0 for want of this one line.
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
