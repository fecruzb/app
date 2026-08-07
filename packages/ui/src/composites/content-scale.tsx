import { createContext, useContext, type CSSProperties, type ReactNode } from "react";

const ContentScaleContext = createContext(1);

/**
 * Scale for the *body* inside chrome frames (CodeBlock, Window, Explorer).
 * Never shrink the title bar / traffic lights / activity bar — only the content.
 */
function ContentScaleProvider({ scale, children }: { scale: number; children: ReactNode }) {
  return <ContentScaleContext.Provider value={scale}>{children}</ContentScaleContext.Provider>;
}

function useContentScale(): number {
  return useContext(ContentScaleContext);
}

/** Apply CSS `zoom` to chrome bodies when a ContentScaleProvider is below 1. */
function ScaledContent({ children, className }: { children: ReactNode; className?: string }) {
  const scale = useContentScale();
  if (scale >= 1) {
    return className ? <div className={className}>{children}</div> : children;
  }
  return (
    <div className={className} style={{ zoom: scale } as CSSProperties}>
      {children}
    </div>
  );
}

export { ContentScaleProvider, useContentScale, ScaledContent };
