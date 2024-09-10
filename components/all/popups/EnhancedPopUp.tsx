import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePopUp } from "./PopUpContext";

export default function EnhancedPopUp() {
  const { popups, hidePopUp } = usePopUp();

  return (
    <>
      {popups.map(({ id, content, container, style, height }) => (
        <PortalPopUp
          key={id}
          id={id}
          content={content}
          container={container}
          style={style}
          height={height}
          onClose={() => hidePopUp(id)}
        />
      ))}
    </>
  );
}

interface PortalPopUpProps {
  id: string;
  content: React.ReactNode;
  container?: string | null;
  style?: {
    overlay?: string;
  };
  height?: string;
  onClose: () => void;
}

function PortalPopUp({
  id,
  content,
  container,
  style,
  height,
  onClose,
}: PortalPopUpProps) {
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    const element = container
      ? document.querySelector(container)
      : document.body;
    setPortalElement(element);
  }, [container]);

  if (!portalElement) return null;

  const isContainerSpecific = !!container;
  const overlayClass = style?.overlay || "";

  const popupContent = isContainerSpecific ? (
    <div className={`absolute inset-0 z-50 ${overlayClass}`}>{content}</div>
  ) : (
    <div
      className={`fixed inset-0 z-50 flex h-full w-full items-center justify-center ${overlayClass}`}
    >
      {content}
    </div>
  );

  return createPortal(popupContent, portalElement);
}
