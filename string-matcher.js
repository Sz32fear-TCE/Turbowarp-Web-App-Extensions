(function(Scratch) {
  'use strict';

  class StringMatcherExtension {
    getInfo() {
      return {
        id: 'stringMatcherExt',
        name: 'String Matcher',
        color1: '#4C97FF',
        color2: '#3373CC',
        blocks: [
          {
            opcode: 'countExactMatches',
            blockType: Scratch.BlockType.REPORTER,
            text: 'count matching letters at same position in [STR1] and [STR2] (case sensitive: [CASE])',
            arguments: {
              STR1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apple'
              },
              STR2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apricot'
              },
              CASE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'caseMenu',
                defaultValue: 'false'
              }
            }
          },
          {
            opcode: 'countSharedLetters',
            blockType: Scratch.BlockType.REPORTER,
            text: 'count shared letters anywhere in [STR1] and [STR2] (case sensitive: [CASE])',
            arguments: {
              STR1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'listen'
              },
              STR2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'silent'
              },
              CASE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'caseMenu',
                defaultValue: 'false'
              }
            }
          },
          {
            opcode: 'getMatchingLetters',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get matching letters at same position in [STR1] and [STR2] (case sensitive: [CASE])',
            arguments: {
              STR1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apple'
              },
              STR2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apricot'
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
          caseMenu: {
            acceptReporters: true,
            items: ['true', 'false']
          }
        }
      };
    }

    _normalize(str1, str2, caseSensitive) {
      let s1 = Scratch.Cast.toString(str1);
      let s2 = Scratch.Cast.toString(str2);
      if (Scratch.Cast.toString(caseSensitive).toLowerCase() !== 'true') {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      }
      return [s1, s2];
    }

    // Counts letters that match at the exact same index (e.g., "cat" & "car" -> 2)
    countExactMatches(args) {
      const [s1, s2] = this._normalize(args.STR1, args.STR2, args.CASE);
      const minLength = Math.min(s1.length, s2.length);
      let matches = 0;

      for (let i = 0; i < minLength; i++) {
        if (s1[i] === s2[i]) {
          matches++;
        }
      }
      return matches;
    }

    // Counts total overlapping letters regardless of position (e.g., "aab" & "aba" -> 3)
    countSharedLetters(args) {
      const [s1, s2] = this._normalize(args.STR1, args.STR2, args.CASE);
      const charCount = {};
      let matches = 0;

      for (const char of s1) {
        charCount[char] = (charCount[char] || 0) + 1;
      }

      for (const char of s2) {
        if (charCount[char] > 0) {
          matches++;
          charCount[char]--;
        }
      }
      return matches;
    }

    // Returns a string of the letters that matched in the exact same spot (e.g., "apple" & "apricot" -> "ap")
    getMatchingLetters(args) {
      const orig1 = Scratch.Cast.toString(args.STR1);
      const [s1, s2] = this._normalize(args.STR1, args.STR2, args.CASE);
      const minLength = Math.min(s1.length, s2.length);
      let matchedChars = '';

      for (let i = 0; i < minLength; i++) {
        if (s1[i] === s2[i]) {
          matchedChars += orig1[i];
        }
      }
      return matchedChars;
    }
  }

  Scratch.extensions.register(new StringMatcherExtension());
})(Scratch);
