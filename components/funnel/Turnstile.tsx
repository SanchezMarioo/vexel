"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          language?: string;
          tabindex?: number;
          "response-field"?: boolean;
          "response-field-name"?: string;
          size?: "normal" | "compact" | "flexible";
          retry?: "auto" | "never";
          "retry-interval"?: number;
          "refresh-expired"?: "auto" | "manual" | "never";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
      execute: (container?: HTMLElement | string, options?: unknown) => void;
      isExpired: (widgetId?: string) => boolean;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: unknown) => void;
  resetKey?: number | string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
  action?: string;
  className?: string;
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";

/**
 * Componente cliente Turnstile optimizado para React 19 y Next.js.
 * Carga el script de Cloudflare con next/script strategy="afterInteractive"
 * y gestiona el ciclo de vida del widget.
 */
export default function Turnstile({
  siteKey,
  onVerify,
  onExpire,
  onError,
  resetKey,
  theme = "light",
  size = "flexible",
  appearance = "interaction-only",
  action = "funnel_lead",
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  });

  useEffect(() => {
    if (resetKey !== undefined && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Silenciar error en caso de que aún no esté inicializado
      }
    }
  }, [resetKey]);

  const renderWidget = () => {
    if (!containerRef.current || !window.turnstile) return;

    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Ignorar error al limpiar
      }
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme,
        size,
        appearance,
        callback: (token: string) => {
          callbacksRef.current.onVerify(token);
        },
        "expired-callback": () => {
          callbacksRef.current.onExpire?.();
        },
        "error-callback": (err: unknown) => {
          callbacksRef.current.onError?.(err);
        },
      });

      widgetIdRef.current = id;
    } catch (err) {
      console.error("[turnstile] Error renderizando el widget:", err);
    }
  };

  useEffect(() => {
    if (!siteKey) return;

    if (window.turnstile) {
      renderWidget();
    } else {
      const prevOnload = window.onloadTurnstileCallback;
      window.onloadTurnstileCallback = () => {
        if (typeof prevOnload === "function") prevOnload();
        renderWidget();
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Silenciar limpieza de widget desmontado
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, theme, size, appearance]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src={TURNSTILE_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={renderWidget}
        onError={(err) => {
          console.error("[turnstile] Error al cargar el script de Cloudflare:", err);
          callbacksRef.current.onError?.(err);
        }}
      />
      <div
        ref={containerRef}
        className={className ?? "min-h-[40px] flex items-center justify-start"}
        aria-label="Verificación de seguridad Cloudflare Turnstile"
      />
    </>
  );
}
