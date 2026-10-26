# The Coach

Public speaking, taught and drilled. Five strands, six units each: Voice, Train of thought, Words, Body, Tone. Every unit teaches the skill explicitly, drills it out loud, then applies it to material you already have (the stories, scenarios, passages, phrasebook and vocabulary from The Brief, The Room, The Register, The Floor and The Lectern).

## Publish with GitHub Pages

1. Create a new **public** repository called `the-coach`.
2. **Add file > Upload files** and drag in everything in this folder so `index.html` sits at the top level: `index.html`, `curriculum.js`, `material.js`, `meter.js`, `manifest.webmanifest`, `sw.js`, the `icons` folder and this README. Commit.
3. **Settings > Pages**, **Source** = *Deploy from a branch*, `main`, `/ (root)`, save.
4. Live at `https://djsumd.github.io/the-coach/` after a minute or two.

## Install on the phone

Chrome, three-dot menu, **Install app**. If Chrome's install record is poisoned ("Could not open app"), install from Samsung Internet instead. The first time you start a drill, allow the microphone; the first mirror drill asks for the camera.

## How it works

- **Today**: a ten-minute session. Warm-up (breath, then articulation), the current lesson, three drills (unfinished ones first, then your weakest from earlier units), one applied task. The course rotates through the strands, one unit at a time.
- **Course**: all 30 units. Each has Teach (the lesson, a model done well, the same moment done badly, rules to remember), four Drills and an Apply task.
- **Gym**: free practice on any material: impromptu with a structure, retell a true story, answer a scenario, deliver a passage, clean speech, words in a sentence, diction, lines with a held beat, the mirror.
- **Progress**: minutes spoken, units done, and trends in pace, fillers and rising ends. Every saved take with its numbers and the recording.

## The live meter

While you speak:
- **Pauses** (1 second or longer), **longest pause**, and **rising or falling ends** of each phrase. These are measured on the phone from the sound itself.
- **Words per minute**, **fillers** (um, like, you know, sort of, just, I think, maybe and others) and a **transcript** with the fillers highlighted. These come from Chrome's speech recognition, which sends audio to Google while you speak. You can switch it off in Settings.

Tested on a computer with synthetic speech: pauses, longest pause and rising/falling ends came out exactly right. Not yet tested on your S24. If the transcript stops while recording is on, turn off *Keep takes* in Settings for those drills; some phones won't share the microphone between the two.

Recordings stay on the phone. The backup file carries progress, marks and numbers, not audio.

## Updating

Change `VERSION` at the top of `sw.js` (for example `coach-v2`) whenever any file changes, so installed copies pick it up.
