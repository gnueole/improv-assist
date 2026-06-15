# Guide : Ajouter un nouvel outil (Micro-app Tile)

Ce document décrit l'architecture et les étapes requises (la "pseudo API") pour ajouter une nouvelle tuile (micro-app) sur le tableau de bord de **Houba Houba!**.

---

## Architecture Générale

Le fonctionnement d'une tuile repose sur un modèle en 5 couches (séparation stricte de l'affichage et de la logique métier) :
1. **Configuration / Métadonnées** : La déclaration de la tuile dans le tableau de bord.
2. **Structure des Données (TypeScript & Cache)** : La définition du type de suggestion et l'initialisation du réservoir de repli (fallback).
3. **État Global / Logique de Tampon** : La gestion du tirage sans doublons via le hook contextuel global.
4. **Logique Métier Interne (Hook React Dédié)** : Un hook React personnalisé (`src/hooks/useMyNewTool.ts`) gérant l'état local, les paramètres de voix, de temps ou d'options spécifiques de la tuile.
5. **Composant UI / Affichage (Display Component)** : Un composant d'affichage pur (`src/components/MyNewTool.tsx`) qui consomme le hook dédié pour restituer l'interface graphique.


---

## Étape 1 : Déclaration de la Tuile (Métadonnées)

Toutes les tuiles sont configurées dans l'array `tiles` au sommet de [src/app/page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx).

Pour ajouter une tuile, déclarez un nouvel objet respectant l'interface `Tile` ([src/types/index.ts](file:///c:/Projects/eole.me/improv-assist/src/types/index.ts)) :

```typescript
{
  id: "my_new_tool",                  // ID unique de la tuile
  title: "Titre du Générateur",       // Affiché en grand sur la tuile et en en-tête
  subtitle: "Description courte",     // Description rapide affichée sous le titre
  icon: Sparkles,                     // Icône Lucide importée au début du fichier
  color: "from-purple-500 to-cyan-400", // Couleurs du dégradé (classes Tailwind)
  menu: "inspiration",                // Dossier parent optionnel ("incarnate", "inspiration", "warmup")
  keywords: ["mot1", "mot2"],         // Mots-clés pour la barre de recherche Spotlight
  helpDescription: <span>Description détaillée avec du formattage <strong>JSX</strong>.</span>
}
```

> [!TIP]
> Grâce à la propriété `helpDescription`, la documentation d'aide de l'outil est **générée automatiquement** à la fin du guide d'aide de l'application (`DocsView.tsx`). Plus besoin de modifier manuellement la documentation !

---

## Étape 2 : Déclaration et Initialisation des Données

Si votre outil tire des idées ou suggestions au sort depuis le réservoir IA :

1. **Définir l'interface de suggestion** dans [src/types/index.ts](file:///c:/Projects/eole.me/improv-assist/src/types/index.ts) :
   ```typescript
   export interface MyNewSuggestion {
     text: string;
     category?: string;
   }
   ```
2. **Ajouter la catégorie au tampon local `ImprovBuffer`** (toujours dans `index.ts`) :
   ```typescript
   export interface ImprovBuffer {
     // ... existants
     my_new_tool: MyNewSuggestion[];
   }
   ```
3. **Fournir les valeurs de repli (Fallback Mock Data)** :
   - Ajoutez une liste par défaut dans [src/data/mockData.ts](file:///c:/Projects/eole.me/improv-assist/src/data/mockData.ts) (ex: `MY_NEW_FALLBACKS`).
   - Ajoutez le tableau initialisé dans le fichier de configuration local [public/data/reservoir-config.json](file:///c:/Projects/eole.me/improv-assist/public/data/reservoir-config.json) sous la clé `my_new_tool`.
4. **Mettre à jour le tampon vide de sécurité** dans [src/utils/bufferUtils.ts](file:///c:/Projects/eole.me/improv-assist/src/utils/bufferUtils.ts) dans la constante `EMPTY_BUFFER` et les fonctions d'assainissement / validation :
   ```typescript
   export const EMPTY_BUFFER: ImprovBuffer = {
     // ...
     my_new_tool: [],
     last_fetch: null
   };
   ```

---

## Étape 3 : Logique de Tirage et Synchronisation Contextuelle

Pour que le bouton de tirage pioche dans le réservoir local et évite les répétitions (historique des 10 derniers tirages) :

1. **Enregistrer la catégorie** dans le hook contextuel principal [src/context/ImprovBufferContext.tsx](file:///c:/Projects/eole.me/improv-assist/src/context/ImprovBufferContext.tsx) :
   ```typescript
   const CATEGORIES = [
     // ... existants
     "my_new_tool"
   ];
   ```
2. La méthode `pickItem` du hook `useImprovBuffer` se chargera automatiquement d'extraire la suggestion, de la retirer du réservoir courant pour éviter les doublons, et de gérer l'historique de rotation locale.

---

## Étape 4 : Créer la Logique (Hook) et le Composant UI (Affichage)

Pour respecter la séparation de l'affichage et du fonctionnel, chaque tuile doit avoir sa logique isolée dans un hook personnalisé dédié, rendant le composant UI le plus simple et déclaratif possible.

1. **Créer le hook de logique métier** dans `src/hooks/useMyNewTool.ts` :
   - Ce hook doit encapsuler tout l'état de la tuile (ex: états d'options, sélections, lecture de synthèse vocale, etc.) et retourner les fonctions et variables nécessaires à l'affichage.
   - Exemple :
     ```typescript
     import { useState, useCallback } from "react";
     import { useImprovBuffer } from "@/hooks/useImprovBuffer"; // Hook global de gestion du tampon
     
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

2. **Créer le composant d'affichage** dans `src/components/MyNewGenerator.tsx` :
   - Ce composant doit importer le hook personnalisé et s'en servir pour l'affichage, sans gérer d'état complexe directement en son sein.
   - Exemple :
     ```tsx
     import React from "react";
     import { useMyNewTool } from "@/hooks/useMyNewTool";
     
     export function MyNewGenerator() {
       const { item, loading, draw } = useMyNewTool();
       
       return (
         <div className="p-6 bg-slate-900 rounded-xl">
           <h2 className="text-xl font-bold">Nouveau Générateur</h2>
           <button onClick={draw} disabled={loading}>Tirer</button>
           {item && <p>{item.text}</p>}
         </div>
       );
     }
     ```

3. **Importer et monter le composant** dans la fonction `renderActiveComponent()` de [src/app/page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx) :
   ```tsx
   case "my_new_tool":
     return <MyNewGenerator />;
   ```


---

## Étape 5 : Support de la Régénération par l'IA (Gemini via n8n)

Pour que l'outil puisse être rechargé avec des suggestions fraîches générées par l'IA :

1. **Modifier l'API de proxy Next.js** dans [src/app/api/improv-regen/route.ts](file:///c:/Projects/eole.me/improv-assist/src/app/api/improv-regen/route.ts) :
   - Ajoutez le nom de votre catégorie dans la liste des catégories acceptées pour le rechargement ciblé.
2. **Mettre à jour le script d'alimentation local** [scripts/populate_reservoir.py](file:///c:/Projects/eole.me/improv-assist/scripts/populate_reservoir.py) :
   - Ajoutez la clé dans la configuration python de rechargement en local.
3. **Mettre à jour le Prompt de l'IA** dans [n8n/prompts/master.prompt](file:///c:/Projects/eole.me/improv-assist/n8n/prompts/master.prompt) :
   - Déclarez une nouvelle section `# SECTION my_new_tool` avec des exemples pour apprendre à Gemini à générer des lignes au bon format.
