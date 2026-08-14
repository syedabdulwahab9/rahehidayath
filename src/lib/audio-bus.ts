/** One global place that knows what is making sound, so that leaving a page,
 *  navigating back, or sending the app to the background always silences it. */

import { stopSpeaking } from "./tts";

let active: HTMLAudioElement | null = null;

export function setActiveAudio(audio: HTMLAudioElement | null) {
  if (active && active !== audio) {
    active.pause();
    active.src = "";
  }
  active = audio;
}

export function stopAllAudio() {
  if (active) {
    active.pause();
    active.src = "";
    active = null;
  }
  stopSpeaking();
  if (typeof document !== "undefined") {
    document.querySelectorAll("audio").forEach((el) => el.pause());
  }
}
