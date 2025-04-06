
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface SecurePdfViewerProps {
  fileUrl: string;
  maxWidth?: number;
  watermarkText?: string;
  headerTitle?: string;
  poweredByText?: string;
  disableSecurity?: boolean;
  customStyles?: {
    backgroundColor?: string;
    headerBgColor?: string;
    headerBorderColor?: string;
    textColor?: string;
    accentColor?: string;
    pageBackgroundColor?: string;
  };
}

export interface PageContentProps {
  pageNumber: number;
  containerWidth: number | undefined;
  maxWidth: number;
}
