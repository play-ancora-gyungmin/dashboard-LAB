# Signal Writer PRD

## Summary

`Signal Writer` is a new top-level workspace that turns daily Info Hub signals into Threads-ready drafts.

The product goal is not blind auto-posting. The first release should help the user:

1. scan 4-5 meaningful news cards
2. choose one signal
3. generate a post draft and thread version
4. copy the result and post manually

This keeps quality high while reusing the existing Info Hub crawling pipeline.

## Positioning

- Local-first social writing assistant
- Built on top of Info Hub signals
- Designed for daily creator workflow, not mass automation

## User Problem

- The user already has daily crawled signals, but those feeds are too broad to post directly.
- The user wants a faster loop from `news discovery -> post draft`.
- The user wants to grow a Threads account with timely posts, but not spend time manually summarizing everything.

## Primary User Flow

1. Open `Signal Writer` from the sidebar.
2. See 4-5 daily signal cards.
3. Click a card.
4. Click `Generate Draft`.
5. Watch a staged generation screen.
6. Review:
   - hook
   - short post
   - thread version
   - hashtags
7. Copy the result and publish manually.

## MVP Scope

### In

- Sidebar tab
- Daily ranked signal cards
- Locale-aware copy
- Draft generation from one selected signal
- Progress UI during generation
- Copy full post / copy thread
- Local file save of generated drafts

### Out

- Automatic posting to Threads
- Scheduling
- Analytics
- Multi-post calendar
- Social account management

## Reused Infrastructure

- `Info Hub` feed crawling and caching
- existing locale system
- existing copy-to-clipboard UI
- existing OpenAI fallback helper
- existing runtime data directory structure

## New Data Flow

1. `GET /api/signal-writer/signals`
   - loads fresh or cached Info Hub feed data
   - ranks signals
   - returns 4-5 cards
2. `POST /api/signal-writer/generate`
   - receives selected signal
   - generates:
     - hook
     - short post
     - thread posts
     - hashtags
   - saves markdown/json locally
3. client shows staged progress while generation runs

## Sidebar Placement

- place `Signal Writer` after `Info Hub`
- this preserves the workflow:
  - `Info Hub` = read signals
  - `Signal Writer` = turn signals into a post

## Page Structure

### Page 1: Select Signals

- hero
- 4-5 ranked cards
- each card includes:
  - title
  - source
  - short summary
  - why it matters
  - publish time
- CTA:
  - `Generate draft`

### Page 2: Generate Draft

- selected signal summary
- generation stages:
  - collect signal
  - extract key points
  - shape the writing angle
  - draft hook
  - finalize the post

### Page 3: Draft Result

- hook
- short post
- thread version
- hashtags
- copy buttons
- regenerate
- back to signals

## Draft Outputs

### Short Post

- one concise post
- built for quick posting

### Thread Version

- 3-5 connected posts
- first line optimized as hook

### Hashtags

- 3-5 relevant hashtags max

## Storage

- `data/signal-writer/YYYY-MM-DD/<slug>.json`
- `data/signal-writer/YYYY-MM-DD/<slug>.md`

## Success Criteria

- user can create one usable post draft within 30 seconds
- user can copy the result without leaving the app
- user can keep a local daily archive of generated social drafts

## Future Expansion

- duplicate-topic prevention based on previous drafts
- tone profiles
- category filters per account
- direct Threads publishing if the user explicitly wants it
