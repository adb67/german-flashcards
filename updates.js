/* German Flashcards update controls for a static GitHub Pages website.
   Uses a fresh request for version.json; does not clear storage, remove the
   Home Screen icon, or reset cards. It cannot update a page still running
   older JavaScript until that page is reloaded at least once. */
(function () {
  "use strict";

  const APP_VERSION = "2026.11.23.5";
  const checkButton = document.getElementById("checkUpdateBtn");
  const reloadButton = document.getElementById("reloadAppBtn");
  const updateStatus = document.getElementById("updateStatus");
  const versionLabel = document.getElementById("appVersion");
  if (!checkButton || !reloadButton || !updateStatus || !versionLabel) return;

  let busy = false;
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

  function freshReload(targetVersion) {
    if (!saveProgressBeforeReload()) return;
    // This is still the SAME origin, path and storage area as the installed app.
    // A unique URL forces a new document request in Safari and Home Screen mode.
    const url = new URL(window.location.href);
    url.searchParams.set("app_version", targetVersion || APP_VERSION);
    url.searchParams.set("_reload", String(Date.now()));
    window.location.replace(url.toString());
  }

  async function checkForUpdates({ auto = false } = {}) {
    if (busy) return;
    if (!auto) report("Checking the latest published version…");
    setBusy(true);
    try {
      const availableVersion = await latestVersion();
      if (availableVersion === APP_VERSION) {
        if (!auto) report("You're already on the latest version (" + APP_VERSION + ").");
      } else if (auto) {
        report("Update available (" + availableVersion + "). Tap Check for updates.");
      } else {
        report("Update found (" + availableVersion + "). Reloading with your progress saved…");
        freshReload(availableVersion);
      }
    } catch (error) {
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

  // Notice future releases without unexpectedly restarting a study session.
  checkForUpdates({ auto: true });
})();
