
import React from 'react';
import { Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import { PageContentProps } from '../types';

const PageContent: React.FC<PageContentProps> = ({ 
  pageNumber, 
  containerWidth, 
  maxWidth 
}) => (
  <div className="page-container relative">
    <Page
      pageNumber={pageNumber}
      width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
      className="shadow-2xl mx-auto rounded-lg"
      renderTextLayer={false}
      renderAnnotationLayer={false}
      error="Failed to load page"
      loading={
        <div className="h-[500px] w-full flex items-center justify-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        </div>
      }
      canvasRef={canvas => {
        // Apply additional security measures to prevent downloading/copying
        if (canvas) {
          canvas.style.userSelect = 'none';
        }
      }}
    />
    <div className="page-watermark absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-400 opacity-20 pointer-events-none select-none rotate-[-30deg]">
      KIITConnect
    </div>
    <div className="page-overlay absolute inset-0 bg-transparent pointer-events-none" />
  </div>
);

export default React.memo(PageContent);
