import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { LeadInsert, LeadStatus, LeadScoreTier } from "../lib/supabase/types";

/**
 * Script de migración segura de leads históricos desde Google Sheets / CSV hacia Supabase.
 *
 * Características:
 * 1. Mapeo completo y tolerante de columnas históricas (español e inglés).
 * 2. Deduplicación inteligente por `id` y por tupla `(email, created_at)`.
 * 3. Modo seguro `--dry-run` para simular y verificar sin escribir en BD.
 * 4. Preservación exacta de fechas de creación y respuestas originales.
 *
 * Uso:
 *   npx tsx scripts/migrate-leads-from-sheets.ts --file=./leads-export.csv [--dry-run]
 *   npx tsx scripts/migrate-leads-from-sheets.ts --json=./leads-export.json [--dry-run]
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper para parsear CSV simple con soporte para comillas
function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVRow(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

function normalizeStatus(raw: string | undefined): LeadStatus {
  const val = (raw ?? "").toLowerCase().trim();
  if (val.includes("contact")) return "contactado";
  if (val.includes("llamada") || val.includes("agendada") || val.includes("cal")) return "llamada_agendada";
  if (val.includes("propuesta")) return "propuesta_enviada";
  if (val.includes("ganad") || val.includes("cerrad") || val.includes("won")) return "ganado";
  if (val.includes("perdid") || val.includes("descart") || val.includes("lost")) return "perdido";
  return "nuevo";
}

function normalizeTier(raw: string | undefined, score: number): LeadScoreTier {
  const val = (raw ?? "").toLowerCase().trim();
  if (val.includes("alt") || val.includes("hot") || score >= 65) return "alta";
  if (val.includes("med") || val.includes("warm") || score >= 40) return "media";
  return "baja";
}

function mapRowToLeadInsert(row: Record<string, string>): LeadInsert | null {
  // Buscar email en diferentes variantes de cabecera
  const email = (
    row.email ||
    row["correo"] ||
    row["e-mail"] ||
    row["correo electrónico"] ||
    ""
  ).trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return null; // Omitir filas sin email válido
  }

  const nombre = (row.nombre || row["name"] || row["contacto"] || "Sin nombre").trim();
  const empresa = (row.empresa || row["company"] || "").trim() || null;
  const telefono = (row.telefono || row["phone"] || row["móvil"] || row["movil"] || "").trim() || null;
  const descripcion = (row.descripcion || row["description"] || row["mensaje"] || row["message"] || "").trim() || null;

  const situacion = (row.situacion || row["situation"] || "No especificada").trim();
  const situacionDetalle = (row.situacion_detalle || row["situaciondetalle"] || "").trim() || null;
  const tipo = (row.tipo || row["type"] || row["proyecto"] || "web-nueva").trim();
  const objetivo = (row.objetivo || row["goal"] || "").trim() || null;
  const catalogo = (row.catalogo || row["catalog"] || "").trim() || null;
  const webActual = (row.web_actual || row["webactual"] || row["current_website"] || "").trim() || null;
  const presupuesto = (row.presupuesto || row["budget"] || row["inversión"] || "no-claro").trim();
  const plazo = (row.plazo || row["timeline"] || "explorando").trim();

  // Atribución
  const landingPage = (row.landing_page || row["landing"] || "").trim() || null;
  const formPage = (row.form_page || row["form"] || "/empezar").trim() || null;
  const currentUrl = (row.current_url || "").trim() || null;
  const referrer = (row.referrer || row["referral"] || "").trim() || null;
  const utmSource = (row.utm_source || "").trim() || null;
  const utmMedium = (row.utm_medium || "").trim() || null;
  const utmCampaign = (row.utm_campaign || "").trim() || null;
  const utmContent = (row.utm_content || "").trim() || null;
  const utmTerm = (row.utm_term || "").trim() || null;

  // Fechas y Scoring
  const rawDate = row.created_at || row.fecha || row.date || new Date().toISOString();
  let createdAt: string;
  try {
    createdAt = new Date(rawDate).toISOString();
  } catch {
    createdAt = new Date().toISOString();
  }

  const scoreValue = parseInt(row.lead_score || row.score || "50", 10) || 50;
  const scoreTier = normalizeTier(row.lead_temperature || row.temperature || row.tier, scoreValue);
  const status = normalizeStatus(row.status || row.estado);
  const isUpdate = (row.actualizacion || "").toLowerCase().includes("s") || (row.actualizacion || "").toLowerCase() === "true";

  const leadId = row.lead_id || row.id;

  return {
    ...(leadId ? { id: leadId } : {}),
    created_at: createdAt,
    status,
    nombre,
    empresa,
    email,
    telefono,
    descripcion,
    situacion,
    situacion_detalle: situacionDetalle,
    tipo,
    objetivo,
    catalogo,
    web_actual: webActual,
    presupuesto,
    plazo,
    landing_page: landingPage,
    form_page: formPage,
    current_url: currentUrl,
    referrer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    score_value: scoreValue,
    score_tier: scoreTier,
    score_reasons: row.lead_score_reasons ? row.lead_score_reasons.split(",").map((s) => s.trim()) : [],
    is_update: isUpdate,
    notes: row.notes || row.notas || "",
    raw_answers: row,
  };
}

async function runMigration() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => a.startsWith("--file="))?.split("=")[1];
  const jsonArg = args.find((a) => a.startsWith("--json="))?.split("=")[1];

  console.log("===============================================================");
  console.log("🚀 MIGRACIÓN SEGURA DE LEADS A SUPABASE");
  console.log(`Modo: ${isDryRun ? "🧪 DRY RUN (Simulación sin escritura)" : "⚡ PRODUCCIÓN (Escritura activa)"}`);
  console.log("===============================================================\n");

  let rawRows: Array<Record<string, string>> = [];

  if (fileArg) {
    const fullPath = path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Archivo CSV no encontrado: ${fullPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    rawRows = parseCSV(content);
    console.log(`📂 Leídas ${rawRows.length} filas desde el archivo CSV: ${fileArg}`);
  } else if (jsonArg) {
    const fullPath = path.resolve(process.cwd(), jsonArg);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Archivo JSON no encontrado: ${fullPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    rawRows = JSON.parse(content);
    console.log(`📂 Leídos ${rawRows.length} registros desde el archivo JSON: ${jsonArg}`);
  } else {
    console.log("ℹ️ No se especificó archivo local (--file o --json).");
    console.log("Ejecuta con:");
    console.log("  npx tsx scripts/migrate-leads-from-sheets.ts --file=./leads.csv --dry-run");
    console.log("  npx tsx scripts/migrate-leads-from-sheets.ts --json=./leads.json");
    return;
  }

  // 1. Obtener leads existentes en Supabase para evitar duplicados
  console.log("🔍 Consultando leads existentes en Supabase para deduplicación...");
  const { data: existingLeads, error: queryError } = await supabase
    .from("leads")
    .select("id, email, created_at");

  if (queryError) {
    console.error("❌ Error al consultar Supabase:", queryError.message);
    process.exit(1);
  }

  const existingEmailDateSet = new Set(
    (existingLeads || []).map((l) => `${l.email}::${new Date(l.created_at).toISOString().slice(0, 10)}`),
  );
  const existingIdSet = new Set((existingLeads || []).map((l) => l.id));

  console.log(`✅ Leads actuales en Supabase: ${existingLeads?.length || 0}`);

  // 2. Mapear y filtrar duplicados
  const leadsToInsert: LeadInsert[] = [];
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  for (const rawRow of rawRows) {
    const mapped = mapRowToLeadInsert(rawRow);
    if (!mapped) {
      skippedInvalid++;
      continue;
    }

    const emailDateKey = `${mapped.email}::${new Date(mapped.created_at || "").toISOString().slice(0, 10)}`;
    if ((mapped.id && existingIdSet.has(mapped.id)) || existingEmailDateSet.has(emailDateKey)) {
      skippedDuplicates++;
      continue;
    }

    // Registrar para evitar duplicados dentro del mismo archivo
    if (mapped.id) existingIdSet.add(mapped.id);
    existingEmailDateSet.add(emailDateKey);
    leadsToInsert.push(mapped);
  }

  console.log("\n📊 RESUMEN DE MAPEO:");
  console.log(`  - Total filas leídas: ${rawRows.length}`);
  console.log(`  - Leads válidos para importar: ${leadsToInsert.length}`);
  console.log(`  - Duplicados omitidos: ${skippedDuplicates}`);
  console.log(`  - Filas omitidas (sin email válido): ${skippedInvalid}`);

  if (leadsToInsert.length === 0) {
    console.log("\n✨ Todos los leads ya están migrados o no hay registros nuevos que insertar.");
    return;
  }

  if (isDryRun) {
    console.log("\n🧪 Muestra del primer lead a insertar:");
    console.log(JSON.stringify(leadsToInsert[0], null, 2));
    console.log("\n✅ Dry run completado con éxito. Ejecuta sin '--dry-run' para aplicar los cambios.");
    return;
  }

  // 3. Inserción por lotes
  console.log(`\n⚡ Insertando ${leadsToInsert.length} leads en Supabase...`);
  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let i = 0; i < leadsToInsert.length; i += BATCH_SIZE) {
    const batch = leadsToInsert.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase.from("leads").insert(batch);

    if (insertError) {
      console.error(`❌ Error en el lote ${i / BATCH_SIZE + 1}:`, insertError.message);
    } else {
      insertedCount += batch.length;
      console.log(`  ✓ Insertados ${insertedCount} de ${leadsToInsert.length}`);
    }
  }

  console.log(`\n🎉 Migración finalizada: ${insertedCount} leads guardados en Supabase.`);
}

runMigration().catch((err) => {
  console.error("❌ Error inesperado durante la migración:", err);
  process.exit(1);
});
