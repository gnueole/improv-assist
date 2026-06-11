#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
@file populate_reservoir.py
@description Fetches a new batch of random improvisation triggers from n8n and populates the local static reservoir pool config file.
@author Éole <hi@eole>
@creation-date 2026-06-11
@license MIT
"""


import os
import json
import requests

# URL de ton webhook n8n (à adapter avec ton vrai domaine ou IP de VPS)
N8N_WEBHOOK_URL = os.getenv("N8N_POPULATE_URL", "https://n8n.eole.me/webhook/improv-regen")

def fetch_and_populate():
    print(f"📡 Connexion à n8n ({N8N_WEBHOOK_URL}) pour générer le lot d'improvisation...")
    
    # Corps de la requête pour guider n8n sur ce qu'on attend
    payload = {
        "count": 350,
        "categories_required": ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras"]
    }
    
    try:
        # Timeout de 180 secondes validé pour laisser le temps à Gemini 2.5 Pro de générer les 350 items
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=180)
        
        # Si la requête échoue, on regarde s'il s'agit d'un timeout renvoyé par n8n (ex: 504)
        if not response.ok:
            try:
                err_data = response.json()
                if isinstance(err_data, dict):
                    err_msg = err_data.get("error", "") or err_data.get("message", "")
                    if "timeout" in err_msg.lower():
                        print("❌ [Timeout] La génération de n8n a expiré (limite de 10s dépassée sur le modèle Gemini).")
                        return
            except Exception:
                pass
                
        response.raise_for_status()
        
        try:
            generated_data = response.json()
        except ValueError as json_err:
            print(f"❌ Erreur parsing JSON de n8n. Status: {response.status_code}")
            print(f"Content: {response.text}")
            raise json_err
        
        # Validation stricte des clés pour ne pas casser le TypeScript de l'App
        required_keys = {"scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras"}
        if not required_keys.issubset(generated_data.keys()):
            raise ValueError(f"L'arnaque ! n8n a renvoyé des clés invalides. Clés reçues : {list(generated_data.keys())}")
            
        # Définition du chemin de sortie dans Next.js (résolu de manière robuste par rapport à la racine)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        output_path = os.path.join(project_root, "public", "data", "reservoir-config.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(generated_data, f, ensure_ascii=False, indent=2)
            
        print(f"✨ Réservoir statique de 350 entrées généré avec succès via n8n : {output_path}")
        
    except requests.exceptions.Timeout:
        print("❌ [Timeout] La requête vers n8n a expiré après 12 secondes (limite réseau).")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la requête n8n : {e}")
    except ValueError as e:
        print(f"❌ Erreur de structure de données : {e}")

if __name__ == "__main__":
    try:
        fetch_and_populate()
    except KeyboardInterrupt:
        print("\n🛑 Processus interrompu par l'utilisateur (Ctrl+C). Sortie...")