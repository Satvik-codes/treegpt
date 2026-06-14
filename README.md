![TreeGPT Concept](./public/tree.png)

# TreeGPT

A next-generation AI interface built for complex thinking. TreeGPT fundamentally redesigns how we interact with LLMs by introducing a **node-based thinking system**, allowing you to explore multiple solutions simultaneously without losing context.

## 🌟 Why TreeGPT?

Traditional AI conversations break down when thinking gets complex:
- **Linear ≠ Thinking:** Your mind branches, but traditional chats force you into a single timeline.
- **Lost Alternatives:** When you test one solution, you immediately lose track of other viable paths.
- **Buried Ideas:** Important insights get lost under hundreds of messages in an infinite scroll.
- **Broken Context:** Repeating the same context because previous attempts contaminate the chat.

**TreeGPT solves this by introducing:**
- 🌿 **Branching Conversations:** Ask the AI for multiple approaches, and fork your chat. Explore them side-by-side.
- 🧠 **Preserved Context:** Every node is its own thread. Go deep without cross-contamination.
- ✂️ **Prune and Collapse:** Mark dead ends as failed, and compress explored threads into summaries to keep your workspace clean.

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) with [TanStack Router](https://tanstack.com/router/latest)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Database & Backend**: [Supabase Edge Functions](https://supabase.com/) & Custom Tree-State Engine
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Interactive Graphs**: [React Flow (@xyflow/react)](https://reactflow.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query](https://tanstack.com/query/latest)
- **AI Models**: Gemini API via OpenRouter for context-aware, per-node reasoning.

## 📦 Installation & Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Supabase Environment Variables**
   Create a `.env` file based on your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8080`.

## 📂 Project Structure

- `src/` - Application source code (Pages, Components, Styles, Router setup)
- `public/` - Static assets and concept images
- `supabase/functions/` - Deno Edge Functions handling the AI requests and routing
- `api/` - Backend API configurations

## 📄 License

This project is licensed under the MIT License.
