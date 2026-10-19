# Linejump

A launch waitlist where each person gets a referral code, valid referrals move the referrer up the queue, and fake referrals are caught and don't count.

## Language

### Input

**Signup log**:
The ordered record of every signup attempt, each with a time, an email, an optional referral code and an IP.
_Avoid_: event stream, history

**Signup**:
One entry in the signup log, whether or not it ends up in the queue.
_Avoid_: registration, entry, user

**Normalized email**:
The canonical form of an email used to decide whether two signups are the same person.
_Avoid_: clean email, canonical address

**Disposable domain**:
An email domain on the throwaway-address list.
_Avoid_: temp domain, burner

### Outcomes

**Duplicate**:
A signup whose normalized email already signed up; it is rejected and never joins the queue.
_Avoid_: repeat, alias signup

**Accepted signup**:
A signup that is not a duplicate and therefore joins the queue.
_Avoid_: member, user, entrant

**Referral code**:
The short code an accepted signup shares so others can name them as referrer.
_Avoid_: invite code, token

**Referral**:
The claim, made by an accepted signup, that someone else's referral code brought them in.
_Avoid_: invite

**Referrer**:
The earliest accepted signup that owns the referral code a referral names.
_Avoid_: inviter, sponsor

**Flag**:
A named reason a referral is not trusted: `unknown_ref`, `disposable`, `same_ip` or `burst`. `duplicate` is also reported as a flag on the rejected signup.
_Avoid_: warning, strike

**Valid referral**:
A referral with no flags; only these move the referrer up.
_Avoid_: good referral, counted referral

### Queue

**Queue**:
All accepted signups ordered by rank, then join index.
_Avoid_: waitlist (the product), leaderboard

**Join index**:
The 0-based order of an accepted signup among accepted signups.
_Avoid_: signup number, id

**Rank**:
Join index minus five per valid referral; lower is better.
_Avoid_: score, priority

**Position**:
The 1-based place in the queue; duplicates have none.
_Avoid_: spot, rank

### Product

**Replay**:
Stepping through the committed signup log to watch positions change.
_Avoid_: simulation, playback

**Outbox**:
The on-screen list of "you moved up" messages that would have been emailed when no mail key is set.
_Avoid_: inbox, mail log

**Demo mode**:
Running with no environment variables: committed fixtures and the outbox stand in for every external service.
_Avoid_: offline mode, mock mode

**Live mode**:
Running with a mail key set, so "you moved up" messages are actually sent.
_Avoid_: production mode
