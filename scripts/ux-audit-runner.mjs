import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import axeCore from "axe-core";

const ARTIFACT_DIR = "C:\\Users\\Mario\\.gemini\\antigravity\\brain\\9cd159c3-afad-4a46-ab2d-7c43b6d5855c";
const isAfter = process.argv.includes("--after");
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, "screenshots", isAfter ? "after" : "before");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:3000";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/empezar", name: "funnel-intro" },
  { path: "/proyectos", name: "proyectos" },
  { path: "/proyectos/grieta", name: "proyecto-grieta" },
  { path: "/blog", name: "blog" },
  { path: "/blog/como-conseguir-clientes-internet-empresa-salamanca", name: "blog-post" },
  { path: "/tiendas-online", name: "service-tiendas" },
  { path: "/aviso-legal", name: "aviso-legal" },
  { path: "/privacidad", name: "privacidad" },
  { path: "/cookies", name: "cookies" }
];

async function runAudit() {
  console.log("🚀 Starting UX & Impeccable Audit Harness...");
  const browser = await chromium.launch({ headless: true });

  const auditReport = {
    timestamp: new Date().toISOString(),
    routesAudited: [],
    hardGates: {
      consoleErrors: 0,
      consoleWarnings: 0,
      network5xx: 0,
      network4xx: 0,
      layoutOverflows: 0,
      axeCritical: 0,
      axeSerious: 0
    },
    findings: [],
    interactionManifest: []
  };

  const logInteraction = (step, detail, status = "PASS") => {
    const time = new Date().toLocaleTimeString();
    auditReport.interactionManifest.push({ time, step, detail, status });
    console.log(`[${time}] [${status}] ${step} — ${detail}`);
  };

  // 1. Static and a11y sweeps across all routes
  for (const route of ROUTES) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    const consoleLogs = [];
    const networkFailures = [];

    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error") {
        auditReport.hardGates.consoleErrors++;
        consoleLogs.push({ type: "error", text });
      } else if (type === "warning") {
        auditReport.hardGates.consoleWarnings++;
        consoleLogs.push({ type: "warning", text });
      }
    });

    page.on("response", (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 500) {
        auditReport.hardGates.network5xx++;
        networkFailures.push({ status, url });
      } else if (status >= 400 && !url.includes("favicon") && !url.includes("analytics") && !url.includes("turnstile")) {
        auditReport.hardGates.network4xx++;
        networkFailures.push({ status, url });
      }
    });

    const targetUrl = `${BASE_URL}${route.path}`;
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // Desktop screenshot
    const desktopScreenshotPath = path.join(SCREENSHOTS_DIR, `${route.name}-desktop.png`);
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false });

    // Layout overflow detection on desktop
    const desktopOverflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const elements = Array.from(document.querySelectorAll("*"));
      const overflows = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 2) {
          overflows.push({ tag: el.tagName, className: el.className, right: rect.right, docWidth });
        }
      }
      return overflows;
    });

    if (desktopOverflow.length > 0) {
      auditReport.hardGates.layoutOverflows += desktopOverflow.length;
      auditReport.findings.push({
        severity: "High",
        route: route.path,
        viewport: "desktop",
        description: `Layout horizontal overflow detected on ${desktopOverflow.length} element(s).`,
        details: desktopOverflow.slice(0, 3)
      });
    }

    // Local Axe a11y check via page.evaluate
    let a11yViolations = [];
    try {
      const axeResults = await page.evaluate((source) => {
        // @ts-expect-error eval injected in browser context
        window.eval(source);
        // @ts-expect-error axe added to window
        return window.axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
          }
        });
      }, axeCore.source);

      for (const v of axeResults.violations) {
        if (v.impact === "critical") auditReport.hardGates.axeCritical++;
        if (v.impact === "serious") auditReport.hardGates.axeSerious++;
        a11yViolations.push({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
          helpUrl: v.helpUrl
        });
      }
    } catch (err) {
      console.error(`Axe evaluation failed on ${route.path}:`, err.message);
    }

    // Measure pragmatic performance budget (LCP, CLS) on home and empezar
    let perfMetrics = null;
    if (route.path === "/" || route.path === "/empezar") {
      perfMetrics = await page.evaluate(() => {
        const navEntries = performance.getEntriesByType("navigation");
        const nav = navEntries.length > 0 ? (navEntries[0] /* @type any */) : null;
        const paintEntries = performance.getEntriesByType("paint");
        const fcp = paintEntries.find(p => p.name === "first-contentful-paint")?.startTime || 0;

        return {
          fcpMs: Math.round(fcp),
          domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
          loadMs: nav ? Math.round(nav.loadEventEnd) : 0
        };
      });
      logInteraction(`Performance on ${route.path}`, `FCP: ${perfMetrics.fcpMs}ms, DOMContentLoaded: ${perfMetrics.domContentLoadedMs}ms`);
    }

    // Mobile Viewport test
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const mobileScreenshotPath = path.join(SCREENSHOTS_DIR, `${route.name}-mobile.png`);
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });

    const mobileOverflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const elements = Array.from(document.querySelectorAll("*"));
      const overflows = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 2) {
          overflows.push({ tag: el.tagName, className: el.className, right: rect.right, docWidth });
        }
      }
      return overflows;
    });

    if (mobileOverflow.length > 0) {
      auditReport.hardGates.layoutOverflows += mobileOverflow.length;
      auditReport.findings.push({
        severity: "High",
        route: route.path,
        viewport: "mobile",
        description: `Layout horizontal overflow on mobile viewport (375px) on ${mobileOverflow.length} element(s).`,
        details: mobileOverflow.slice(0, 3)
      });
    }

    auditReport.routesAudited.push({
      route: route.path,
      name: route.name,
      consoleLogs,
      networkFailures,
      a11yViolations,
      desktopOverflowCount: desktopOverflow.length,
      mobileOverflowCount: mobileOverflow.length
    });

    logInteraction(`Audit sweep: ${route.path}`, `A11y violations: ${a11yViolations.length}, Console: ${consoleLogs.length}`);

    await context.close();
  }

  // 2. Interactive user flows walkthrough
  console.log("\n🧪 Running Interactive User Flows...");

  // Flow 1: Landing Page (Mobile Menu, Accordion, Contact Form)
  {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Test mobile menu toggle
    logInteraction("Flow 1: Mobile Menu", "Opening burger menu...");
    const menuBtn = page.locator('header button[aria-label*="menú" i], header button[aria-label*="menu" i]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-mobile-menu-open.png") });
      const menuExpanded = await menuBtn.getAttribute("aria-expanded");
      logInteraction("Flow 1: Mobile Menu", `Menu opened, aria-expanded=${menuExpanded}`);
      // Close menu
      await menuBtn.click();
      await page.waitForTimeout(300);
    }

    // Switch to desktop for Contact Form and Accordions
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);

    // Test FAQ Accordion
    logInteraction("Flow 1: FAQ Accordion", "Testing accordion expand/collapse");
    const faqButtons = page.locator('section[aria-label="Preguntas frecuentes"] button[aria-expanded]');
    const count = await faqButtons.count();
    if (count > 1) {
      await faqButtons.nth(1).click();
      await page.waitForTimeout(300);
      const isExpanded = await faqButtons.nth(1).getAttribute("aria-expanded");
      logInteraction("Flow 1: FAQ Accordion", `Clicked FAQ item 2, aria-expanded=${isExpanded}`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-faq-expanded.png") });
    }

    // Test Contact Form Validation
    logInteraction("Flow 1: Contact Form", "Triggering empty form validation");
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const submitBtn = page.locator('#contacto button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-contact-validation-errors.png") });

      const nameError = page.locator('#contact-name[aria-invalid="true"]');
      const hasErrors = await nameError.count();
      logInteraction("Flow 1: Contact Form", `Validation triggered. Name invalid=${hasErrors > 0}`);

      // Fill in valid data
      await page.fill('#contact-name', 'Persona Auditora');
      await page.fill('#contact-email', 'auditor@test.com');
      await page.fill('#contact-message', 'Estamos realizando una auditoría interactiva completa del producto.');
      const consentLabel = page.locator('label[for="contact-consent"]');
      await consentLabel.click();
      await page.waitForTimeout(200);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-contact-filled.png") });
      logInteraction("Flow 1: Contact Form", "Form filled with valid data");
    }

    await context.close();
  }

  // Flow 2: Funnel Flow (/empezar)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/empezar`, { waitUntil: "networkidle" });

    logInteraction("Flow 2: Funnel", "Landing on /empezar intro");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-funnel-0-intro.png") });

    // Click Empezar
    const startBtn = page.locator('button:has-text("Empezar")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }

    // Step 1: Situacion (Choice)
    logInteraction("Flow 2: Funnel", "Step 1: Selecting situation option");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-funnel-1-step.png") });
    let option = page.locator('button[aria-pressed]').first();
    if (await option.isVisible()) {
      await option.click();
      await page.waitForTimeout(500);
    }

    // Step 2: Tipo (Choice)
    logInteraction("Flow 2: Funnel", "Step 2: Selecting project type");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-funnel-2-step.png") });
    option = page.locator('button[aria-pressed]').first();
    if (await option.isVisible()) {
      await option.click();
      await page.waitForTimeout(500);
    }

    // Remaining steps
    for (let stepCount = 3; stepCount <= 12; stepCount++) {
      await page.waitForTimeout(300);
      const choiceBtn = page.locator('button[aria-pressed]').first();
      const inputEl = page.locator('input:not([tabindex="-1"]), textarea').first();
      const consentLabel = page.locator('label[for="funnel-consent"]');
      const submitStepBtn = page.locator('button[type="submit"]');

      if (await choiceBtn.isVisible()) {
        logInteraction("Flow 2: Funnel", `Step ${stepCount}: Choice option clicked`);
        await choiceBtn.click();
        await page.waitForTimeout(500);
      } else if (await inputEl.isVisible()) {
        const inputType = await inputEl.getAttribute("type");
        const inputId = (await inputEl.getAttribute("id")) || "";

        if (inputType === "email" || inputId.includes("email")) {
          logInteraction("Flow 2: Funnel", `Step ${stepCount}: Email + Consent`);
          await inputEl.fill("fundador@empresa.es");
          if (await consentLabel.isVisible()) {
            await consentLabel.click();
            await page.waitForTimeout(150);
          }
        } else if (inputType === "tel" || inputId.includes("telefono")) {
          logInteraction("Flow 2: Funnel", `Step ${stepCount}: Phone number`);
          await inputEl.fill("600123456");
        } else if (inputId.includes("nombre")) {
          logInteraction("Flow 2: Funnel", `Step ${stepCount}: Name`);
          await inputEl.fill("Carlos Martín");
        } else if (inputId.includes("empresa")) {
          logInteraction("Flow 2: Funnel", `Step ${stepCount}: Company`);
          await inputEl.fill("Salamanca Tech S.L.");
        } else {
          logInteraction("Flow 2: Funnel", `Step ${stepCount}: Description text`);
          await inputEl.fill("Queremos rediseñar la web corporativa para aumentar la captación.");
        }

        await page.waitForTimeout(200);
        if (await submitStepBtn.isVisible()) {
          await submitStepBtn.click();
          await page.waitForTimeout(600);
        }
      } else {
        logInteraction("Flow 2: Funnel", `Reached summary view or end of sequence at step ${stepCount}`);
        break;
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "flow-funnel-final-summary.png") });
    logInteraction("Flow 2: Funnel", "Funnel completed and summary view captured.");

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(ARTIFACT_DIR, "ux-audit-data.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n✅ Audit data written to ${reportPath}`);
  console.log("Hard Gate Summary:", auditReport.hardGates);
  console.log("A11y Critical:", auditReport.hardGates.axeCritical, "Serious:", auditReport.hardGates.axeSerious);
  console.log("Console Errors:", auditReport.hardGates.consoleErrors, "Warnings:", auditReport.hardGates.consoleWarnings);
}

runAudit().catch((err) => {
  console.error("Audit harness error:", err);
  process.exit(1);
});
