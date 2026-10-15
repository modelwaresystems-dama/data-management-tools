# MP4 fallback — making decks work for people without the add-in

**Why this exists.** The Modelware Asset Viewer renders live only for people who have
the add-in installed. Email a .pptx to a prospect who doesn't, and the add-in box is
blank. So for any deck you hand out, drop a short **recorded MP4** of the asset onto the
slide. You present the live, interactive version; everyone else sees the recording play.
This is the "hybrid" half of the plan — same slide, two experiences.

> Rule of thumb: **live add-in for you, MP4 for the room.** Put both on the slide.

---

## 1. Record the asset (Windows — your machine)

1. Open the asset live in Chrome/Edge at a comfortable size:
   `https://modelwaresystems-dama.github.io/data-management-tools/Powerpoint_Viewer/docs/hub/a/<your-asset>.html`
2. Press **`Win + Alt + R`** (Xbox Game Bar) to start recording the active window.
   - First time: `Win + G` opens Game Bar; allow screen recording if prompted.
   - Alternative: **Snipping Tool → Record** (Windows 11) for a region grab.
3. Interact slowly and deliberately — click the few things you want the viewer to see.
   Keep it **short: 15–40 seconds**. A tight loop beats a long tour.
4. Press **`Win + Alt + R`** again to stop. The MP4 lands in
   `Videos\Captures\` by default.
5. Trim the dead ends in **Clipchamp** (built into Windows 11) or PowerPoint's own
   **Video → Trim** after inserting.

*(Mac equivalent: `Shift + Cmd + 5` → Record Selected Portion → stop from the menu bar.)*

---

## 2. Put it on the slide

1. In PowerPoint: **Insert → Video → This Device…** and pick the MP4.
2. Position and size it to **match the add-in box** (same spot, same footprint) so the
   handout looks identical to your live version. Tip: note the add-in box's position via
   **Shape Format → Size & Position**, then set the video to the same numbers.
3. Select the video → **Playback** tab, and set:
   - **Start: Automatically** (plays as the slide opens)
   - **Loop until Stopped** ✔ (so it keeps running during discussion)
   - **Play Full Screen** ✘ (keep it in place on the slide)
   - **Mute** if the recording has no useful audio
4. Optional: **Video Format → Poster Frame → Current Frame** so a clean still shows
   before it starts.

---

## 3. Which version a viewer sees

| Viewer | What plays |
|---|---|
| You, add-in installed, presenting | The **live** interactive asset (put the video *behind* or beside it) |
| Teammate with the add-in deployed | Live asset loads automatically |
| Prospect / client without the add-in | The **MP4** plays — no install, no blank box |
| Anyone, any follow-up | Send them the **hub link** for the fully live version in a browser |

---

## Keep it tidy

- Store recordings in a `recordings/` subfolder next to the deck, or embed them in the
  .pptx (Insert → Video embeds by default, which keeps the file self-contained but larger).
- **720p or 1080p** is plenty; short clips keep the .pptx small enough to email.
- Re-record only the asset that changed — one MP4 per asset, reused across decks.
- For a tiny, silent, always-looping micro-interaction, a **GIF** also works
  (Windows: **ScreenToGif**). MP4 is better for anything longer than a few seconds.
