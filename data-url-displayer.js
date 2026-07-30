(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed to render costumes.');
  }

  // Dynamically load PDF.js library for rendering PDF Data URLs
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js library.'));
      document.head.appendChild(script);
    });
  };

  class DataUrlDisplayExtension {
    getInfo() {
      return {
        id: 'dataurldisplay',
        name: 'Data URL Display',
        color1: '#4C97FF',
        color2: '#3373CC',
        blocks: [
          {
            opcode: 'convertAndDisplay',
            blockType: Scratch.BlockType.COMMAND,
            text: 'display Data URL [DATA_URL] on current sprite',
            arguments: {
              DATA_URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              }
            }
          },
          {
            opcode: 'convertToPng',
            blockType: Scratch.BlockType.REPORTER,
            text: 'convert [DATA_URL] to PNG Data URL',
            arguments: {
              DATA_URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              }
            }
          },
          '---',
          {
            opcode: 'deleteCurrentCostume',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete current costume'
          },
          {
            opcode: 'deleteCostumeByName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete costume named [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'DisplayImage'
              }
            }
          }
        ]
      };
    }

    /**
     * Converts PNG, JPEG, or PDF Data URLs into a standard PNG Data URL.
     */
    async convertToPng(args) {
      const dataUrl = String(args.DATA_URL).trim();

      if (!dataUrl.startsWith('data:') || dataUrl.includes('...')) {
        return '';
      }

      // Render PDF Page 1 to PNG via Canvas
      if (dataUrl.startsWith('data:application/pdf')) {
        try {
          const pdfjsLib = await loadPdfJs();
          const loadingTask = pdfjsLib.getDocument(dataUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          return canvas.toDataURL('image/png');
        } catch (err) {
          console.error('Error parsing PDF Data URL:', err);
          return '';
        }
      }

      // Convert PNG/JPEG to clean Canvas PNG Data URL
      if (dataUrl.startsWith('data:image/')) {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => {
            console.error('Failed to load image Data URL');
            resolve('');
          };
          img.src = dataUrl;
        });
      }

      return '';
    }

    /**
     * Converts input Data URL to PNG and sets it as active costume for current sprite.
     */
    async convertAndDisplay(args, util) {
      const pngDataUrl = await this.convertToPng(args);
      if (!pngDataUrl) return;

      const target = util.target;
      const vm = Scratch.vm;

      const base64Data = pngDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const asset = vm.runtime.storage.createAsset(
        vm.runtime.storage.AssetType.ImageBitmap,
        vm.runtime.storage.DataFormat.PNG,
        bytes,
        null,
        true
      );

      const costume = {
        name: 'DisplayImage_' + Date.now(),
        asset: asset,
        assetId: asset.assetId,
        dataFormat: 'png',
        md5: asset.assetId + '.png'
      };

      if (vm.addCostume) {
        await vm.addCostume(costume.md5, costume, target.id);
      } else {
        target.addCostume(costume);
        target.setCostume(target.getCostumes().length - 1);
      }
    }

    /**
     * Deletes the sprite's active costume.
     */
    deleteCurrentCostume(args, util) {
      const target = util.target;
      const costumes = target.getCostumes();

      // Prevent deleting if the sprite only has 1 costume remaining
      if (costumes.length <= 1) return;

      const currentIndex = target.currentCostume;
      target.deleteCostume(currentIndex);
    }

    /**
     * Deletes a costume by name on the active sprite.
     */
    deleteCostumeByName(args, util) {
      const target = util.target;
      const costumes = target.getCostumes();
      const targetName = String(args.NAME).trim();

      // Prevent deleting if sprite has 1 costume left
      if (costumes.length <= 1) return;

      const costumeIndex = costumes.findIndex((c) => c.name === targetName);
      if (costumeIndex !== -1) {
        target.deleteCostume(costumeIndex);
      }
    }
  }

  Scratch.extensions.register(new DataUrlDisplayExtension());
})(Scratch);
