(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This High Tick Rate extension must be run unsandboxed!');
  }

  class HighTickRateExtension {
    getInfo() {
      return {
        id: 'hightickrate',
        name: 'High Tick Rate',
        blocks: [
          {
            opcode: 'executeHighRate',
            blockType: Scratch.BlockType.CONDITIONAL, // CONDITIONAL ensures compatibility with the compiler
            text: 'Execute at high rate',
            branchCount: 1
          }
        ]
      };
    }

    executeHighRate(args, util) {
      // Define how many times the internal blocks repeat instantly per frame
      const executionMultiplier = 10;

      // 1. Force the thread into TurboWarp's Warp Mode to completely eliminate screen refreshes
      const stackFrame = util.thread.peekStackFrame();
      if (stackFrame) {
        stackFrame.warpMode = true;
      }

      // 2. Track the repetitions safely inside TurboWarp's internal execution context
      if (typeof util.stackFrame.loopCounter === 'undefined') {
        util.stackFrame.loopCounter = executionMultiplier;
      }

      // 3. Keep starting the branch until our counter is exhausted
      if (util.stackFrame.loopCounter > 0) {
        util.stackFrame.loopCounter--;
        
        // Pass 'true' as the second argument to explicitly tell the compiler to re-run this block
        util.startBranch(1, true);
      } else {
        // Reset the counter state so it can cleanly run again on the next frame loop
        util.stackFrame.loopCounter = undefined;
      }
    }
  }

  Scratch.extensions.register(new HighTickRateExtension());
})(Scratch);
