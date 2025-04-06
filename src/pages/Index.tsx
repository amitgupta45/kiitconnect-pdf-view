
import React from 'react';
import SecurePdfViewer from '@/lib/secure-pdf-viewer';

const Index = () => {
  // You would typically get this URL from your API or props
  const samplePdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

  return (
    <SecurePdfViewer 
      fileUrl={samplePdfUrl}
      watermarkText="KIITConnect"
      headerTitle="KIITConnect PDF Viewer" 
      poweredByText="Powered by KIITConnect © 2024"
    />
  );
};

export default Index;
