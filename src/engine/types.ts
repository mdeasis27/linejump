export type Signup = { ts: string; email: string; ref?: string | null; ip: string };

export type Flag = "duplicate" | "unknown_ref" | "disposable" | "same_ip" | "burst";

export type Evidence = {
  /** log index of the signup this one duplicates */
  duplicateOf?: number;
  /** log index of the referrer */
  referrer?: number;
  /** hours between the referrer joining and this signup */
  hoursSinceReferrer?: number;
  /** accepted signups on this code inside the burst window, including this one */
  burstCount?: number;
  domain?: string;
};

export type Entry = {
  index: number;
  email: string;
  normalized: string;
  code: string | null;
  flags: Flag[];
  position: number | null;
  joinIndex: number | null;
  validReferrals: number;
  rank: number | null;
  ref: string | null;
  evidence: Evidence;
};

export type CliSignup = {
  email: string;
  code: string | null;
  flags: Flag[];
  position: number | null;
};

export type CliResult = { signups: CliSignup[] };
