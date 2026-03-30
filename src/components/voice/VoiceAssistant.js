import { useState, useRef, useEffect } from "react";
import API from "../../api/axios";
import "./voice.css";

const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconStop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconVoice = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const HINTS = [
  "Which NGO needs vegetarian food?",
  "How many critical food requests?",
  "Show pending food requests",
  "How many surplus donations?",
  "Which areas need cooked food?",
];

export default function VoiceAssistant() {
  const [open,       setOpen]       = useState(false);
  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [speaking,   setSpeaking]   = useState(false);

  const recRef        = useRef(null);
  const gotResultRef  = useRef(false);
  const stoppedRef    = useRef(false);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SRClass;

  /* ── start mic ── */
  const startListening = async () => {
    if (!SRClass) return;

    // First explicitly request mic permission so we get a clear error
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError("Microphone access denied. Click the lock icon in your browser address bar → allow microphone → refresh.");
      return;
    }

    setTranscript("");
    setResponse("");
    setError("");
    gotResultRef.current = false;
    stoppedRef.current   = false;

    const rec = new SRClass();
    rec.lang            = "en-US";
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      gotResultRef.current = true;
      const text = e.results[0][0].transcript;
      setTranscript(text);
      rec.stop();
      queryBackend(text);
    };

    rec.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setError("Mic blocked — allow microphone in browser settings.");
      } else if (e.error === "aborted") {
        // manual stop — silent
      } else if (e.error === "no-speech") {
        setError("No speech detected. Tap mic and speak clearly.");
      } else {
        setError("Mic error: " + e.error);
      }
      gotResultRef.current = true; // suppress onend duplicate
    };

    rec.onend = () => {
      setListening(false);
      if (!gotResultRef.current && !stoppedRef.current) {
        setError("No speech detected. Tap mic and speak clearly.");
      }
    };

    rec.start();
  };

  /* ── stop mic ── */
  const stopListening = () => {
    stoppedRef.current = true;
    try { recRef.current?.stop(); } catch (_) {}
    setListening(false);
  };

  /* ── query backend ── */
  const queryBackend = async (text) => {
    setLoading(true);
    setError("");
    try {
      const res   = await API.post("/voice/query", { text });
      const reply = res.data.response;
      setResponse(reply);
      speak(reply);
    } catch {
      setError("Could not get a response. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── text to speech ── */
  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utter   = new SpeechSynthesisUtterance(text);
    utter.lang    = "en-US";
    utter.rate    = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleHint = (hint) => {
    setTranscript(hint);
    setResponse("");
    setError("");
    queryBackend(hint);
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    stoppedRef.current = true;
    try { recRef.current?.stop(); } catch (_) {}
    setListening(false);
    setTranscript("");
    setResponse("");
    setError("");
    setSpeaking(false);
  };

  return (
    <>
      <button
        className={`va-fab ${open ? "open" : ""}`}
        onClick={() => { setOpen(o => !o); reset(); }}
        title="Voice Assistant"
      >
        <IconMic />
        <span className="va-fab-label">Ask</span>
      </button>

      {open && (
        <div className="va-panel">
          <div className="va-panel-header">
            <div className="va-panel-title"><IconVoice /> Voice Assistant</div>
            <button className="va-close" onClick={() => { setOpen(false); reset(); }}>
              <IconX />
            </button>
          </div>

          {!supported ? (
            <div className="va-unsupported">
              Speech recognition not supported. Please use Chrome or Edge.
            </div>
          ) : (
            <>
              <div className="va-mic-area">
                <button
                  className={`va-mic-btn ${listening ? "listening" : ""}`}
                  onClick={listening ? stopListening : startListening}
                  disabled={loading}
                >
                  {listening ? <IconStop /> : <IconMic />}
                  {listening && <span className="va-pulse" />}
                </button>
                <p className="va-mic-hint">
                  {listening ? "Listening… speak now" : "Tap to speak"}
                </p>
              </div>

              {transcript && (
                <div className="va-bubble va-bubble-user">
                  <span className="va-bubble-label">You said</span>
                  <p>"{transcript}"</p>
                </div>
              )}

              {loading && (
                <div className="va-loading">
                  <span className="va-dot" /><span className="va-dot" /><span className="va-dot" />
                </div>
              )}

              {response && !loading && (
                <div className="va-bubble va-bubble-bot">
                  <span className="va-bubble-label">{speaking ? "Speaking…" : "Response"}</span>
                  <p>{response}</p>
                  {!speaking && (
                    <button className="va-replay" onClick={() => speak(response)}>
                      <IconVoice /> Replay
                    </button>
                  )}
                </div>
              )}

              {error && <div className="va-error">{error}</div>}

              {!transcript && !loading && (
                <div className="va-hints">
                  <p className="va-hints-label">Try asking:</p>
                  <div className="va-hints-chips">
                    {HINTS.map((h) => (
                      <button key={h} className="va-chip" onClick={() => handleHint(h)}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
