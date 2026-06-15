/**
 * @file notion_fetch.js
 * @description Script to fetch constraints from Notion database/page and write them to a local JSON cache.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to load .env secrets locally without dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}
loadEnv();
const db_id = process.env.NOTION_DATABASE_ID;
const api_key = process.env.NOTION_API_KEY;

if (!db_id) {
  console.error("Error: NOTION_DATABASE_ID environment variable is missing.");
  process.exit(1);
}
if (!api_key) {
  console.error("Error: NOTION_API_KEY environment variable is missing.");
  process.exit(1);
}
const outputPath = path.join(__dirname, '..', 'src', 'data', 'notionConstraints.json');

function makeRequest(url, method, headers, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("Failed to parse JSON response: " + body));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function parseDatabaseResults(results) {
  return results.map((item, index) => {
    const props = item.properties || {};
    
    // Find Title property
    let title = "";
    const titleKey = Object.keys(props).find(k => props[k].type === "title");
    if (titleKey && props[titleKey].title && props[titleKey].title[0]) {
      title = props[titleKey].title[0].plain_text;
    }
    
    // Find Description property
    let description = "";
    const descKey = Object.keys(props).find(k => k.toLowerCase() === "description" || props[k].type === "rich_text");
    if (descKey && props[descKey].rich_text && props[descKey].rich_text[0]) {
      description = props[descKey].rich_text[0].plain_text;
    }

    // Find Category property
    let category = "Général";
    const catKey = Object.keys(props).find(k => k.toLowerCase().includes("cat") || props[k].type === "select" || props[k].type === "multi_select");
    if (catKey) {
      if (props[catKey].type === "select" && props[catKey].select) {
        category = props[catKey].select.name;
      } else if (props[catKey].type === "multi_select" && props[catKey].multi_select && props[catKey].multi_select[0]) {
        category = props[catKey].multi_select[0].name;
      }
    }

    return {
      id: item.id || String(index + 1),
      title: title || "Contrainte",
      description: description || "Aucun détail",
      category: category
    };
  });
}

function parseBlockResults(results) {
  const constraints = [];
  
  for (const block of results) {
    let text = "";
    if (block.type === "paragraph" && block.paragraph.rich_text && block.paragraph.rich_text[0]) {
      text = block.paragraph.rich_text.map(t => t.plain_text).join("");
    } else if (block.type === "bulleted_list_item" && block.bulleted_list_item.rich_text && block.bulleted_list_item.rich_text[0]) {
      text = block.bulleted_list_item.rich_text.map(t => t.plain_text).join("");
    } else if (block.type === "numbered_list_item" && block.numbered_list_item.rich_text && block.numbered_list_item.rich_text[0]) {
      text = block.numbered_list_item.rich_text.map(t => t.plain_text).join("");
    } else if (block.type && block[block.type] && block[block.type].rich_text) {
      text = block[block.type].rich_text.map(t => t.plain_text).join("");
    }
    
    if (!text.trim()) continue;
    
    // Check if format is "Title - Description" or "Title: Description"
    const match = text.match(/^([^:-]+)[:\-](.+)$/);
    if (match) {
      constraints.push({
        id: block.id || String(constraints.length + 1),
        title: match[1].trim(),
        description: match[2].trim(),
        category: "Général"
      });
    } else {
      constraints.push({
        id: block.id || String(constraints.length + 1),
        title: text.substring(0, 30).trim() + "...",
        description: text.trim(),
        category: "Général"
      });
    }
  }
  return constraints;
}

async function run() {
  console.log("[+] Fetching Notion database / page constraints...");
  let constraints = [];
  
  // 1. Try querying as database
  try {
    const res = await makeRequest(
      `https://api.notion.com/v1/databases/${db_id}/query`,
      'POST',
      {
        "Authorization": `Bearer ${api_key}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    );
    if (res.results && res.results.length > 0) {
      constraints = parseDatabaseResults(res.results);
      console.log(`[+] Successfully parsed ${constraints.length} constraints from database properties.`);
    }
  } catch (e) {
    // Database query failed or returned no results
  }

  // 2. Try querying page blocks if database returned nothing
  if (constraints.length === 0) {
    try {
      const res = await makeRequest(
        `https://api.notion.com/v1/blocks/${db_id}/children`,
        'GET',
        {
          "Authorization": `Bearer ${api_key}`,
          "Notion-Version": "2022-06-28"
        }
      );
      if (res.results && res.results.length > 0) {
        constraints = parseBlockResults(res.results);
        console.log(`[+] Successfully parsed ${constraints.length} constraints from page blocks.`);
      }
    } catch (e) {
      console.error("[-] Failed to query block children:", e.message);
    }
  }

  if (constraints.length > 0) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(constraints, null, 2), 'utf-8');
      console.log(`[+] Wrote ${constraints.length} constraints to ${outputPath}`);
    } catch (err) {
      console.error("[-] Failed to write JSON cache:", err.message);
    }
  } else {
    console.log("[-] No constraints retrieved. Keeping existing fallback constraints.");
  }
}

run();
