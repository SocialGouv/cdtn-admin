// MetabaseDashboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";

interface MetabaseParams {
  [key: string]: string | string[];
}

interface Props {
  dashboardId: number;
  params?: MetabaseParams; // ← N'IMPORTE QUEL PARAMÈTRE
}

export default function MetabaseDashboard({ dashboardId, params = {} }: Props) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchUrl = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("dashboard", dashboardId.toString());

    // Ajoute tous les params
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    });

    try {
      const res = await fetch(`/api/metabase/token?${queryParams}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIframeUrl(data.iframeUrl);
    } catch (err) {
      console.error("Erreur Metabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrl();
    const interval = setInterval(fetchUrl, 9 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dashboardId, params]);

  // === CSS : cacher footer + no scroll ===
  useEffect(() => {
    if (!iframeRef.current || !iframeUrl) return;
    const iframe = iframeRef.current;
    iframe.onload = () => {
      setTimeout(() => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) return;
          const style = doc.createElement("style");
          style.textContent = `
            .EmbedFrame-footer { display: none !important; }
            html, body { overflow: hidden !important; margin: 0; padding: 0; }
          `;
          doc.head.appendChild(style);
        } catch (err) {
          console.error("Injection CSS:", err);
        }
      }, 1000);
    };
  }, [iframeUrl]);

  if (loading) return <CircularProgress />;
  if (!iframeUrl) return <Alert severity="error">Erreur</Alert>;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 600,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
      }}
    >
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        width="100%"
        height="1000"
        style={{ border: "none", display: "block" }}
        allowFullScreen
        title={`Dashboard ${dashboardId}`}
      />
    </Box>
  );
}
