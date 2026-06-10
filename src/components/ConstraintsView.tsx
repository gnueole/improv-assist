"use client";

/**
 * @file ConstraintsView.tsx
 * @description View showing improvisation constraints fetched from Notion. Supports text searching,
 * category filter tabs, and displays structured constraint detail cards.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import notionConstraintsStatic from "@/data/notionConstraints.json";

export default function ConstraintsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [constraints, setConstraints] = useState<any[]>(notionConstraintsStatic);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/constraints")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setConstraints(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load constraints from API, using static cache:", err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(constraints.map((c) => c.category));
    return ["Toutes", ...Array.from(cats)];
  }, [constraints]);

  const filteredConstraints = useMemo(() => {
    return constraints.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Toutes" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, constraints]);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-180px)] max-w-md mx-auto relative px-2">
      {/* Search Bar */}
      <div className="relative mb-3 w-full">
        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Rechercher une contrainte..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 w-full flex-nowrap scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 border ${
              selectedCategory === cat
                ? "bg-zinc-100 text-black border-zinc-100 font-bold"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Constraints List */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800 w-full">
        {filteredConstraints.length > 0 ? (
          filteredConstraints.map((constraint) => (
            <div
              key={constraint.id}
              className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors flex flex-col gap-1.5 w-full text-left"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-100">{constraint.title}</h4>
                <span className="px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  {constraint.category}
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-light leading-relaxed">
                {constraint.description}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-zinc-500 text-sm w-full">
            Aucune contrainte trouvée pour votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
