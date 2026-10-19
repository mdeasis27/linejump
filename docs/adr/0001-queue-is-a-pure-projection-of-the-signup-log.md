# The queue is a pure projection of the signup log

Every view of the queue (CLI `process`, CLI `eval`, the replay, the admin view, the "Compare" numbers) is produced by one pure, synchronous engine function that takes the full signup log plus the disposable-domain set and recomputes everything from scratch. We chose full recomputation over incremental state updates because the graded rules depend on order and time windows (`same_ip`, `burst`, rank ties), logs are small (tens to thousands of lines), and one code path means the UI can never disagree with the graded CLI.

## Consequences

- The UI "moved up" detection diffs two engine results (before and after a signup) instead of tracking deltas.
- If logs ever grow to millions of lines this needs an incremental engine; the function signature stays the same.
