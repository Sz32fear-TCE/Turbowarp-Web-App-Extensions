(function(Scratch) {
  'use strict';

  // Ensure the extension is running unsandboxed so it can access Scratch lists
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed to read Scratch lists.');
  }

  class ListWordCounter {
    getInfo() {
      return {
        id: 'listWordCounter',
        name: 'List Word Counter',
        color1: '#FF661A', // Matches Scratch's native List block color
        color2: '#E64D00',
        blocks: [
          {
            opcode: 'countItemsContaining',
            blockType: Scratch.BlockType.REPORTER,
            text: 'count items in [LIST] containing [TEXT] (case sensitive: [CASE])',
            arguments: {
              LIST: {
                type: Scratch.ArgumentType.STRING,
                menu: 'listsMenu'
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello world'
              },
              CASE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'caseMenu',
                defaultValue: 'false'
              }
            }
          }
        ],
        menus: {
          listsMenu: {
            acceptReporters: true,
            items: 'getProjectLists'
          },
          caseMenu: {
            acceptReporters: false,
            items: [
              { text: 'no', value: 'false' },
              { text: 'yes', value: 'true' }
            ]
          }
        }
      };
    }

    // Dynamically populates the dropdown with all lists in the current sprite and stage
    getProjectLists() {
      const lists = new Set();
      const targets = Scratch.vm.runtime.targets;

      for (const target of targets) {
        if (target.isOriginal) {
          for (const variable of Object.values(target.variables)) {
            if (variable.type === 'list') {
              lists.add(variable.name);
            }
          }
        }
      }

      const listNames = Array.from(lists);
      return listNames.length > 0 ? listNames : ['my list'];
    }

    // Finds the list in the current sprite or stage and counts matching items
    countItemsContaining(args, util) {
      const listName = Scratch.Cast.toString(args.LIST);
      const searchStr = Scratch.Cast.toString(args.TEXT);
      const isCaseSensitive = args.CASE === 'true';

      // Look for the list in the active sprite first, then fall back to the Stage
      let listVar = util.target.lookupVariableByNameAndType(listName, 'list');
      if (!listVar) {
        const stage = Scratch.vm.runtime.getTargetForStage();
        if (stage) {
          listVar = stage.lookupVariableByNameAndType(listName, 'list');
        }
      }

      // Return 0 if the list doesn't exist
      if (!listVar || !Array.isArray(listVar.value)) {
        return 0;
      }

      const targetText = isCaseSensitive ? searchStr : searchStr.toLowerCase();
      let count = 0;

      for (const item of listVar.value) {
        const itemStr = Scratch.Cast.toString(item);
        const comparableItem = isCaseSensitive ? itemStr : itemStr.toLowerCase();
        
        if (comparableItem.includes(targetText)) {
          count++;
        }
      }

      return count;
    }
  }

  Scratch.extensions.register(new ListWordCounter());
})(Scratch);
