/* German Flashcards update controls for a static GitHub Pages website.
   Uses a fresh request for version.json; does not clear storage, remove the
   Home Screen icon, or reset cards. It cannot update a page still running
   older JavaScript until that page is reloaded at least once. */
(function () {
  "use strict";

  const APP_VERSION = "2026.11.23.7";
  const checkButton = document.getElementById("checkUpdateBtn");
  const reloadButton = document.getElementById("reloadAppBtn");
  const updateStatus = document.getElementById("updateStatus");
  const versionLabel = document.getElementById("appVersion");
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsPanel = document.getElementById("settingsPanel");
  if (!checkButton || !reloadButton || !updateStatus || !versionLabel) return;

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener("click", function () {
      const opening = settingsPanel.classList.contains("hidden");
      settingsPanel.classList.toggle("hidden", !opening);
      settingsToggle.setAttribute("aria-expanded", String(opening));
    });
  }

  let busy = false;
  let hiddenAt = null;
  let lastCheckAt = 0;
  versionLabel.textContent = "Version " + APP_VERSION;

  function report(message, isError = false) {
    updateStatus.textContent = message;
    updateStatus.classList.toggle("updateError", isError);
  }

  function setBusy(next) {
    busy = next;
    checkButton.disabled = next;
    reloadButton.disabled = next;
  }

  // Use the page's own directory so both /repo/ and /repo/index.html work.
  function resourceUrl(filename) {
    return new URL(filename, window.location.href);
  }

  async function latestVersion() {
    const manifestUrl = resourceUrl("version.json");
    // A distinct URL plus no-store bypasses the usual HTTP cache.
    manifestUrl.searchParams.set("_nocache", String(Date.now()));
    const response = await fetch(manifestUrl.href, {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error("Version check returned HTTP " + response.status);
    const manifest = await response.json();
    if (!manifest || typeof manifest.version !== "string" ||
        !/^[a-zA-Z0-9._-]+$/.test(manifest.version)) {
      throw new Error("Invalid version information");
    }
    return manifest.version;
  }

  function saveProgressBeforeReload() {
    // Save exactly the existing spaced-repetition state; never clear storage.
    try {
      if (typeof saveState === "function") saveState();
    } catch (error) {
      report("Unable to save your progress: reload cancelled.", true);
      return false;
    }
    return true;
  }

  function freshReload(targetVersion, automatic = false) {
    if (!saveProgressBeforeReload()) return false;
    // Stay on the same origin so the existing Home Screen app and progress remain.
    const url = new URL(window.location.href);
    url.searchParams.set("app_version", targetVersion || APP_VERSION);
    url.searchParams.set("_reload", String(Date.now()));
    // Automatic reloads carry a one-attempt marker. If the CDN is still
    // serving old HTML, this prevents an endless refresh loop.
    if (automatic) url.searchParams.set("_auto_update", targetVersion);
    else url.searchParams.delete("_auto_update");
    window.location.replace(url.toString());
    return true;
  }

  async function checkForUpdates({ auto = false } = {}) {
    if (busy) return;
    if (!auto) report("Checking the latest published version…");
    lastCheckAt = Date.now();
    setBusy(true);
    try {
      const availableVersion = await latestVersion();
      if (availableVersion === APP_VERSION) {
        if (!auto) report("You're already on the latest version (" + APP_VERSION + ").");
      } else if (auto) {
        const alreadyAttempted = new URL(window.location.href)
          .searchParams.get("_auto_update") === availableVersion;
        if (alreadyAttempted) {
          report("An update was found, but the new files may not be published yet. Try Reload app later.");
        } else {
          report("New version " + availableVersion + " found. Saving progress and updating automatically…");
          freshReload(availableVersion, true);
        }
      } else {
        report("Update found (" + availableVersion + "). Reloading with your progress saved…");
        freshReload(availableVersion, false);
      }
    } catch (error) {
      // Offline startup is fine: existing flashcards remain fully usable.
      if (!auto) report(
        "Couldn't check for updates. Check your connection, or use Reload app.",
        true
      );
    } finally {
      setBusy(false);
    }
  }

  checkButton.addEventListener("click", function () {
    checkForUpdates();
  });

  reloadButton.addEventListener("click", function () {
    if (busy) return;
    report("Saving progress and requesting a fresh copy of the app…");
    freshReload(APP_VERSION);
  });

  // Check automatically on every full startup, *after* the CSV has been
  // reconciled into the saved deck. This avoids racing a progress write.
  Promise.resolve(window.flashcardsReady)
    .catch(() => {}) // Updates should still work if the CSV cannot load.
    .then(() => checkForUpdates({ auto: true }));

  // iOS Home Screen apps can resume an existing page without reloading.
  // If it has been in the background for more than 30 seconds, check again
  // when brought to the foreground, without requiring a manual tap.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt === null) return;
    const awayMs = Date.now() - hiddenAt;
    hiddenAt = null;
    if (awayMs >= 30000 && Date.now() - lastCheckAt >= 30000) {
      Promise.resolve(window.flashcardsReady)
        .catch(() => {})
        .then(() => checkForUpdates({ auto: true }));
    }
  });
})();
