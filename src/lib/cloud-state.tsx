import { useCallback, useEffect, useRef, useState } from "react";
import type { AppStateKey } from "./app-state";
import { readDeviceState, subscribeDeviceState, writeDeviceState } from "./device-state";

/**
 * One editable section of the website, stored **only on this device**.
 *
 * The admin edits a local draft and "Save changes" writes it to this browser's
 * own storage. It is not sent to the database and it is not shared with any
 * other visitor — but it survives a reload, a closed tab and a restart, so the
 * person who made the change always sees their own version of the site.
 */
export type PublishState = {
  status: "idle" | "saving" | "published" | "error";
  message: string;
  publishedAt: string | null;
};

const merge = <T,>(fallback: T, stored: T): T =>
  typeof stored === "object" && stored !== null && !Array.isArray(stored) && typeof fallback === "object"
    ? ({ ...(fallback as object), ...(stored as object) } as T)
    : stored;

export function useCloudSection<T>(key: AppStateKey, fallback: T) {
  const [published, setPublished] = useState<T>(fallback);
  const [draft, setDraft] = useState<T>(fallback);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<PublishState>({
    status: "idle",
    message: "",
    publishedAt: null,
  });
  const dirtyRef = useRef(false);

  useEffect(() => {
    const load = () => {
      const stored = readDeviceState<T>(key);
      if (stored === null) return;
      const value = merge(fallback, stored);
      setPublished(value);
      /* Never overwrite text the admin is currently typing. */
      if (!dirtyRef.current) setDraft(value);
    };
    load();
    return subscribeDeviceState(key, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const edit = useCallback((next: T) => {
    dirtyRef.current = true;
    setDirty(true);
    setDraft(next);
    setState((s) => ({ ...s, status: "idle", message: "" }));
  }, []);

  const cancel = useCallback(() => {
    dirtyRef.current = false;
    setDirty(false);
    setDraft(published);
    setState({ status: "idle", message: "Changes discarded.", publishedAt: null });
  }, [published]);

  const publish = useCallback(
    async (_section: string, _summary: string) => {
      setState({ status: "saving", message: "Saving to this device…", publishedAt: null });
      try {
        const updatedAt = writeDeviceState(key, draft);
        dirtyRef.current = false;
        setDirty(false);
        setPublished(draft);
        setState({
          status: "published",
          message: "Saved on this device only.",
          publishedAt: updatedAt,
        });
        return true;
      } catch (error) {
        setState({
          status: "error",
          message: `Not saved — ${error instanceof Error ? error.message : "unknown error"}`,
          publishedAt: null,
        });
        return false;
      }
    },
    [draft, key],
  );

  return { draft, published, edit, cancel, publish, dirty, state };
}

/** Read-only access for public pages: this device's saved version of the site. */
export function usePublishedSection<T>(key: AppStateKey, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const load = () => {
      const stored = readDeviceState<T>(key);
      if (stored === null) return;
      setValue(merge(fallback, stored));
    };
    load();
    return subscribeDeviceState(key, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}
