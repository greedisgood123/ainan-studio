import { useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AssistantChat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chat = useAction(api.llm.chat);
  const createBooking = useMutation(api.bookings.create);
  const unavailableDays = useQuery(api.unavailableDates.publicDays, {});

  type Draft = { name: string; email: string; phone: string; date: string; packageName?: string };
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const isDateBlocked = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    if (!unavailableDays) return false;
    const d = new Date(`${dateStr}T00:00:00`);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return (unavailableDays as number[]).includes(start);
  };

  const canConfirm = (d: Draft | null): boolean => {
    if (!d) return false;
    if (!d.name || !d.email || !d.phone || !d.date) return false;
    if (isDateBlocked(d.date)) return false;
    return true;
  };

  const confirmBooking = async () => {
    setDraftError(null);
    if (!draft) return;
    try {
      const d = new Date(`${draft.date}T00:00:00`);
      const desiredDateMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      await createBooking({
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        desiredDateMs,
        packageName: draft.packageName,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "✅ Your booking request has been submitted. We will confirm availability shortly." },
      ]);
      setDraft(null);
    } catch (e: any) {
      const msg = e?.message || "Something went wrong. Please try another date.";
      setDraftError(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: `❗ ${msg}` }]);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const nextMessages = [...messages, { role: "user", content: trimmed } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const system =
        "You are a concise booking assistant for a photography and livestream studio in Kuala Lumpur. " +
        "Gather event type, date, location, headcount, and budget. Recommend a package briefly and stay helpful.\n" +
        "When the user confirms they want to book, output one line starting with 'BOOKING:' followed by a strict JSON object with keys name, email, phone, date (YYYY-MM-DD), and packageName. " +
        "Example: BOOKING: {\"name\":\"A\",\"email\":\"a@example.com\",\"phone\":\"0123456789\",\"date\":\"2025-08-12\",\"packageName\":\"Solo Headshot Session\"}. " +
        "Do not include any commentary on that line. Continue your normal response above or below it.";

      const res = await chat({ messages: nextMessages, system, provider: "groq" });
      const content = (res as any)?.content || "";
      // If the model produced a booking payload, prefill a draft and prompt user to confirm
      const bookingMatch = /BOOKING:\s*(\{[\s\S]*?\})/i.exec(content);
      if (bookingMatch) {
        try {
          const payload = JSON.parse(bookingMatch[1]);
          const newDraft: Draft = {
            name: String(payload?.name || ""),
            email: String(payload?.email || ""),
            phone: String(payload?.phone || ""),
            date: String(payload?.date || ""),
            packageName: payload?.packageName ? String(payload.packageName) : undefined,
          };
          setDraft(newDraft);
        } catch {
          // ignore parse errors, just show the content
        }
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      // Auto-scroll to bottom
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e?.message || "Sorry, I had trouble replying. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-accent text-white shadow-lg p-4 hover:opacity-90"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[360px] max-w-[90vw] rounded-lg border bg-white shadow-2xl">
          <div className="border-b p-3 text-sm font-medium">Booking Assistant</div>
          <div ref={containerRef} className="max-h-80 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.length === 0 ? (
              <div className="text-gray-500">Hi! Tell me about your event and preferred date.</div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={
                      "inline-block rounded-lg px-3 py-2 " +
                      (m.role === "user" ? "bg-accent text-white" : "bg-gray-100 text-gray-900")
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="text-gray-500">Thinking…</div>}
          </div>
          {draft && (
            <div className="border-t p-3 text-xs space-y-2 bg-gray-50">
              <div className="font-medium text-gray-700">Booking details (confirm or edit):</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded border px-2 py-1"
                  placeholder="Full name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...(draft as Draft), name: e.target.value })}
                />
                <input
                  className="rounded border px-2 py-1"
                  placeholder="Email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...(draft as Draft), email: e.target.value })}
                />
                <input
                  className="rounded border px-2 py-1"
                  placeholder="Phone"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...(draft as Draft), phone: e.target.value })}
                />
                <input
                  type="date"
                  className="rounded border px-2 py-1"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...(draft as Draft), date: e.target.value })}
                />
                <input
                  className="col-span-2 rounded border px-2 py-1"
                  placeholder="Package (optional)"
                  value={draft.packageName || ""}
                  onChange={(e) => setDraft({ ...(draft as Draft), packageName: e.target.value })}
                />
              </div>
              {isDateBlocked(draft.date) && (
                <div className="text-red-600">This date is unavailable. Please choose another date.</div>
              )}
              {draftError && <div className="text-red-600">{draftError}</div>}
              <div className="flex gap-2">
                <button
                  className={`rounded px-3 py-2 text-white text-xs ${canConfirm(draft) ? "bg-accent" : "bg-gray-400"}`}
                  disabled={!canConfirm(draft)}
                  onClick={confirmBooking}
                >
                  Confirm booking
                </button>
                <button
                  className="rounded px-3 py-2 text-xs border"
                  onClick={() => setDraft(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 border-t p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type your message"
              className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="rounded-md bg-accent px-3 py-2 text-white text-sm hover:opacity-90"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}


