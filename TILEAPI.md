# Guide: Adding a new tool (micro-app tile)

This document describes the architecture and the steps required — the "pseudo API" — to add a new tile (micro-app) to the **Houba Houba!** dashboard.

---

## General Architecture

A tile rests on a five-layer model, keeping the display strictly apart from the business logic:
1. **Configuration / metadata** : The tile's declaration in the dashboard.
2. **Data structure (TypeScript & cache)** : The suggestion type, and the initialisation of the fallback reservoir.
3. **Global state / buffer logic** : Repeat-free drawing, through the global context hook.
4. **Internal business logic (dedicated React hook)** : A custom React hook (`src/hooks/useMyNewTool.ts`) holding the local state — voice, time, or whatever options are specific to the tile.
5. **UI / display component** : A pure display component (`src/components/MyNewTool.tsx`) consuming the dedicated hook to render the interface.


---

## Step 1: Declaring the tile (metadata)

Every tile is configured in the `tiles` array at the top of [src/app/page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx).

To add one, declare a new object matching the `Tile` interface ([src/types/index.ts](file:///c:/Projects/eole.me/improv-assist/src/types/index.ts)):

```typescript
{
  id: "my_new_tool",                  // Unique tile ID
  title: "Generator title",           // Shown large on the tile, and as the header
  subtitle: "Short description",      // Quick description under the title
  icon: Sparkles,                     // Lucide icon, imported at the top of the file
  color: "from-purple-500 to-cyan-400", // Gradient colours (Tailwind classes)
  menu: "inspiration",                // Optional parent folder ("incarnate", "inspiration", "warmup")
  keywords: ["word1", "word2"],       // Keywords for the Spotlight search bar
  helpDescription: <span>Detailed description, with <strong>JSX</strong> formatting.</span>
}
```

> [!TIP]
> Thanks to the `helpDescription` property, the tool's help documentation is **generated automatically** at the end of the application's help guide (`DocsView.tsx`). No manual documentation edit needed.

---

## Step 2: Declaring and initialising the data

If your tool draws ideas or suggestions from the AI reservoir:

1. **Define the suggestion interface** in [src/types/index.ts](file:///c:/Projects/eole.me/improv-assist/src/types/index.ts):
   ```typescript
   export interface MyNewSuggestion {
     text: string;
     category?: string;
   }
   ```
2. **Add the category to the local `ImprovBuffer`** (still in `index.ts`):
   ```typescript
   export interface ImprovBuffer {
     // ... existing ones
     my_new_tool: MyNewSuggestion[];
   }
   ```
3. **Provide the fallback mock data**:
   - Add a default list in [src/data/mockData.ts](file:///c:/Projects/eole.me/improv-assist/src/data/mockData.ts) (e.g. `MY_NEW_FALLBACKS`).
   - Add the initialised array to the local configuration file [public/data/reservoir-config.json](file:///c:/Projects/eole.me/improv-assist/public/data/reservoir-config.json), under the `my_new_tool` key.
4. **Update the safety empty buffer** in [src/utils/bufferUtils.ts](file:///c:/Projects/eole.me/improv-assist/src/utils/bufferUtils.ts), in the `EMPTY_BUFFER` constant and in the sanitising / validation functions:
   ```typescript
   export const EMPTY_BUFFER: ImprovBuffer = {
     // ...
     my_new_tool: [],
     last_fetch: null
   };
   ```

---

## Step 3: Draw logic and context synchronisation

So that the draw button picks from the local reservoir and avoids repeats (the last ten draws are remembered):

1. **Register the category** in the main context hook [src/context/ImprovBufferContext.tsx](file:///c:/Projects/eole.me/improv-assist/src/context/ImprovBufferContext.tsx):
   ```typescript
   const CATEGORIES = [
     // ... existing ones
     "my_new_tool"
   ];
   ```
2. The `pickItem` method of the `useImprovBuffer` hook then takes care of pulling the suggestion, removing it from the current reservoir to avoid duplicates, and maintaining the local rotation history.

---

## Step 4: Writing the logic (hook) and the UI component (display)

To keep display and behaviour apart, each tile must isolate its logic in a dedicated custom hook, leaving the UI component as simple and declarative as possible.

1. **Create the business logic hook** in `src/hooks/useMyNewTool.ts`:
   - It should hold all of the tile's state (option state, selections, speech synthesis playback, and so on) and return the functions and variables the display needs.
   - Example:
     ```typescript
     import { useState, useCallback } from "react";
     import { useImprovBuffer } from "@/hooks/useImprovBuffer"; // Global buffer hook

     export function useMyNewTool() {
       const { pickItem } = useImprovBuffer();
       const [item, setItem] = useState<any>(null);
       const [loading, setLoading] = useState(false);

       const draw = useCallback(async () => {
         setLoading(true);
         const res = await pickItem("my_new_tool");
         setItem(res);
         setLoading(false);
       }, [pickItem]);

       return { item, loading, draw };
     }
     ```

2. **Create the display component** in `src/components/MyNewGenerator.tsx`:
   - It should import the custom hook and use it to render, without holding complex state of its own.
   - Example:
     ```tsx
     import React from "react";
     import { useMyNewTool } from "@/hooks/useMyNewTool";

     export function MyNewGenerator() {
       const { item, loading, draw } = useMyNewTool();

       return (
         <div className="p-6 bg-slate-900 rounded-xl">
           <h2 className="text-xl font-bold">New generator</h2>
           <button onClick={draw} disabled={loading}>Draw</button>
           {item && <p>{item.text}</p>}
         </div>
       );
     }
     ```

3. **Import and mount the component** in the `renderActiveComponent()` function of [src/app/page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx):
   ```tsx
   case "my_new_tool":
     return <MyNewGenerator />;
   ```


---

## Step 5: Supporting AI regeneration (Gemini through n8n)

So the tool can be refilled with fresh AI-generated suggestions:

1. **Edit the Next.js proxy API** in [src/app/api/improv-regen/route.ts](file:///c:/Projects/eole.me/improv-assist/src/app/api/improv-regen/route.ts):
   - Add your category name to the list of categories accepted for a targeted refill.
2. **Update the local population script** [scripts/populate_reservoir.py](file:///c:/Projects/eole.me/improv-assist/scripts/populate_reservoir.py):
   - Add the key to the Python refill configuration.
3. **Update the AI prompt** in [n8n/prompts/master.prompt](file:///c:/Projects/eole.me/improv-assist/n8n/prompts/master.prompt):
   - Declare a new `# SECTION my_new_tool` section, with examples that teach Gemini to generate rows in the right shape.
   - The section name has to match the category key exactly: that is what `parsePrompt` looks up, and what the weekly refresh passes as `category`.
