import { onMounted } from "vue";

type KeyDescriptor = string;
type KeyHandler = (e: KeyboardEvent) => void;

type ShortcutRegistration = {
  descriptor: KeyDescriptor;
  handler: KeyHandler;
};

const handlers: ShortcutRegistration[] = [];
let isListening = false;

function normalizeDescriptor(descriptor: string): string {
  return descriptor.toLowerCase().trim();
}

function matchesDescriptor(e: KeyboardEvent, descriptor: string): boolean {
  const parts = descriptor.toLowerCase().split("+").map(p => p.trim());
  const keyPart = parts[parts.length - 1];

  const requireShift = parts.includes("shift");
  const requireCtrl = parts.includes("ctrl") || parts.includes("control");
  const requireAlt = parts.includes("alt");
  const requireMeta = parts.includes("meta") || parts.includes("cmd") || parts.includes("command");

  const key = e.key.toLowerCase() === " " ? "space" : e.key.toLowerCase();
  const targetKey = keyPart === " " ? "space" : keyPart;

  const modifiersMatch
    = requireShift === e.shiftKey
      && requireCtrl === e.ctrlKey
      && requireAlt === e.altKey
      && requireMeta === e.metaKey;

  if (!modifiersMatch)
    return false;

  return key === targetKey;
}

function keydownListener(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  if (!target)
    return;

  const tag = target.tagName;
  if (["INPUT", "TEXTAREA"].includes(tag) || target.isContentEditable) {
    return;
  }

  for (const { descriptor, handler } of handlers) {
    if (matchesDescriptor(e, descriptor)) {
      e.preventDefault();
      e.stopPropagation();
      handler(e);
      break;
    }
  }
}

function ensureListener() {
  if (isListening || typeof window === "undefined")
    return;
  window.addEventListener("keydown", keydownListener);
  isListening = true;
}

export function useKeyboard() {
  onMounted(() => {
    ensureListener();
  });

  function addGlobalShortcut(
    descriptor: KeyDescriptor | KeyDescriptor[],
    handler: KeyHandler,
  ) {
    const list = Array.isArray(descriptor) ? descriptor : [descriptor];

    for (const d of list) {
      const normalized = normalizeDescriptor(d);
      if (!handlers.some(h => h.descriptor === normalized)) {
        handlers.push({ descriptor: normalized, handler });
      }
    }
  }

  function removeGlobalShortcut(descriptor: KeyDescriptor | KeyDescriptor[]) {
    const list = Array.isArray(descriptor) ? descriptor : [descriptor];
    for (const d of list) {
      const normalized = normalizeDescriptor(d);
      const index = handlers.findIndex(h => h.descriptor === normalized);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  function createElementKeyHandler(
    callback: KeyHandler,
    keys: KeyDescriptor[] = ["enter", "space"],
  ) {
    return (e: KeyboardEvent) => {
      for (const k of keys) {
        if (matchesDescriptor(e, k)) {
          e.preventDefault();
          callback(e);
          break;
        }
      }
    };
  }

  return {
    addGlobalShortcut,
    removeGlobalShortcut,
    createElementKeyHandler,
    matchesDescriptor,
  };
}
