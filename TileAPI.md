# Guide : Ajouter un nouvel outil (Micro-app Tile)

Ce document décrit l'architecture et les étapes requises (la "pseudo API") pour ajouter une nouvelle tuile (micro-app) sur le tableau de bord de **Houba Houba!**.

---

## Architecture Générale

Le fonctionnement d'une tuile repose sur un modèle en 4 couches :
1. **Configuration / Métadonnées** : La déclaration de la tuile dans le tableau de bord.
2. **Structure des Données (TypeScript & Cache)** : La définition du type de suggestion et l'initialisation du réservoir de repli (fallback).
3. **État Global / Logique Métier** : La gestion du tirage sans doublons via le hook contextuel.
4. **Composant UI / Affichage** : Le générateur de scène interactif monté à l'écran.

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

## Étape 4 : Créer et Monter le Composant UI

1. **Créer le composant de vue** dans `src/components/` (ex: `MyNewGenerator.tsx`).
   - Pour un tirage de texte standard, vous pouvez réutiliser directement le composant mutualisé `<GenericGenerator>` :
     ```tsx
     <GenericGenerator
       categoryKey="my_new_tool"
       title="Titre de l'outil"
       pickItem={pickItem}
       itemsPool={reservoirPool.my_new_tool || []}
     />
     ```
2. **Importer et monter le composant** dans la fonction `renderActiveComponent()` de [src/app/page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx) :
   ```tsx
   case "my_new_tool":
     return (
       <GenericGenerator
         categoryKey="my_new_tool"
         title="Titre"
         pickItem={pickItem}
         itemsPool={reservoirPool.my_new_tool || []}
       />
     );
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
