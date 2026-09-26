class ListCheckExtension {
  getInfo() {
    return {
      id: 'listcheck',
      name: 'List Content Checker',
      blocks: [
        {
          opcode: 'stringContainsAnyFromList',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'does text [STR] contain any item from list [LIST]?',
          arguments: {
            STR: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'apple pie'
            },
            LIST: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'my list'
            }
          }
        }
      ]
    };
  }

  stringContainsAnyFromList(args, util) {
    const textToSearch = String(args.STR).toLowerCase();
    const listName = String(args.LIST);
    
    // Find the target list by name in the current sprite or stage
    const target = util.target;
    let list = Object.values(target.variables).find(v => v.type === 'list' && v.name === listName);
    
    // If not found in the sprite, check the stage (global variables)
    if (!list && !target.isStage) {
      const stage = util.runtime.getTargetForStage();
      list = Object.values(stage.variables).find(v => v.type === 'list' && v.name === listName);
    }
    
    // If the list doesn't exist, return false
    if (!list || !list.value) {
      return false;
    }
    
    // Check if any item in the list is included in the string
    return list.value.some(item => {
      const itemStr = String(item).toLowerCase();
      // Avoid matching empty list items
      if (itemStr === '') return false; 
      return textToSearch.includes(itemStr);
    });
  }
}

Scratch.extensions.register(new ListCheckExtension());
