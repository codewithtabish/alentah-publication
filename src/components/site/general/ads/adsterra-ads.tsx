// src/components/site/ads/adsterra-ads.tsx
"use client";

import { useEffect, useRef } from "react";

type BannerProps = {
  adKey: string;
  invokeSrc: string;
  width: number;
  height: number;
  className?: string;
};

export function AdsterraBanner({
  adKey,
  invokeSrc,
  width,
  height,
  className,
}: BannerProps) {
  const srcDoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script src="${invokeSrc}"></script></body></html>`;

  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          title="Advertisement"
          srcDoc={srcDoc}
          width={width}
          height={height}
          style={{ border: 0, maxWidth: "100%" }}
          scrolling="no"
          loading="lazy"
        />
      </div>
    </div>
  );
}

type NativeProps = {
  scriptSrc: string;
  containerId: string;
  className?: string;
};

export function AdsterraNative({
  scriptSrc,
  containerId,
  className,
}: NativeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = scriptSrc;
    wrapper.appendChild(script);

    return () => {
      script.remove();
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
    };
  }, [scriptSrc, containerId]);

  return (
    <div ref={wrapperRef} className={className}>
      <div id={containerId} />
    </div>
  );
}