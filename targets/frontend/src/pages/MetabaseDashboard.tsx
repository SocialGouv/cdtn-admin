// MetabaseDashboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";

export default function MetabaseDashboard() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchUrl = async () => {
    try {
      const res = await fetch("/api/metabase/token");
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
  }, []);

  // Injection CSS pour NO SCROLL + cacher footer
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
            html, body { overflow: hidden !important; margin: 0 !important; padding: 0 !important; height: auto !important; }
            .EmbedFrame-footer { display: none !important; }
            * { -ms-overflow-style: none; scrollbar-width: none; }
            ::-webkit-scrollbar { display: none; }
          `;
          doc.head.appendChild(style);
        } catch (err) {
          console.error("Injection CSS échouée:", err);
        }
      }, 1000);
    };
  }, [iframeUrl]);

  if (loading) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!iframeUrl) {
    return <Alert severity="error">Erreur de chargement</Alert>;
  }

  return (
    <Box
      sx={{ width: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 2 }}
    >
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        width="100%"
        height="1200" // ← HAUTEUR FIXE GÉNÉREUSE (ajuste selon ton dashboard)
        style={{ border: "none", display: "block" }}
        allowFullScreen
        title="Metabase Dashboard"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </Box>
  );
}
