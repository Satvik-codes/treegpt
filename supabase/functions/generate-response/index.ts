import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Supabase Edge Functions run on Deno. This declaration is only for local TypeScript tooling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, messages, branchCount, context } = body;

    // Prefer OpenRouter (user choice). Keep LOVABLE_API_KEY as a fallback so existing setups still work.
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const provider = OPENROUTER_API_KEY ? "openrouter" : (LOVABLE_API_KEY ? "lovable" : null);
    if (!provider) {
      throw new Error(
        "No AI provider configured. Set OPENROUTER_API_KEY (recommended) or LOVABLE_API_KEY in Supabase Edge Function secrets."
      );
    }

    // Cheap + fast default on OpenRouter.
    // You can swap this without changing frontend code.
    const MODEL = provider === "openrouter"
      ? (Deno.env.get("OPENROUTER_MODEL") || "poolside/laguna-xs.2:free")
      : (Deno.env.get("LOVABLE_MODEL") || "poolside/laguna-xs.2:free");

    async function callChatCompletions(payload: Record<string, unknown>) {
      if (provider === "openrouter") {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            // Optional, but recommended by OpenRouter for analytics/routing.
            "HTTP-Referer": req.headers.get("origin") ?? "http://localhost",
            "X-Title": "TreeGPT",
          },
          body: JSON.stringify({ model: MODEL, ...payload }),
        });
        return res;
      }

      // Lovable AI gateway fallback
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: MODEL, ...payload }),
      });
      return res;
    }

    // SUMMARIZE MODE
    if (mode === "summarize") {
      const chatContent = (messages || []).map((m: any) => `${m.role}: ${m.content}`).join("\n");
      const response = await callChatCompletions({
        messages: [
          { role: "system", content: "Summarize this conversation into a short actionable title (max 8 words). Return ONLY the title text, nothing else." },
          { role: "user", content: chatContent },
        ],
      });
      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${response.status}`);
      }
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim() || "Collapsed node";
      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CHAT MODE (linear)
    if (mode === "chat") {
      const response = await callChatCompletions({
        messages: [
          {
            role: "system",
            content: "You are TreeGPT, a helpful AI assistant. Be concise and direct — match your response length to the complexity of the question. Short questions get short answers. Avoid unnecessary filler, preambles, or verbose explanations. Use bullet points or numbered lists only when they improve clarity. Do not repeat the user's question back to them.",
          },
          ...(messages || []),
        ],
      });
      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${response.status}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response.";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BRANCH MODE
    if (mode === "branch") {
      const count = branchCount || 3;
      const response = await callChatCompletions({
        messages: [
          {
            role: "system",
            content: `You are TreeGPT. The user wants to branch their conversation into ${count} different approaches. Provide exactly ${count} distinct options.`,
          },
          ...(messages || []),
          {
            role: "user",
            content: `Generate exactly ${count} different approaches or next steps. Each must be unique and actionable.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_branches",
              description: `Return exactly ${count} branch options`,
              parameters: {
                type: "object",
                properties: {
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short title (3-6 words)" },
                        reason: { type: "string", description: "Detailed explanation and implementation guidance" },
                      },
                      required: ["title", "reason"],
                    },
                  },
                },
                required: ["options"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_branches" } },
      });
      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${response.status}`);
      }
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let result;
      if (toolCall) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        result = { options: [{ title: "Continue", reason: "Continue the current approach." }] };
      }
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LEGACY context-based mode (backward compat)
    if (context) {
      const existingContent = context.stepsTaken?.map((s: string) => s.replace(/^\[(user|assistant)\]\s*/, '')).join('\n') || '';
      const response = await callChatCompletions({
        messages: [
          { role: "system", content: "You are TreeGPT. Provide the next step as detailed guidance." },
          { role: "user", content: `Goal: ${context.goal}\nSteps: ${existingContent}\nWhat's next?` },
        ],
      });
      if (!response.ok) throw new Error(`AI error: ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response.";
      return new Response(JSON.stringify({ type: "single", step: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid mode. Use 'chat', 'branch', or 'summarize'.");
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
