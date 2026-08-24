/* Minimal SCORM 1.2 adapter. Works inside Canvas SCORM packages.
   Falls back silently when no LMS API is present. */
(function (global) {
  const KH = global.KH = global.KH || {};

  function findAPI(win) {
    let tries = 0;
    while (win && tries < 10) {
      if (win.API) return win.API;
      if (win.API_1484_11) return win.API_1484_11;
      if (!win.parent || win.parent === win) break;
      win = win.parent;
      tries += 1;
    }
    try {
      if (win.opener && win.opener.API) return win.opener.API;
      if (win.opener && win.opener.API_1484_11) return win.opener.API_1484_11;
    } catch (e) { /* cross-origin opener */ }
    return null;
  }

  function is2004(api) {
    return api && typeof api.Initialize === "function";
  }

  KH.SCORM = {
    api: null,
    version: null,
    active: false,

    init() {
      this.api = findAPI(window);
      if (!this.api) return false;
      try {
        if (is2004(this.api)) {
          this.version = "2004";
          this.api.Initialize("");
        } else {
          this.version = "1.2";
          this.api.LMSInitialize("");
        }
        this.active = true;
        this.set("cmi.core.lesson_status", "incomplete");
        this.set("cmi.core.score.min", "0");
        this.set("cmi.core.score.max", "100");
        return true;
      } catch (err) {
        this.active = false;
        return false;
      }
    },

    get(el12, el2004) {
      if (!this.active) return "";
      try {
        if (this.version === "2004") {
          return this.api.GetValue(el2004 || el12.replace("cmi.core.", "cmi.")) || "";
        }
        return this.api.LMSGetValue(el12) || "";
      } catch (e) {
        return "";
      }
    },

    set(el12, value) {
      if (!this.active) return;
      try {
        if (this.version === "2004") {
          const map = {
            "cmi.core.lesson_status": "cmi.completion_status",
            "cmi.core.score.raw": "cmi.score.raw",
            "cmi.core.score.min": "cmi.score.min",
            "cmi.core.score.max": "cmi.score.max",
            "cmi.core.lesson_location": "cmi.location",
            "cmi.core.session_time": "cmi.session_time",
            "cmi.suspend_data": "cmi.suspend_data"
          };
          let key = map[el12] || el12;
          if (el12 === "cmi.core.lesson_status") {
            const v = value === "passed" || value === "failed" ? value : (value === "completed" ? "completed" : "incomplete");
            this.api.SetValue("cmi.completion_status", value === "incomplete" ? "incomplete" : "completed");
            if (value === "passed" || value === "failed" || value === "completed") {
              this.api.SetValue("cmi.success_status", value === "failed" ? "failed" : "passed");
            }
            return;
          }
          this.api.SetValue(key, String(value));
        } else {
          this.api.LMSSetValue(el12, String(value));
        }
      } catch (e) { /* ignore */ }
    },

    save() {
      if (!this.active) return;
      try {
        if (this.version === "2004") this.api.Commit("");
        else this.api.LMSCommit("");
      } catch (e) { /* ignore */ }
    },

    setProgress(location, suspend, score) {
      this.set("cmi.core.lesson_location", location || "");
      if (suspend) this.set("cmi.suspend_data", suspend.slice(0, 4000));
      if (typeof score === "number") this.set("cmi.core.score.raw", String(Math.round(score)));
      this.save();
    },

    complete(score) {
      if (typeof score === "number") this.set("cmi.core.score.raw", String(Math.round(score)));
      this.set("cmi.core.lesson_status", (score || 0) >= 70 ? "passed" : "completed");
      this.save();
    },

    quit() {
      if (!this.active) return;
      try {
        if (this.version === "2004") this.api.Terminate("");
        else this.api.LMSFinish("");
      } catch (e) { /* ignore */ }
      this.active = false;
    }
  };

  window.addEventListener("beforeunload", function () {
    if (KH.SCORM && KH.SCORM.active) KH.SCORM.quit();
  });
})(window);
