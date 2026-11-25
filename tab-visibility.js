(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must be run unsandboxed');
  }

  // Listen for tab visibility changes to trigger hat blocks immediately
  document.addEventListener('visibilitychange', () => {
    Scratch.vm.runtime.startHats('tabVisibility_whenVisibilityChanged');
  });

  class TabVisibility {
    getInfo() {
      return {
        id: 'tabVisibility',
        name: 'Tab Visibility',
        color1: '#4C97FF',
        blocks: [
          {
            opcode: 'isLookingAtAnotherTab',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'looking at another tab?'
          },
          {
            opcode: 'whenVisibilityChanged',
            blockType: Scratch.BlockType.EVENT,
            text: 'when tab visibility changes',
            isEdgeActivated: false
          }
        ]
      };
    }

    isLookingAtAnotherTab() {
      return document.hidden;
    }
  }

  Scratch.extensions.register(new TabVisibility());
})(Scratch);
