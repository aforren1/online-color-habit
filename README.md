https://actlab-colorific.netlify.app

local devel: `npm run start` (no data saving, but everything else)
(`netlify dev` to try bundled version + netlify fns)

# Setup

1. Install npm
2. `npm install` (& go do something else...)
3. `netlify login`
4. Make a remote github repo
5. `netlify init` & follow prompts

# Notes

- Doing a netlify app, because we'll just use uniform distributions for timed response
- We _could_ do a heroku app to allow adaptive process via python, but that adds complexity of having and communicating with the server
- Use localStorage to track ID, session number (and thus task type)
- For free RT, pre-fixed trial order (so randomization is proper)
- For forced RT, pre-fixed trial order but on-the-fly preparation time generation
- Right hand only for simplicity for now (keyboard use is pretty bimanual, so should be ok?)
- Use chartjs to show progression (speed one axis, accuracy another)
- Add debug version to check timing via photosensor
- Should probably recommend folks use Chrome or Chromium-based browsers, which have better timing qualities (e.g. new Edge)
- Ask folks to _please_ use the same browser for entire task (we can't do cross-browser localStorage)
- (done, and seems to work!) Set the following for Firefox's sake (might allow for higher-res timers in FF79+? See bottom of https://developer.mozilla.org/en-US/docs/Web/API/Performance/now):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

See https://docs.netlify.com/routing/headers/#syntax-for-the-headers-file.

- NB that netlify lambda functions run for 10sec max, so any retries need to happen within that limit

Two spaced colors, two massed.
One spaced and one massed are switched.
Example config:

- h spaced switch
- u massed same
- i spaced same
- l massed switch

Each practice unit is 250 trials? So a spaced session would be 500 trials total (250 per stim), and the massed (to make up for 4 days) would be 2000 (which seems like a lot...)

- Have breaks every 75-100 trials for sanity (but that's baked into the day, no need to specify separate blocks)
- For those breaks, have the short bit as a "warm up" block

Free RT details:

- beep + immediate image shown
- if correct, few hundred ms of feedback and continue
- If incorrect, red something and 1s of delay before _retry_ (which should be correct b/c for most/all situations, there are only two options)

Forced RT details:

- 900-1000ms max (1200 from paper seemed a little long)
- If we do adaptive, need to use server for now. If we do uniform, it works fine

Order:

Free RT intro (show four boxes in arc shape, fill in the selected one)
Timed response intro (four slots, square jumps from neutral one)?
color free RT intro (square in center, fills in with color)
color free RT (if we're only training 2, should we have some sanity check to make sure they have fingers in all the right places?)
color timed response (just square moving down center, gray to color)

---

[day 1]
25 free RT per finger [baseline free RT measure?]
5 consecutive criterion for single forced RT finger [familiarization with forced RT]
250 forced RT per finger [baseline for finger-specific performance]
25 free RT per color (4 colors) [light intro to all key/finger mappings]
spaced #1 (250 per color, 2 colors)

[day 2]
spaced #2 (250 per color, 2 colors)
[day 3]
spaced #3 (250 per color, 2 colors)
[day 4]
spaced #4 (250 per color, 2 colors)

[day 5]
massed #1 (1000 per color, 2 colors)
5 free RT per color (4 colors) [light warmup block]
250 forced RT per color (4 colors) [perf improvement after N days]
25 free RT per color (4 colors, remapped) [light intro to remapping]
250 forced RT per color (4 colors, remapped) [get the critical habit data]
(non-color forced RT needed at some point this day? nice for general motor improvement??)

## 250 forced RT per finger

Colors:

http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#ff007d,bd5e00,009800,00a0ff

'#ff007d', '#bd5e00', '#009800', '#00a0ff' (neutral/gray is '#777777')

background: '#222222'
