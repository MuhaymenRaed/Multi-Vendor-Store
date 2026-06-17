"use client";

import { useEffect, useState } from "react";

export function useResponsivePageSize(defaultSize = 20) {
  const [pageSize, setPageSize] = useState(defaultSize);

  useEffect(() => {
    const getSize = () => {
      const width = window.innerWidth;
      if (width < 480) return Math.max(4, Math.floor(defaultSize * 0.25));
      if (width < 640) return Math.max(6, Math.floor(defaultSize * 0.35));
      if (width < 768) return Math.max(8, Math.floor(defaultSize * 0.45));
      if (width < 1024) return Math.max(10, Math.floor(defaultSize * 0.6));
      if (width < 1280) return Math.max(14, Math.floor(defaultSize * 0.75));
      if (width < 1536)
        return Math.max(defaultSize, Math.floor(defaultSize * 0.9));
      return Math.max(defaultSize, 24);
    };

    const updateSize = () => setPageSize(getSize());
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [defaultSize]);

  return pageSize;
}
