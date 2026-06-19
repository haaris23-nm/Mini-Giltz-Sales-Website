import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, CornerDownLeft, Sparkles } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-init-1",
      sender: "bot",
      text: "Namaste! 🙏 I am Mini Glitz's Smart Support Assistant. How can I help you today? Ask about listing products, refund rules, tracking orders, or test accounts!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: `m-usr-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages.slice(-5), userMsg] }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `m-bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.warn("AI support assistant offline (using standard sandbox help instructions):", error);
      // fallback reply
      setMessages((prev) => [
        ...prev,
        {
          id: `m-bot-err-${Date.now()}`,
          sender: "bot",
          text: "Thanks for asking! As of now, we are in prototype mode. Here is a quick summary for customer actions. Standard Refund: Within 7 days of package delivery. Delivery timeline: 3-5 business days depending on address location.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (text: string) => {
    setInputText(text);
  };

  return (
    <div id="ai-support-container" className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <button
          id="ai-toggle-bubble"
          onClick={() => setIsOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2 cursor-pointer border border-pink-500 hover:rotate-3"
        >
          <MessageSquare className="h-6 w-6 animate-pulse" />
          <span className="text-xs font-semibold pr-1 hidden md:block">Glitz Support AI</span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div
          id="ai-chat-panel"
          className="bg-white rounded-2xl shadow-3xl border border-slate-100 w-80 max-w-sm md:w-96 h-[480px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Panel Header */}
          <div className="bg-pink-600 px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Glitz Support AI</h3>
                <span className="text-[10px] text-pink-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full inline-block animate-ping"></span>
                  Active Expert Chatbot
                </span>
              </div>
            </div>
            <button
              id="ai-close-btn"
              onClick={() => setIsOpen(false)}
              className="text-pink-100 hover:text-white p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick recommendations suggestions strip */}
          <div className="bg-pink-50/70 border-b border-pink-100/50 px-3 py-1.5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
            <span className="text-pink-700 font-medium flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3" /> Prompts:
            </span>
            <button
              onClick={() => handleQuickQuestion("How to register as seller?")}
              className="bg-white text-slate-600 hover:text-pink-600 border border-slate-200 hover:border-pink-300 rounded-full px-2 py-0.5 cursor-pointer text-[10px]"
            >
              Seller Registration?
            </button>
            <button
              onClick={() => handleQuickQuestion("What are the COD rules?")}
              className="bg-white text-slate-600 hover:text-pink-600 border border-slate-200 hover:border-pink-300 rounded-full px-2 py-0.5 cursor-pointer text-[10px]"
            >
              COD Rules?
            </button>
            <button
              onClick={() => handleQuickQuestion("How to request a refund?")}
              className="bg-white text-slate-600 hover:text-pink-600 border border-slate-200 hover:border-pink-300 rounded-full px-2 py-0.5 cursor-pointer text-[10px]"
            >
              Refund Policy?
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === "user" ? "bg-pink-100 text-pink-700" : "bg-white border border-slate-100 text-slate-600"
                  }`}
                >
                  {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-pink-600 text-white rounded-tr-none"
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block text-right px-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-7 w-7 rounded-full bg-white border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="bg-white text-slate-600 border border-slate-100 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-100 p-3 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your support question..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
            />
            <button
              id="send-chat-btn"
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-xl disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
