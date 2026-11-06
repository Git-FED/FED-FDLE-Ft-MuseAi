# FED FDLE Ft MuseAi

A plain-language daily checker that compares one chosen area’s FDLE export with yesterday’s saved list and reports only genuinely new identifiers.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-12%20passing-2ea44f.svg)](#quick-start)
[![Static site](https://img.shields.io/badge/site-GitHub%20Pages%20%2F%20Cloudflare%20Pages-5865F2.svg)](site/DEPLOY.md)

## Why this exists

Checking a registry search by hand every day is repetitive, and a bad or empty export can create a frightening false alarm if it replaces yesterday’s data. It is also easy for a quiet day to be confused with a broken automation.

FED FDLE Ft MuseAi keeps the job deliberately small: one installation represents one area, the first successful run creates a baseline, later runs compare by FDLE person number, and the tool reports only records that are new to that area. Empty or below-floor input leaves the prior snapshot alone. A status log makes operational failures visible instead of silently pretending that nothing changed.

The project does **not** scrape the interactive FDLE search form. Its automatic-download adapter is explicitly unverified until it is tested with a real approved request and current FDLE instructions. Until then, provide a downloaded JSON or CSV export.

## See it work

There is no hosted live demo configured in this repository. The fastest real demo runs locally in a few commands and uses the included synthetic example data. It exercises the same Python entry point used by the daily timer.

### Quick start

```bash
# from the repository root
python3 -m unittest discover -s tests -v

# create a baseline; the first run intentionally prints no alert
rm -f /tmp/fdle-demo-snapshot.json /tmp/fdle-demo-status.jsonl
python3 src/fdle_alert.py \
  --config examples/demo-config.json \
  --today examples/demo-export.json \
  --snapshot /tmp/fdle-demo-snapshot.json \
  --status-log /tmp/fdle-demo-status.jsonl

# run the same export again; it stays quiet because nothing is new
python3 src/fdle_alert.py \
  --config examples/demo-config.json \
  --today examples/demo-export.json \
  --snapshot /tmp/fdle-demo-snapshot.json \
  --status-log /tmp/fdle-demo-status.jsonl

# add a new synthetic record and see the one-record alert
python3 src/fdle_alert.py \
  --config examples/demo-config.json \
  --today examples/demo-export-new.json \
  --snapshot /tmp/fdle-demo-snapshot.json \
  --status-log /tmp/fdle-demo-status.jsonl
```

Main example files:

- [`examples/demo-config.json`](examples/demo-config.json) — a complete test configuration with a clearly synthetic ZIP.
- [`examples/demo-export.json`](examples/demo-export.json) — the baseline export.
- [`examples/demo-export-new.json`](examples/demo-export-new.json) — the same export plus one new synthetic FDLE identifier.
- [`examples/alert-example.md`](examples/alert-example.md) — the intended compact alert shape.

## What the project includes

- `src/fdle_alert.py` — command-line entry point for one comparison run.
- `src/diff.py` — stable-ID comparison and optional known-ID change detection.
- `src/snapshot.py` — JSON snapshot loading plus atomic replacement.
- `src/config.py` — settings validation for area and daily time.
- `src/fetch.py` — opt-in adapter for the documented county-download pattern; not verified for production use.
- `src/check_health.py` — success/failure heartbeat and missed-run detection helpers.
- `src/cron_setup.sh` and `src/cron_reset.sh` — daily and restart-recovery timer helpers.
- `tests/` — 12 tests covering diffing, configuration, fetching, health, and snapshot persistence.
- `site/` — static HTML front end for GitHub Pages or Cloudflare Pages, including the symbol favicon, animations, support page, Discord page, email signup, and FED-OS footer.

## Promotional visuals

These are brand illustrations for the static site, not screenshots of live FDLE data or proof of a production run.

![Playful radar illustration representing a new record alert](site/assets/promo-alert.png)

![Playful sleepy moon and shield illustration representing a quiet unchanged day](site/assets/promo-quiet.png)

## Static website

The website has no build step. Publish the [`site/`](site/) directory directly:

- [GitHub Pages and Cloudflare Pages deployment notes](site/DEPLOY.md)
- [Website homepage](site/index.html)
- [How it works](site/setup.html)
- [Safety page](site/safety.html)
- [Support and donations](site/donations.html)
- [Discord communities](site/discord.html)
- [Join email list](site/join-email.html)

The public site includes external payment, Discord, and Supabase integrations. Provider checkout and account handling remain with those providers.

## Safety and source rules

This is awareness information only. Never approach, threaten, harass, follow, or contact anyone because of a registry listing. Registry addresses may be transient or outdated; positive identification requires fingerprint comparison. An empty result is not a safety guarantee, and this project is not a risk score or complete criminal-history report.

FDLE is the source of record. PBSO SPOT is a reference layer for Palm Beach County. FamilyWatchdog is inspiration only and is never used as the source of record.

## Current limitations and open work

1. The automatic FDLE download route still needs a real, approved verification and format check.
2. The stability of the FDLE person-number field must be confirmed against a real export before production reliance.
3. The user’s actual area and daily time must be chosen; the examples are not defaults.
4. A live FDLE run is not included in this repository.

## Contributing

Keep changes plain-language, testable, and honest about source verification. Do not add real registry data, personal addresses, credentials, or private payment information to examples or commits.

## License

MIT. See [`LICENSE`](LICENSE).
