(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed to access window and document visibility APIs.');
  }

  class FocusDetectorExtension {
    constructor() {
      this.initialWidth = window.innerWidth;
      this.initialHeight = window.innerHeight;
      this.isSplitView = false;

      // Update baseline dimensions when in full focus, or detect drastic shrink
      window.addEventListener('resize', () => {
        this._checkSplitView();
      });

      // Trigger hat blocks when visibility or focus changes
      document.addEventListener('visibilitychange', () => {
        Scratch.vm.runtime.startHats('focusdetector_whenTabChanged');
      });

      window.addEventListener('blur', () => {
        Scratch.vm.runtime.startHats('focusdetector_whenFocusLost');
      });
    }

    getInfo() {
      return {
        id: 'focusdetector',
        name: 'Focus & View Detector',
        color1: '#4C97FF',
        color2: '#3373CC',
        blocks: [
          {
            opcode: 'isTabVisible',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is current tab visible?'
          },
          {
            opcode: 'isWindowFocused',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is window focused (not in sidebar/other app)?'
          },
          {
            opcode: 'isSplitScreen',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is using split view / shrunk window?'
          },
          '---',
          {
            opcode: 'calibrateScreen',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set current window size as normal'
          },
          {
            opcode: 'getVisibilityState',
            blockType: Scratch.BlockType.REPORTER,
            text: 'visibility state'
          },
          '---',
          {
            opcode: 'whenTabChanged',
            blockType: Scratch.BlockType.EVENT,
            text: 'when tab visibility changes',
            isEdgeActivated: false
          },
          {
            opcode: 'whenFocusLost',
            blockType: Scratch.BlockType.EVENT,
            text: 'when window loses focus',
            isEdgeActivated: false
          }
        ]
      };
    }

    _checkSplitView() {
      // Checks if window width is less than 75% of the available screen width
      // or significantly smaller than the initial calibrated width
      const screenRatio = window.innerWidth / window.screen.availWidth;
      const initialRatio = window.innerWidth / this.initialWidth;

      this.isSplitView = (screenRatio < 0.75) || (initialRatio < 0.75);
    }

    isTabVisible() {
      return document.visibilityState === 'visible';
    }

    isWindowFocused() {
      return document.hasFocus();
    }

    isSplitScreen() {
      this._checkSplitView();
      return this.isSplitView;
    }

    calibrateScreen() {
      this.initialWidth = window.innerWidth;
      this.initialHeight = window.innerHeight;
      this.isSplitView = false;
    }

    getVisibilityState() {
      if (!this.isTabVisible()) return 'hidden_tab';
      if (!this.isWindowFocused()) return 'unfocused_sidebar';
      if (this.isSplitScreen()) return 'split_view';
      return 'active';
    }
  }

  Scratch.extensions.register(new FocusDetectorExtension());
})(Scratch);
