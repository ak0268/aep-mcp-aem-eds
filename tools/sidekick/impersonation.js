const STORAGE_KEY = "eds-impersonation-email";
const EMAIL_NAMESPACE = "Email";
const SIDEKICK_EXTENSION_ID = "igkmdomcgoebiipaifhmpfjhbjccggml";
const PLUGIN_ID = "impersonation";

const getStoredEmail = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch (e) {
    console.warn("Impersonation: unable to read storage", e);
    return "";
  }
};

const persistEmail = (email) => {
  try {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Impersonation: unable to persist email", e);
  }
};

const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

const getTopWindowAlloy = () => {
  try {
    return window.top.alloy;
  } catch (e) {
    console.warn("Impersonation: cannot access top window", e);
    return null;
  }
};

const applyIdentity = async (email) => {
  const alloy = getTopWindowAlloy();
  if (typeof alloy !== "function") {
    throw new Error("Alloy not available on the page");
  }
  const identityMap = {
    [EMAIL_NAMESPACE]: [
      {
        id: email,
        primary: true,
      },
    ],
  };
  return alloy("sendEvent", {
    xdm: {
      identityMap,
    },
  });
};

const clearIdentity = async () => {
  const alloy = getTopWindowAlloy();
  if (typeof alloy !== "function") {
    throw new Error("Alloy not available on the page");
  }
  return alloy("sendEvent", {
    xdm: {
      identityMap: {
        [EMAIL_NAMESPACE]: [],
      },
    },
  });
};

const closePopover = () => {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage(SIDEKICK_EXTENSION_ID, {
        action: "closePopover",
        id: PLUGIN_ID,
      });
    }
  } catch (e) {
    console.warn("Impersonation: unable to close popover", e);
  }
};

const showError = (message) => {
  const errorEl = document.getElementById("error-message");
  if (errorEl) {
    errorEl.textContent = message;
  }
};

const clearError = () => {
  const errorEl = document.getElementById("error-message");
  if (errorEl) {
    errorEl.textContent = "";
  }
};

const setLoading = (loading) => {
  const applyBtn = document.getElementById("apply-btn");
  const clearBtn = document.getElementById("clear-btn");
  if (applyBtn) applyBtn.disabled = loading;
  if (clearBtn) clearBtn.disabled = loading;
};

const init = () => {
  const form = document.getElementById("impersonation-form");
  const input = document.getElementById("email-input");
  const applyBtn = document.getElementById("apply-btn");
  const clearBtn = document.getElementById("clear-btn");
  const closeBtn = document.getElementById("close-btn");

  if (!form || !input || !applyBtn || !clearBtn || !closeBtn) {
    console.warn("Impersonation: form elements not found");
    return;
  }

  if (input) {
    input.value = getStoredEmail();
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = input.value.trim();
      if (!email) {
        showError("Email is required.");
        return;
      }
      if (!validateEmail(email)) {
        showError("Enter a valid email address.");
        return;
      }
      clearError();
      setLoading(true);
      try {
        await applyIdentity(email);
        persistEmail(email);
        closePopover();
        // Reload the page to apply impersonation
        try {
          window.top.location.reload();
        } catch (e) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Impersonation failed", err);
        showError("Failed to push identity. See console for details.");
        setLoading(false);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      clearError();
      setLoading(true);
      try {
        persistEmail("");
        await clearIdentity();
        closePopover();
        // Reload the page to clear impersonation
        try {
          window.top.location.reload();
        } catch (e) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Impersonation clear failed", err);
        showError("Failed to clear identity. See console for details.");
        setLoading(false);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closePopover());
  }

  const stored = getStoredEmail();
  if (stored) {
    applyIdentity(stored).catch((err) => {
      console.warn("Impersonation restore skipped", err);
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}