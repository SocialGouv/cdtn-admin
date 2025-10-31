"use client";

import { useState, useEffect } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import dynamic from "next/dynamic";

interface IframeResizerProps {
  src: string;
  style?: React.CSSProperties;
  license?: string;
  heightCalculationMethod?: string;
  checkOrigin?: boolean;
  log?: boolean;
  inPageLinks?: boolean;
  enablePublicMethods?: boolean;
  interval?: number;
  onResized?: (data: { height: number; width: number }) => void;
  title?: string;
  allowFullScreen?: boolean;
  [key: string]: any;
}

const IframeResizer = dynamic(
  // @ts-ignore
  () => import("iframe-resizer-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <CircularProgress />,
  }
) as React.FC<IframeResizerProps>;

interface MetabaseParams {
  [key: string]: string | string[];
}

interface Props {
  dashboardId: number;
  params?: MetabaseParams;
}

export default function MetabaseDashboard({ dashboardId, params = {} }: Props) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUrl = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("dashboard", dashboardId.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    });

    try {
      const res = await fetch(`/api/metabase/token?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch token");
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

  if (loading) return <CircularProgress />;
  if (!iframeUrl)
    return <Alert severity="error">Erreur de chargement du dashboard</Alert>;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 600,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
        mt: 2,
      }}
    >
      <IframeResizer
        src={iframeUrl}
        style={{
          width: "1px",
          minWidth: "100%",
          border: "none",
        }}
        license="GPLv3"
        heightCalculationMethod="lowestElement"
        checkOrigin={false}
        log={false}
        inPageLinks
        enablePublicMethods
        interval={50}
        title={`Dashboard Metabase ${dashboardId}`}
        allowFullScreen
      />
    </Box>
  );
}
