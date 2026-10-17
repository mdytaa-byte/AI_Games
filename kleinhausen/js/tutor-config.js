/* KI-Tutor: set these for your class. Edit this file, then re-publish / re-pack SCORM.
   url:     where students open the tutor (Claude project, custom GPT, school chatbot …).
            Leave "" and the button only copies the brief for students to paste.
   prefill: name of a URL parameter that pre-fills the first message, if your tutor
            supports one (e.g. "q"). Leave "" to rely on copy & paste. */
(function (global) {
  const KH = global.KH = global.KH || {};
  KH.TUTOR = {
    name: "KI-Tutor",
    url: "",
    prefill: ""
  };
})(window);
