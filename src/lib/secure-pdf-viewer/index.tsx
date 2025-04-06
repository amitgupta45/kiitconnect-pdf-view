import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document } from 'react-pdf';
import { FileText } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { SecurePdfViewerProps } from './types';
import PageContent from './components/PageContent';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';

// Set workerSrc once, outside the component
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
}

const options = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
};

const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({
  fileUrl,
  maxWidth = 900,
  watermarkText = 'KIITConnect',
  headerTitle = 'KIITConnect PDF Viewer',
  poweredByText = 'Powered by KIITConnect © 2024',
  disableSecurity = false,
  customStyles = {},
}) => {
  // Keep a reference to the loaded PDF document
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Track the currently loaded URL to prevent reloading
  const loadedUrlRef = useRef<string | null>(null);
  // Track last updated page to prevent redundant updates
  const lastPageRef = useRef<number>(1);

  // Throttle the page visibility handler to prevent rapid state updates
  const handlePageVisibleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlePageVisible = useCallback((page: number) => {
    // Skip if it's the same page we already processed
    if (lastPageRef.current === page) return;
    
    if (handlePageVisibleTimeoutRef.current) {
      clearTimeout(handlePageVisibleTimeoutRef.current);
    }
    
    // Set a ref immediately to prevent multiple triggers for the same page
    lastPageRef.current = page;
    
    handlePageVisibleTimeoutRef.current = setTimeout(() => {
      setCurrentPage(page);
    }, 300); // Increased timeout for smoother transitions
  }, []);

  // Use Intersection Observer to detect which page is visible
  useEffect(() => {
    if (!numPages) return;
    
    const observer = new IntersectionObserver(
      entries => {
        // Find the page with highest visibility ratio
        let maxVisibility = 0;
        let visiblePage = null;
        
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            const pageIndex = pageRefs.current.findIndex(ref => ref === entry.target);
            if (pageIndex !== -1) {
              visiblePage = pageIndex + 1;
            }
          }
        });
        
        if (visiblePage && maxVisibility > 0.3) { // Only update if page is significantly visible
          handlePageVisible(visiblePage);
        }
      },
      { 
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-10% 0px" // Slightly adjust the detection area
      }
    );
    
    // Observe all page refs
    pageRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, [numPages, handlePageVisible]);

  // Memoize the document configuration to prevent recreating on every render
  const documentConfig = useMemo(() => ({
    url: fileUrl,
    httpHeaders: {
      'Cache-Control': 'max-age=315360000000000',
      'Pragma': 'cache',
      'X-Request-Id': "2665550249", // Keep your custom header
    },
    withCredentials: true,
    cMapUrl: options.cMapUrl,
    standardFontDataUrl: options.standardFontDataUrl,
  }), [fileUrl]);

  // Handle container resizing
  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, {}, onResize);

  // Set up document protection
  useEffect(() => {
    if (disableSecurity) return;
    
    const preventDefaultHandler = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) ||
        (e.key === 'PrintScreen') ||
        (e.key === 'F12')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners for document protection
    document.addEventListener('contextmenu', preventDefaultHandler, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('dragstart', preventDefaultHandler, true);
    document.addEventListener('drop', preventDefaultHandler, true);
    document.addEventListener('copy', preventDefaultHandler, true);
    document.addEventListener('cut', preventDefaultHandler, true);
    document.addEventListener('paste', preventDefaultHandler, true);
    document.addEventListener('selectstart', preventDefaultHandler, true);
    document.addEventListener('mousedown', preventDefaultHandler, true);

    return () => {
      // Clean up event listeners
      document.removeEventListener('contextmenu', preventDefaultHandler, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('dragstart', preventDefaultHandler, true);
      document.removeEventListener('drop', preventDefaultHandler, true);
      document.removeEventListener('copy', preventDefaultHandler, true);
      document.removeEventListener('cut', preventDefaultHandler, true);
      document.removeEventListener('paste', preventDefaultHandler, true);
      document.removeEventListener('selectstart', preventDefaultHandler, true);
      document.removeEventListener('mousedown', preventDefaultHandler, true);
      
      // Clean up any pending timeouts
      if (handlePageVisibleTimeoutRef.current) {
        clearTimeout(handlePageVisibleTimeoutRef.current);
      }
    };
  }, [disableSecurity]);

  // Reset loading state when fileUrl changes
  useEffect(() => {
    if (loadedUrlRef.current !== fileUrl) {
      setIsLoading(true);
      setError(null);
      loadedUrlRef.current = fileUrl;
    }
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages: nextNumPages, _pdfInfo }: PDFDocumentProxy): void {
    // Store the PDF document reference to avoid reloading
    pdfDocumentRef.current = _pdfInfo.document;
    setNumPages(nextNumPages);
    setIsLoading(false);
    setError(null);
    pageRefs.current = new Array(nextNumPages).fill(null);
  }

  function onDocumentLoadError(error: Error): void {
    setIsLoading(false);
    setError('Failed to load the PDF. Please check if the file exists and try again.');
    console.error('PDF Load Error:', error);
  }

  // Apply custom styles or defaults
  const styles = {
    backgroundColor: customStyles.backgroundColor || '#121212',
    headerBgColor: customStyles.headerBgColor || '#121212',
    headerBorderColor: customStyles.headerBorderColor || '#333',
    textColor: customStyles.textColor || '#fff',
    accentColor: customStyles.accentColor || '#3B82F6',
    pageBackgroundColor: customStyles.pageBackgroundColor || 'transparent',
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ backgroundColor: styles.backgroundColor, color: styles.textColor }}
    >
      {/* Header */}
      <header 
        className="p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-30" 
        style={{ 
          backgroundColor: styles.headerBgColor,
          borderBottom: `1px solid ${styles.headerBorderColor}`
        }}
      >
        <div className="flex items-center space-x-3">
          <FileText style={{ color: styles.accentColor }} className="w-7 h-7" />
          <h1 
            className="text-2xl font-bold"
            style={{ 
              background: `linear-gradient(to right, ${styles.accentColor}, ${styles.accentColor}CC)`, 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {headerTitle}
          </h1>
        </div>
        <div className="text-sm text-gray-400">
          Page {currentPage} of {numPages}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-4xl mx-auto p-4" ref={setContainerRef}>
          {isLoading && !error && <LoadingIndicator />}
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <Document
              file={documentConfig}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<LoadingIndicator />}
              className="flex flex-col items-center space-y-8"
              inputRef={(ref) => {
                // Additional measure to prevent API calls on re-render
                if (ref && pdfDocumentRef.current) {
                  // Ensure the ref is of the correct type before assigning
                  if (ref && 'transport' in ref) {
                    (ref as any)._transport = pdfDocumentRef.current;
                  }
                }
              }}
              externalLinkTarget="_blank"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page_${index + 1}`}
                  ref={el => pageRefs.current[index] = el}
                  className="w-full"
                  // Removed onMouseEnter event handler that was causing flickering
                >
                  <PageContent 
                    pageNumber={index + 1} 
                    containerWidth={containerWidth} 
                    maxWidth={maxWidth}
                  />
                </div>
              ))}
            </Document>
          )}
        </div>
      </main>

      {/* KIITConnect Signature */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400">
        {poweredByText}
      </div>

      {/* Styles for watermark, which will be injected into each page */}
      <style jsx global>{`
        .page-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: bold;
          color: rgba(160, 160, 160, 0.2);
          pointer-events: none;
          user-select: none;
          transform: rotate(-30deg);
          z-index: 10;
          text-align: center;
        }
        
        .page-container {
          position: relative;
          background-color: ${styles.pageBackgroundColor};
        }
        
        .page-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>
    </div>
  );
};

export default SecurePdfViewer;
