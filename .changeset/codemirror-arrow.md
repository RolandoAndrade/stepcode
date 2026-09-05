---
'@stepcode/codemirror': patch
---

Typing `<-` inserts `←` when the profile accepts it: a new `arrowInput(profile)` extension,
included by `stepcode()` unless `arrow: false`. It declines inside strings and comments, and
under a profile that assigns with `=` or that does not spell the arrow.
