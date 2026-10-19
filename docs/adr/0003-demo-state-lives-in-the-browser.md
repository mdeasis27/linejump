# Demo state lives in the browser, no database

The app must work fully with no environment variables, so there is no database. The committed signup log is bundled; signups a visitor adds are appended to an in-browser copy of the log (persisted in `localStorage`) and the engine recomputes the queue. The admin view is a tab on the product page with no authentication, because it only ever shows the visitor's own demo data. A real deployment would put the log behind a server store and auth; that is out of scope.
