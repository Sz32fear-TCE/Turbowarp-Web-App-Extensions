(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must be run unsandboxed to load external parsers!');
  }

  // Inject PDF.js
  const pdfScript = document.createElement('script');
  pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
  document.head.appendChild(pdfScript);

  // Inject Tesseract.js for OCR
  const ocrScript = document.createElement('script');
  ocrScript.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.3/dist/tesseract.min.js';
  document.head.appendChild(ocrScript);

  class DataURLParser {
    getInfo() {
      return {
        id: 'dataUrlParser',
        name: 'Data URL & Text Parser',
        color1: '#2ca02c',
        color2: '#1e711e',
        blocks: [
          {
            opcode: 'parseData',
            blockType: Scratch.BlockType.REPORTER,
            text: 'extract text from [DATA] as [TYPE]',
            arguments: {
              DATA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'data:image/png;base64,...'
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'fileTypes'
              }
            }
          }
        ],
        menus: {
          fileTypes: {
            acceptReporters: true,
            items: ['raw text / base64 text', 'pdf data url', 'image data url']
          }
        }
      };
    }

    // Helper to convert a Base64/Data URL into an ArrayBuffer for PDF.js
    _base64ToArrayBuffer(dataUrl) {
      const base64 = dataUrl.split(',')[1] || dataUrl;
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    async parseData(args) {
      const inputData = args.DATA;
      const type = args.TYPE;

      if (!inputData) return 'No data provided';

      // 1. RAW TEXT / BASE64 TEXT
      if (type === 'raw text / base64 text') {
        // If it's a plain text data URL, decode it; otherwise return it as raw text
        if (inputData.startsWith('data:text/plain;base64,')) {
          try {
            return window.atob(inputData.split(',')[1]);
          } catch (e) {
            return 'Failed to decode base64 text';
          }
        }
        return inputData; 
      } 
      
      // 2. PDF DATA URL
      else if (type === 'pdf data url') {
        if (typeof pdfjsLib === 'undefined') return 'PDF library loading... try again.';
        
        try {
          const arrayBuffer = this._base64ToArrayBuffer(inputData);
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
          }
          return fullText;
        } catch (err) {
          return 'PDF Error: ' + err.message;
        }
      } 
      
      // 3. IMAGE DATA URL (OCR via Tesseract)
      else if (type === 'image data url') {
        if (typeof Tesseract === 'undefined') return 'OCR library loading... try again.';

        try {
          // Tesseract natively accepts data URLs directly
          const { data: { text } } = await Tesseract.recognize(inputData, 'eng');
          return text || 'No text found in image.';
        } catch (err) {
          return 'OCR Error: ' + err.message;
        }
      }

      return '';
    }
  }

  Scratch.extensions.register(new DataURLParser());
})(Scratch);
