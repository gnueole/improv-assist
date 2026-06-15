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
import argparse
import sys
import textwrap
import logging

# Define color codes for formatting
COLOR_CYAN = "\033[1;36m"
COLOR_YELLOW = "\033[1;33m"
COLOR_RED = "\033[1;31m"
COLOR_GREEN = "\033[1;32m"
COLOR_RESET = "\033[0m"

class ColoredFormatter(logging.Formatter):
    COLORS = {
        logging.DEBUG: COLOR_CYAN,
        logging.INFO: COLOR_GREEN,
        logging.WARNING: COLOR_YELLOW,
        logging.ERROR: COLOR_RED,
        logging.CRITICAL: COLOR_RED,
    }

    def format(self, record):
        color = self.COLORS.get(record.levelno, COLOR_RESET)
        log_fmt = f"%(asctime)s [{color}%(levelname)s{COLOR_RESET}] %(message)s"
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)

def setup_logger(verbose=False):
    logger = logging.getLogger("populate_reservoir")
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    
    # Avoid duplicate handlers if setup_logger is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(ColoredFormatter())
        logger.addHandler(handler)
    else:
        logger.handlers[0].setLevel(logging.DEBUG if verbose else logging.INFO)
    return logger

# Initialize logger with default config (will be configured with args in main/fetch)
logger = setup_logger()

# Resolving directories relative to script path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
output_path = os.path.join(project_root, "public", "data", "reservoir-config.json")
prompt_path = os.path.join(project_root, "n8n", "prompts", "master.prompt")

def load_env():
    env_path = os.path.join(project_root, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

load_env()

N8N_WEBHOOK_URL = f"{os.getenv('N8N_BASE_URL', 'https://n8n.eole.me').rstrip('/')}/webhook/improv-regen"
X_N8N_TOKEN = os.getenv("X_N8N_TOKEN", "")

def parse_prompt(category=None, count=350):
    if not os.path.exists(prompt_path):
        raise FileNotFoundError(f"Prompt template file not found at: {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    current_section = None
    base_prompt = []
    footer_prompt = []
    sections = {}

    for line in lines:
        stripped = line.strip()
        if stripped == "# BASE SYSTEM PROMPT":
            current_section = "BASE"
            continue
        elif stripped == "# FOOTER":
            current_section = "FOOTER"
            continue
        elif stripped.startswith("# SECTION "):
            current_section = stripped.replace("# SECTION ", "").strip()
            continue
        elif stripped.startswith("# =") or (stripped.startswith("#") and len(stripped) < 5):
            continue

        if current_section == "BASE":
            base_prompt.append(line)
        elif current_section == "FOOTER":
            footer_prompt.append(line)
        elif current_section:
            if current_section not in sections:
                sections[current_section] = []
            sections[current_section].append(line)

    base_str = "".join(base_prompt).strip()
    footer_str = "".join(footer_prompt).strip()

    sections_str_dict = {}
    for name, content_lines in sections.items():
        sections_str_dict[name] = "".join(content_lines).strip()

    if category and category in sections_str_dict:
        sec_content = sections_str_dict[category].replace("{{count}}", str(count))
        assembled = f"{base_str}\n\n{sec_content}\n\n{footer_str}"
    else:
        all_sections_content = []
        ordered_sections = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters", "animals", "objects"]
        for name in ordered_sections:
            if name in sections_str_dict:
                items_count = count // len(ordered_sections) if count else 50
                all_sections_content.append(sections_str_dict[name].replace("{{count}}", str(items_count)))
        sections_str = "\n\n".join(all_sections_content)
        assembled = f"{base_str}\n\n{sections_str}\n\n{footer_str}"

    return assembled

def print_verbose_info(prompt, url, headers, payload):
    # Print compiled system prompt
    logger.debug(f"{COLOR_CYAN}--- COMPILED SYSTEM PROMPT ---{COLOR_RESET}\n{prompt}\n{COLOR_CYAN}------------------------------{COLOR_RESET}")
    
    # Print API request details
    logger.debug(f"{COLOR_CYAN}--- API REQUEST CONFIGURATION ---{COLOR_RESET}")
    logger.debug(f"{COLOR_YELLOW}URL:{COLOR_RESET} {url}")
    
    # Headers
    logger.debug(f"{COLOR_YELLOW}Headers:{COLOR_RESET}")
    logger.debug(f"  Content-Type: {headers.get('Content-Type')}")
    token = headers.get("x-n8n-token", "")
    masked_token = f"{token[:6]}...{token[-6:]}" if len(token) > 12 else ("********" if token else "None")
    logger.debug(f"  x-n8n-token: {masked_token}")
    
    # Payload parameters (with system_prompt truncated for display readability)
    display_payload = payload.copy()
    if "system_prompt" in display_payload:
        p = display_payload["system_prompt"]
        if len(p) > 80:
            display_payload["system_prompt"] = f"{p[:30]}... ({len(p)} chars) ...{p[-30:]}"

    logger.debug(f"{COLOR_YELLOW}Payload Body:{COLOR_RESET}\n{json.dumps(display_payload, indent=2, ensure_ascii=False)}")
    logger.debug(f"{COLOR_CYAN}---------------------------------{COLOR_RESET}")

def fetch_and_populate(category=None, update_all=False, verbose=False, dry_run=False, source="dev"):
    # Configure logger based on verbose flag
    setup_logger(verbose=verbose)

    # Determine what categories we are requesting
    all_categories = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters", "animals", "objects"]
    
    if category:
        categories_to_fetch = [category]
        count_to_request = 50
        logger.info(f"📡 Requesting regeneration of category: '{category}' (50 items)...")
    else:
        categories_to_fetch = all_categories
        count_to_request = 500
        logger.info(f"📡 Requesting full pool regeneration (500 items across 10 categories)...")

    # Generate system prompt dynamically from master.prompt
    try:
        system_prompt = parse_prompt(category=category, count=count_to_request)
    except Exception as e:
        logger.error(f"❌ Error parsing master.prompt: {e}")
        return

    # Request payload
    payload = {
        "count": count_to_request,
        "system_prompt": system_prompt,
        "source": source
    }
    if category:
        payload["category"] = category
    else:
        payload["categories_required"] = all_categories

    headers = {
        "Content-Type": "application/json",
        "x-n8n-token": X_N8N_TOKEN
    }

    if verbose:
        print_verbose_info(system_prompt, N8N_WEBHOOK_URL, headers, payload)

    if dry_run:
        logger.info("ℹ️ [Dry Run] Request payload compiled successfully. Skipping API call.")
        return

    try:
        # Timeout of 180s to let Gemini 2.5 Pro complete the generation run
        response = requests.post(N8N_WEBHOOK_URL, json=payload, headers=headers, timeout=180)

        # Checking for timeout responses wrapped by proxy/n8n gateway
        if not response.ok:
            try:
                err_data = response.json()
                if isinstance(err_data, dict):
                    err_msg = err_data.get("error", "") or err_data.get("message", "")
                    if "timeout" in err_msg.lower():
                        logger.error("❌ [Timeout] n8n generation expired (limit reached on Gemini model).")
                        return
            except Exception:
                pass

        response.raise_for_status()

        try:
            generated_data = response.json()
        except ValueError as json_err:
            logger.error(f"❌ Error parsing JSON from n8n. Status: {response.status_code}")
            logger.debug(f"Response Content: {response.text}")
            raise json_err

        # Load existing config to merge changes
        existing_data = {}
        if os.path.exists(output_path):
            try:
                with open(output_path, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            except Exception:
                pass

        # Make sure all keys exist in the target config dictionary
        for k in all_categories:
            if k not in existing_data:
                existing_data[k] = []

        # Merge new content
        for key, value in generated_data.items():
            if key in all_categories:
                existing_data[key] = value
                logger.info(f"✨ Category '{key}' updated with {len(value)} new items.")

        # Write back to output config file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ Static reservoir configuration successfully saved at: {output_path}")

    except requests.exceptions.Timeout:
        logger.error("❌ [Timeout] Request to n8n expired (network limit reached).")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Request error communicating with n8n: {e}")
    except ValueError as e:
        logger.error(f"❌ Data structure validation error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Populate/Update the static reservoir triggers pool.")
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument("--type", type=str, choices=["scenarios", "categories", "themes", "echauffements", "mgt", "warmup", "emotions", "locations", "eras", "characters", "animals", "objects"], help="Only update a specific generator category ('mgt' and 'warmup' are aliases for 'echauffements')")
    group.add_argument("--all", action="store_true", help="Regenerate all generator categories")
    parser.add_argument("--verbose", action="store_true", help="Print the compiled system prompt and API configuration to stderr")
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry run: compile and display prompt/payload, but do not send the request or write to config")
    parser.add_argument("--source", type=str, default="dev", choices=["prod", "dev", "other"], help="The source environment initiating the request")

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    # Default to --all if neither is specified
    update_all = args.all or (not args.type)
    category = args.type if not update_all else None

    if category in ["mgt", "warmup"]:
        category = "echauffements"

    try:
        fetch_and_populate(category=category, update_all=update_all, verbose=args.verbose, dry_run=args.dry_run, source=args.source)
    except KeyboardInterrupt:
        logger.warning("\n🛑 Process interrupted by user. Exiting...")