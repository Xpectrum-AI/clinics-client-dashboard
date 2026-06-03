# Outbound-call identity verification (DOB)

Identity verification is built as a **standalone Dify tool workflow** that the call
agent invokes — the same pattern as the existing `Availability Workflow`. The DOB is
never placed in the call prompt; the agent calls the tool with the date the caller
states, and a Code node does a deterministic match against the value on file.

Decisions in effect:
- **Patient lookup:** reuse the existing `Phone Parser` node (resolve patient by the
  call's phone number). The agent only passes the spoken date of birth.
- **Write-back:** NOT wired yet (verify-only). The dashboard "Identity" column stays
  "—" until the write-back step is added later.

## What the repo provides

| Piece | File | Purpose |
|---|---|---|
| Patient DOB | `date_of_birth` on patient (`api/patients.js`) | Stored as `YYYY-MM-DD`, editable in Add/Edit Patient |
| Lookup endpoint (optional) | `GET /api/calls/detail?call_id=…` (`api/calls-detail.js`) | Not needed for this design — the workflow reads Mongo directly |
| Write-back (for later) | `POST /api/calls/update` (`api/calls-update.js`) | Accepts `{ call_id, identity_verified, verification_method }` |
| Dashboard display | "Identity" column on the Calls page | Shows Verified / Failed / — |

> `date_of_birth` already flows through `Parse(Pat.)` untouched (it returns the whole
> patient document), so no change is needed there.

---

## The `Verify Identity` tool workflow

Mirror the `Availability Workflow` shape:

```
START (spoken_dob)                ← the date the caller says, filled by the agent
   │
   ▼
PHONE PARSER                      ← reuse the SAME node from the booking workflow
   │                                (resolves the called patient's phone)
   ▼
MONGO READ DOCUMENT               ← patients collection, filter { phone: <parsed phone> }
   │
   ▼
CODE  (compare DOB)               ← normalise + match day / month / year
   │
   ▼
END  → verified (String), message (String)
```

### 1. START — input variables
| Variable | Type | Required |
|---|---|---|
| `dob` | String (max 48) | yes (agent fills it with the date of birth the caller says) |

### 2. PHONE PARSER
Copy the `Phone Parser` node from the booking workflow so patient resolution is
identical. Output: the patient's `phone`.

### 3. MONGO READ DOCUMENT
- Collection: `patients`
- Filter: `{ "phone": "{{#phone_parser.phone#}}" }`
- Returns the patient document as a JSON string (same shape `Parse(Pat.)` consumes);
  it now includes `date_of_birth`.

### 4. CODE node
Node inputs: `docs` ← Mongo Read **`json`** output (Array[Object]), `spoken` ← `START.dob`.

```python
import json
import re
from datetime import datetime

MONTHS = {"jan":1,"feb":2,"mar":3,"apr":4,"may":5,"jun":6,
          "jul":7,"aug":8,"sep":9,"oct":10,"nov":11,"dec":12}

def parse_spoken(s):
    if not s:
        return None
    s = str(s).strip().lower()
    s = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", s)            # 5th -> 5
    iso = re.search(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", s)
    if iso:
        return (int(iso.group(1)), int(iso.group(2)), int(iso.group(3)))
    ym = re.search(r"\b(?:19|20)\d{2}\b", s)
    year = int(ym.group(0)) if ym else None
    month = next((n for name, n in MONTHS.items() if name in s), None)
    nums = [int(n) for n in re.findall(r"\b\d{1,2}\b", s)]
    day = nums[0] if nums else None
    if month is None and len(nums) >= 2:                  # numeric "5 3" -> day month
        month = nums[1]
    if year is None:                                      # 2-digit year fallback
        y2 = re.search(r"\b(\d{2})\b\s*$", s)
        if y2:
            yy = int(y2.group(1)); year = 1900+yy if yy > 30 else 2000+yy
    return (year, month, day) if (year and month and day) else None

def _extract_patient(docs):
    # docs may be a list of dicts (json output), a dict, or a JSON string
    if isinstance(docs, str):
        try:
            docs = json.loads(docs.strip('"').replace('\\"', '"'))
        except Exception:
            return {}
    if isinstance(docs, list):
        return docs[0] if docs else {}
    if isinstance(docs, dict):
        return docs
    return {}

def main(docs, spoken):
    patient = _extract_patient(docs)
    dob_on_file = patient.get("date_of_birth")

    on = None
    if dob_on_file:
        try:
            dt = datetime.strptime(str(dob_on_file), "%Y-%m-%d")
            on = (dt.year, dt.month, dt.day)
        except Exception:
            on = None

    if not on:
        return {"verified": "unknown",
                "message": "No date of birth on file; verify the caller by name instead."}

    said = parse_spoken(spoken)
    ok = bool(said and said == on)
    return {"verified": "true" if ok else "false",
            "message": "Identity verified." if ok else "The date of birth did not match our records."}
```

### 5. END — output variables
| Variable | Type | From |
|---|---|---|
| `verified` | String | `Code/verified` (`"true"` / `"false"` / `"unknown"`) |
| `message` | String | `Code/message` |

---

## Connecting it to the call agent (same as `Availability Workflow`)

1. **Publish** the workflow and add it as a **Tool**.
2. Add `Verify Identity` to the call agent's tools.
3. Put the "when to use it" guidance in the **tool description** (tool config, not the
   `Call Inputs (Prompt)` node — that stays unchanged):

   > Verifies the caller's identity before any patient information is shared. Call this
   > tool at the very start of every call, before stating the reason for the call or
   > revealing any appointment, procedure, billing, or health details. Ask the caller to
   > say their date of birth and pass it as `dob`. The tool returns `verified`:
   > - "true"    -> identity confirmed; continue the call normally.
   > - "false"   -> ask the caller to repeat their date of birth once more and call this
   >                tool again. If it is still "false", do NOT share any details; politely
   >                say you cannot verify their identity and ask them to call the dental
   >                office back directly, then end the call.
   > - "unknown" -> no DOB on file; confirm the caller's full name before continuing and
   >                avoid sharing sensitive details if they cannot confirm who they are.

   And set the `dob` input parameter description to:

   > The date of birth exactly as the caller says it (e.g. "March 5th 1992" or "5/3/1992").

Verification level in effect: **name + DOB** — the agent confirms the patient's name
(from the existing call prompt) AND checks the DOB via this tool before disclosing anything.

## Test (seeded demo patients — fabricated DOBs)

> Caveat: `Phone Parser` reads `sys.channel_metadata.caller_phone`, which only exists
> during a real call. In a manual Dify "Run", temporarily hardcode the Mongo filter to a
> known phone (e.g. `{"phone": "919756471143"}`) to test the compare logic, then revert
> it to the `phone` variable chip.

| Patient | Phone (for hardcoded test) | Say to PASS | Say (×2) to FAIL |
|---|---|---|---|
| Yash Thakur | 919756471143 | "March 5th, 1992" | "January 1st, 2000" |
| Tiana Thomas | — | "January 22nd, 1997" | — |

> These are seeded test DOBs (see `scripts/seed-dob.js`). Real patients need real
> DOBs entered via the Add/Edit Patient form before verification is meaningful.

## Still to do (later)

- **Write-back** so the dashboard Identity column fills in: add a Mongo Update (or an
  HTTP POST to `/api/calls/update` with `identity_verified`) after the verification
  result is known. Because verification happens during the live call (after this
  trigger workflow ends), the write-back has to come from the call agent / the
  `Verify Identity` tool, not the trigger workflow.
- Fall back to a **second identifier** (e.g. full name) when no DOB is on file.
- Cap attempts and log failures for the clinic to review.
