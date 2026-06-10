import os
import json
import requests

# URL de ton webhook n8n (à adapter avec ton vrai domaine ou IP de VPS)
N8N_WEBHOOK_URL = os.getenv("N8N_POPULATE_URL", "https://n8n.eole.me/webhook/improv-regen")

def fetch_and_populate():
    print(f"📡 Connexion à n8n ({N8N_WEBHOOK_URL}) pour générer le lot d'improvisation...")
    
    # Corps de la requête pour guider n8n sur ce qu'on attend
    payload = {
        "count": 150,
        "categories_required": ["scenarios", "categories", "themes", "echauffements"]
    }
    
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        # On attend de n8n un JSON avec la structure exacte :
        # { "scenarios": [...], "categories": [...], "themes": [...], "echauffements": [...] }
        generated_data = response.json()
        
        # Validation stricte des clés pour ne pas casser le TypeScript de l'App
        required_keys = {"scenarios", "categories", "themes", "echauffements"}
        if not required_keys.issubset(generated_data.keys()):
            raise ValueError(f"L'arnaque ! n8n a renvoyé des clés invalides. Clés reçues : {list(generated_data.keys())}")
            
        # Définition du chemin de sortie dans Next.js
        output_path = os.path.join("public", "data", "reservoir-config.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(generated_data, f, ensure_ascii=False, indent=2)
            
        print(f"✨ Réservoir statique de 150 entrées généré avec succès via n8n : {output_path}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la requête n8n : {e}")
    except ValueError as e:
        print(f"❌ Erreur de structure de données : {e}")

if __name__ == "__main__":
    fetch_and_populate()