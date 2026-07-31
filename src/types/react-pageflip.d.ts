declare module "react-pageflip" {
  import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

  export interface PageFlipMethods {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (page: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  }

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startPage?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    maxShadowOpacity?: number;
    className?: string;
    style?: React.CSSProperties;
    startZIndex?: number;
    autoSize?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    onFlip?: (e: { data: number }) => void;
    children?: ReactNode;
  }

  const HTMLFlipBook: ForwardRefExoticComponent<
    HTMLFlipBookProps & RefAttributes<{ pageFlip: () => PageFlipMethods }>
  >;

  export default HTMLFlipBook;
}
