
# Secure PDF Viewer Library

A feature-rich, secure PDF viewer component for React applications with TypeScript support.

## Features

- **Secure viewing**: Prevents downloading, copying, printing, and saving
- **Responsive design**: Adjusts to container width
- **Page tracking**: Uses Intersection Observer to detect which page is in view
- **Customizable**: Supports watermarks, custom colors, and styles
- **Performance optimized**: Uses memoization and throttling to prevent unnecessary renders
- **TypeScript support**: Full type definitions for better development experience

## Installation

```bash
npm install @wojtekmaj/react-hooks react-pdf pdfjs-dist framer-motion
```

## Usage

```tsx
import SecurePdfViewer from './lib/secure-pdf-viewer';

const MyPdfViewer = () => {
  return (
    <SecurePdfViewer 
      fileUrl="https://example.com/sample.pdf"
      watermarkText="Confidential"
      headerTitle="My PDF Viewer" 
      poweredByText="© My Company 2024"
    />
  );
};
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| fileUrl | string | required | URL of the PDF file to display |
| maxWidth | number | 900 | Maximum width of the rendered PDF pages |
| watermarkText | string | 'KIITConnect' | Text to display as watermark on each page |
| headerTitle | string | 'KIITConnect PDF Viewer' | Title displayed in the header |
| poweredByText | string | 'Powered by KIITConnect © 2024' | Footer text |
| disableSecurity | boolean | false | When true, disables the security features |
| customStyles | object | {} | Custom styling options |

### Custom Styles Object

```tsx
customStyles={{
  backgroundColor: '#121212',
  headerBgColor: '#121212',
  headerBorderColor: '#333',
  textColor: '#fff',
  accentColor: '#3B82F6',
  pageBackgroundColor: 'transparent',
}}
```

## Important Notes

1. The library requires that you place the `pdf.worker.min.js` file in your public folder.
2. Security measures are client-side only and can be bypassed by determined users.
3. For production use, consider adding server-side security measures as well.

## License

MIT
