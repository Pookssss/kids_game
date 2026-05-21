const SOUND_PREF_KEY = "kids_game_sound_enabled";

export function loadGlobalSoundEnabled(defaultValue = true): boolean {
  try {
    const raw = localStorage.getItem(SOUND_PREF_KEY);
    if (raw === null) return defaultValue;
    return raw === "1";
  } catch {
    return defaultValue;
  }
}

export function saveGlobalSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage failures (private mode / blocked storage)
  }
}
