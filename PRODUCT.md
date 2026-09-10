# LINES

Guess the Vegas lines before they drop. Closest to the number takes the game. Head to head, all season.

This is a Genesis Pro product on InSpatial Cloud. GitHub: `bigmanderson/lines` when Mike asks to upstream. Do not push inspatiallabs.

## Stack

| Piece | Where |
| --- | --- |
| Rules engine | `kit/src/game/` and `cloud/src/game/` (keep in step) |
| NFL slate + live lines | Cloud `nflWeek`, pulled from ESPN DraftKings (optional Odds API overlay) |
| Vue (gold UI) | `vue/` on port **5176** |
| Kit (prototype) | `kit/` on port **6376** |
| Cloud | `cloud/` on port **8104** |

## How it plays

You never see the Vegas number until you lock your card, or the 24-hour window ends. For each game you slide a number — Chiefs by 3, Broncos by 5, pick'em. After both players lock, or the clock hits zero, the book is revealed. Closest to each line wins that game. Most games won takes the week. Season series is tracked per rivalry.

## Weekly lines

Cloud pulls the current (and next) NFL week from ESPN on boot, then every day via an InSpatial `scheduledTask` that calls `lines.syncWeek`. Spreads are DraftKings on the ESPN scoreboard. Set `THE_ODDS_API_KEY` to overlay The Odds API. Once a week has a complete slate, lines freeze so the book cannot move under an open card. Vegas numbers never leave `nflWeek` until reveal.

## Anti-cheat

- Vegas lines never leave the server until reveal.
- Opponent picks stay hidden until both cards are in or the window ends.
- Picks are write-once. No edits after lock.
- Drafts live on the device until lock. An empty card at deadline scores zero.
- Invite links are match-scoped. A second device needs the handle + PIN.

## Cloud entries

- `linesPlayer` — handle, playerId, pin, season wins/losses/ties
- `nflWeek` — fixtures + hidden lines + open/reveal timestamps
- `linesMatch` — code, seats, locked picks, snapshot
- `linesRivalry` — season series between two playerIds
- `scheduledTask` `lines:syncWeek` — daily line pull

## Deploy

Kit and Vue share one GitHub repo (`bigmanderson/lines`) and one Cloud. Two InSpatial apps:

| App | URL | What it is |
| --- | --- | --- |
| `lines` | https://lines.inspatial.app | Kit + Cloud (API + Kit UI) |
| `lines-web` | https://lines-web.inspatial.app | Vue gold UI, talks to the `lines` Cloud |

When the repo is on GitHub, add a second Vercel project:
