import { useEffect, useState } from "react";
import {
  Compass,
  User,
  Sparkles,
  ArrowRight,
  Clock3,
  MapPin,
  RefreshCw,
  Mic,
  Volume2,
  VolumeX,
  Square,
  LocateFixed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActivityCard from "../components/ActivityCard";
import VoiceButton from "../components/VoiceButton";
import useBrowserLocation from "../hooks/useBrowserLocation";
import useVoiceOutput from "../hooks/useVoiceOutput";

import {
  getActivities,
  chatWithAgent,
} from "../services/api";


export default function Home({ onProfile }) {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [request, setRequest] = useState(
    "Give me something meaningful to do today."
  );

  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  // What the agent said, plus any tool results it used.
  const [reply, setReply] = useState("");
  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);

  // Both are optional: the app works the same without them.
  const location = useBrowserLocation();
  const voice = useVoiceOutput();


  // ============================================================
  // LOAD EXISTING ACTIVITIES
  // ============================================================

  useEffect(() => {
    loadActivities();
  }, []);


  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getActivities();

      setActivities(
        Array.isArray(data) ? data : []
      );

    } catch (err) {
      console.error("Failed to load activities:", err);

      setError(
        err.response?.data?.detail ||
        "Could not load your activities."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // ASK TOUCHGRASS
  // ============================================================

  const sendToAgent = async (text, { fromVoice = false } = {}) => {
    const message = text.trim();

    if (!message || asking || voiceProcessing) {
      return;
    }

    const setBusy = fromVoice ? setVoiceProcessing : setAsking;

    try {
      setBusy(true);
      setError("");
      voice.stop();

      let timezone = null;

      try {
        timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || null;
      } catch {
        timezone = null;
      }

      const result = await chatWithAgent({
        message,
        // Only sent when the user pressed "Use my location".
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null,
        timezone,
        voice_enabled: voice.enabled,
      });

      setReply(result.message || "");
      setWeather(result.weather || null);
      setPlaces(
        Array.isArray(result.nearby_places)
          ? result.nearby_places
          : []
      );

      if (result.activity && result.activity_id) {
        setActivities((current) => [
          {
            id: result.activity_id,
            title: result.activity.title,
            description: result.activity.description,
            category: result.activity.category,
            duration_minutes: result.activity.duration_minutes,
            status: "suggested",
            context: {
              reason: result.reason,
              place: result.activity.place,
            },
          },
          ...current,
        ]);
      }

      // Spoken only when Voice is ON (the hook ignores this when OFF).
      voice.speak(result.message);

      setRequest("");

    } catch (err) {
      console.error("Agent request failed:", err);

      setError(
        err.response?.data?.detail ||
        (err.request
          ? "Can't reach TouchGrass right now. Check your connection and try again."
          : "TouchGrass could not generate an activity.")
      );

    } finally {
      setBusy(false);
    }
  };

  const handleAsk = () => sendToAgent(request);

  // Voice input: transcribe, then ask. If transcription fails, the
  // VoiceButton shows its own message and the text box still works.
  const handleVoiceTranscription = async (transcript) => {
    if (!transcript?.trim()) {
      return;
    }

    setRequest(transcript.trim());

    await sendToAgent(transcript, { fromVoice: true });
  };


  // ============================================================
  // QUICK PROMPTS
  // ============================================================

  const quickPrompts = [
    "I want to explore something new.",
    "Give me something creative to do.",
    "I want to spend time outdoors.",
    "I want to meet people.",
  ];


  const isBusy =
    asking || voiceProcessing;


  return (
    <div className="min-h-screen bg-[#0d0a07] text-white">

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <nav className="border-b border-amber-900/30 bg-[#110c08]/90 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black">
              <Compass size={22} />
            </div>

            <div className="text-left">
              <h1 className="text-lg font-bold">
                TouchGrass
              </h1>

              <p className="text-xs text-amber-200/50">
                Less screen. More life.
              </p>
            </div>
          </button>


          <button
            onClick={onProfile}
            className="flex items-center gap-2 rounded-xl border border-amber-800/40 bg-amber-950/20 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-900/30"
          >
            <User size={17} />
            My Profile
          </button>

        </div>

      </nav>


      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HERO */}

        <section className="mb-10">

          <div className="mb-3 flex items-center gap-2 text-sm text-amber-400">
            <Sparkles size={16} />
            <span>Your real-world activity agent</span>
          </div>

          <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            What do you feel like
            <span className="text-amber-400">
              {" "}doing?
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Tell TouchGrass what you want.
            Type it or speak naturally.
            Your agent will turn it into something
            meaningful you can actually do.
          </p>

        </section>


        {/* ====================================================
            REQUEST BOX
        ===================================================== */}

        <section className="mb-10">

          <div className="rounded-3xl border border-amber-900/40 bg-[#15100c] p-5 shadow-2xl">

            <div className="flex flex-col gap-4 md:flex-row md:items-end">

              {/* TEXT INPUT */}

              <div className="flex-1">

                <label className="mb-2 block text-sm font-medium text-amber-100/70">
                  Tell me what you want
                </label>

                <textarea
                  value={request}
                  onChange={(event) =>
                    setRequest(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      handleAsk();
                    }
                  }}
                  rows={3}
                  disabled={isBusy}
                  placeholder="Example: I want to do something outdoors today..."
                  className="w-full resize-none rounded-2xl border border-amber-900/40 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-amber-500/60"
                />

              </div>


              {/* VOICE + ASK */}

              <div className="flex gap-3">

                <VoiceButton
                  onTranscription={
                    handleVoiceTranscription
                  }
                  disabled={isBusy}
                />

                <button
                  onClick={handleAsk}
                  disabled={
                    isBusy ||
                    !request.trim()
                  }
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {asking ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />

                      Ask TouchGrass

                      <ArrowRight size={17} />
                    </>
                  )}

                </button>

              </div>

            </div>


            {/* LOCATION + VOICE OUTPUT CONTROLS */}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-amber-900/30 pt-4 text-sm">

              {location.status === "granted" ? (
                <button
                  type="button"
                  onClick={location.clear}
                  className="flex items-center gap-2 rounded-full border border-green-700/40 bg-green-950/30 px-4 py-2 text-green-300 transition hover:bg-green-900/30"
                  title="Stop sharing location"
                >
                  <MapPin size={15} />
                  Location on (tap to turn off)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={location.request}
                  disabled={
                    location.status === "asking" ||
                    location.status === "unsupported"
                  }
                  className="flex items-center gap-2 rounded-full border border-amber-800/40 bg-amber-950/20 px-4 py-2 text-amber-100 transition hover:bg-amber-900/30 disabled:opacity-40"
                >
                  <LocateFixed size={15} />
                  {location.status === "asking"
                    ? "Finding you..."
                    : "Use my location"}
                </button>
              )}

              {voice.supported && (
                <>
                  <button
                    type="button"
                    onClick={voice.toggle}
                    aria-pressed={voice.enabled}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                      voice.enabled
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {voice.enabled ? (
                      <Volume2 size={15} />
                    ) : (
                      <VolumeX size={15} />
                    )}
                    Voice {voice.enabled ? "ON" : "OFF"}
                  </button>

                  {voice.speaking && (
                    <button
                      type="button"
                      onClick={voice.stop}
                      className="flex items-center gap-2 rounded-full border border-red-800/50 bg-red-950/30 px-4 py-2 text-red-300 transition hover:bg-red-900/30"
                    >
                      <Square size={13} />
                      Stop
                    </button>
                  )}
                </>
              )}

              <span className="text-xs text-white/30">
                {location.status === "denied"
                  ? "Location is off. No problem, I'll work without it."
                  : location.status === "unavailable"
                    ? "Couldn't get your location. Continuing without it."
                    : location.status === "unsupported"
                      ? "This browser can't share location."
                      : "Optional. Helps with weather and nearby places."}
              </span>

            </div>


            {/* AGENT REPLY */}

            {reply && (
              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm leading-6 text-amber-50">

                <p>{reply}</p>

                {weather && !weather.error && (
                  <p className="mt-2 text-xs text-amber-200/60">
                    Weather now:{" "}
                    {[
                      weather.weather,
                      weather.temperature_c != null
                        ? `${Math.round(weather.temperature_c)}°C`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {places.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-amber-200/70">
                    {places.slice(0, 5).map((place, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <MapPin size={12} />
                        {place.name || place.display_name}
                      </li>
                    ))}
                  </ul>
                )}

              </div>
            )}


            {/* VOICE STATUS */}

            {voiceProcessing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-300">

                <Mic size={15} />

                <span>
                  Listening to your request...
                </span>

              </div>
            )}


            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

          </div>

        </section>


        {/* ====================================================
            QUICK PROMPTS
        ===================================================== */}

        <section className="mb-12">

          <div className="mb-4 flex items-center gap-2">
            <Sparkles
              size={17}
              className="text-amber-400"
            />

            <h3 className="font-semibold">
              Try saying...
            </h3>
          </div>


          <div className="flex flex-wrap gap-3">

            {quickPrompts.map((prompt) => (

              <button
                key={prompt}
                onClick={() => {
                  setRequest(prompt);
                  sendToAgent(prompt);
                }}
                disabled={isBusy}
                className="rounded-full border border-amber-900/40 bg-[#15100c] px-4 py-2 text-sm text-white/65 transition hover:border-amber-500/50 hover:text-amber-200 disabled:opacity-40"
              >
                {prompt}
              </button>

            ))}

          </div>

        </section>


        {/* ====================================================
            ACTIVITIES
        ===================================================== */}

        <section>

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="text-2xl font-bold">
                Your activities
              </h3>

              <p className="mt-1 text-sm text-white/40">
                Things TouchGrass thinks you might enjoy.
              </p>

            </div>


            <button
              onClick={loadActivities}
              disabled={loading}
              className="rounded-xl border border-amber-900/40 p-2 text-white/50 transition hover:bg-amber-900/20 hover:text-amber-200"
              title="Refresh activities"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

          </div>


          {loading ? (

            <div className="flex items-center justify-center rounded-3xl border border-amber-900/30 bg-[#15100c] py-20">

              <div className="text-center">

                <RefreshCw
                  size={28}
                  className="mx-auto mb-3 animate-spin text-amber-400"
                />

                <p className="text-sm text-white/40">
                  Loading your activities...
                </p>

              </div>

            </div>

          ) : activities.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-amber-900/40 bg-[#15100c] px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">

                <Compass size={26} />

              </div>

              <h4 className="text-lg font-semibold">
                Nothing here yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Tell TouchGrass what you're in the mood
                for and your first real-world challenge
                will appear here.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {activities.map((activity) => (

                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={() =>
                    navigate(
                      `/activity/${activity.id}`
                    )
                  }
                />

              ))}

            </div>

          )}

        </section>


        {/* ====================================================
            FOOTER MESSAGE
        ===================================================== */}

        <div className="mt-16 flex items-center justify-center gap-2 text-center text-xs text-white/25">

          <MapPin size={13} />

          <span>
            TouchGrass is designed to get you away
            from the screen and into the real world.
          </span>

        </div>

      </main>

    </div>
  );
}
