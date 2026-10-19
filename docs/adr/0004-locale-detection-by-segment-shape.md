# Unknown locales are detected by the shape of the first path segment

The brief requires both "any path without a locale redirects to `/en…`" and "an unknown locale returns 404", which conflict for a path like `/fr/app`. We treat a first segment matching `^[a-z]{2}(-[a-z]{2})?$` (case-insensitive) as a locale attempt: `en` and `es` are served, any other such segment is a 404. Every other path gets `/en` prefixed with the query string kept. The cost is that a real two-letter page slug (for example `/ui`) could never exist without a locale prefix, which this app never needs.
