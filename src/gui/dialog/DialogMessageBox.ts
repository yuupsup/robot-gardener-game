import Phaser from "phaser";

import {GameConstants} from "../../GameConstants";
import {DialogState} from "./DialogState";
import DialogBox from "./DialogBox";
import Deque from "../../ds/Deque";
// todo check if I can use Phaser's BitmapFontData
import BitmapFontData from "../text/BitmapFontData";
import GameController from "../../GameController";
import MessageGraph from "./message/MessageGraph";

export default class DialogMessageBox extends DialogBox {
  bipmapFontData:BitmapFontData;
  messageGraphQueue:Deque;

  charSize:number; // size of the bitmap font character

  linesMax:number; // the maximum lines the dialog box supports
  lineWidthMax:number; // the maximum width the dialog box supports (in pixels because each character will be 8 pixels)
  line:string; // the current line of the dialog box
  lineCharWidth:number; // character width of the current line
  newLine:boolean;

  msgIndex:number; // the current index in the message
  lineCharIndex:number; // the character index in the line
  hasMore:boolean; // represents that there is more parts of the message to be displayed

  // this.typeSpd = 1; // the amount to increment the type counter every frame
  typeSpd:number; // the amount to increment the type counter every frame
  typeCounter:number;
  typeCounterMax:number; // once the counter is >= than this value, then the next letter will be displayed
  rollover:boolean;

  message:string|null; // represents the current message
  messageLineIndex:number;
  messageLines:Array<string>; // holds the message string to be displayed where each index represents a new line

  messageShown:boolean;
  messageDone:boolean; // denotes whether the message has been completely displayed

  clearMessageOnNextUpdate:boolean;

  messageText:Phaser.GameObjects.BitmapText;

  gameController:GameController;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    super(scene);

    this.gameController = GameController.instance(scene);

    this.bipmapFontData = new BitmapFontData(scene, GameConstants.Font.FONT);

    this.props.width = GameConstants.Screen.WINDOW_WIDTH - 32;
    this.props.height = 96;

    this.props.offset.x = 64;
    this.props.offset.y = GameConstants.Screen.WINDOW_HEIGHT - 96;

    this.props.padding.inner.x = 8;
    this.props.padding.inner.y = 8;

    this.props.padding.outer.x = 0;
    this.props.padding.outer.y = 0;

    this.messageGraphQueue = new Deque();

    this.charSize = 8; // size of the bitmap font character

    this.linesMax = 8; // the maximum lines the dialog box supports
    this.lineWidthMax = (this.props.width - (this.props.padding.inner.x * 2)); // the maximum width the dialog box supports (in pixels because each character will be 8 pixels)

    this.line = ""; // the current line of the dialog box

    this.lineCharWidth = 0; // character width of the current line

    this.newLine = false;

    this.msgIndex = 0; // the current index in the message
    this.lineCharIndex = 0; // the character index in the line
    this.hasMore = false; // represents that there is more parts of the message to be displayed

    // this.typeSpd = 1; // the amount to increment the type counter every frame
    this.typeSpd = 0.1; // the amount to increment the type counter every frame
    this.typeCounter = 0;
    this.typeCounterMax = 2; // once the counter is >= than this value, then the next letter will be displayed
    this.rollover = false;

    this.message = null; // represents the current message
    this.messageLineIndex = 0;
    this.messageLines = []; // holds the message string to be displayed where each index represents a new line

    this.messageShown = false;
    this.messageDone = false; // denotes whether the message has been completely displayed

    this.clearMessageOnNextUpdate = false;

    this.dialogBox.setPosition(this.props.position.x, this.props.position.y);

    this.dialogBox.width = this.props.width;
    this.dialogBox.height = this.props.height;
    this.dialogBox.displayWidth = this.props.width;
    this.dialogBox.displayHeight = this.props.height;

    this.messageText = this.scene.add.bitmapText(this.dialogBox.x + this.props.padding.inner.x, this.dialogBox.y + this.props.padding.inner.y, GameConstants.Font.FONT, '', this.charSize);
    this.messageText.setVisible(true);
    this.messageText.setDepth(this.dialogBox.depth);

    this.scene.add.existing(this.messageText);
  }

  update() {
    if (this.dialogState === DialogState.PAUSED) {
      return;
    }

    const inputManager = this.gameController.getInputManager(this.scene);
    let shouldClose = false;

    if (!this.messageGraphQueue.isEmpty()) {
      const messageGraph = this.messageGraphQueue.peek();
      const node = messageGraph.getCurrent();
      if (node !== null) {
        if (!this.messageShown) {
          if (this.clearMessageOnNextUpdate) {
            this.resetMsgCounter();
            this.clearMessageOnNextUpdate = false;
          }

          node.callStart(); // invoke the callback

          // when the message is done, clear the message on the NEXT update
          if (node.clearMessageOnNextUpdate) {
            this.clearMessageOnNextUpdate = true;
          }

          const message = node.getMessage();
          this.resetDialogPosition();
          this.show(true);

          this.message = message;

          this.messageShown = true;
        } else {
          const userClicked = this.userInputEnabled && (inputManager && inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.D));
          if (userClicked || node.isAuto()) {
            inputManager?.ignoreKey(Phaser.Input.Keyboard.KeyCodes.D);

            if (this.messageDone) {
              node.callEnd(); // invoke the callback

              if (messageGraph.hasNext()) {
                messageGraph.next();
              } else {
                shouldClose = true;
              }
              this.messageDone = false;
              this.messageShown = false;

              if (!this.clearMessageOnNextUpdate) {
                this.resetMsgCounter();
              } else {
                this.message = null;
              }
            } else {
              if (this.hasMore) {
                this.messageLines = [];
                this.messageLineIndex = 0;

                this.line = "";
                this.lineCharWidth = 0;

                this.lineCharIndex = 0;
                this.typeCounter = 0;

                this.hasMore = false;
                this.newLine = false;
              } else if (userClicked) {
                // complete the dialog box with the message
                let safeGuard = 1000;
                let i = 0;
                while (!this.messageDone && i < safeGuard) {
                  this.typeMsg(false);
                  i++;
                }
              }
            }
          }
        }
      } else {
        shouldClose = true;
      }
    }
    if (shouldClose) {
      this.messageGraphQueue.removeFront();
      this.close = true;
      this.messageDone = false;
      this.messageShown = false;

      this.resetMsgCounter();
    } else {
      this.typeMsg();
    }
  }

  /**
   * Type the next character in the message box.
   * @param {boolean} playSound should a sound be played for each character?
   */
  typeMsg(playSound = true) {
    if (this.message === null) {
      return;
    }

    if (!this.hasMore && !this.messageDone) {
      let isFull = false;
      let skipWhiteSpace = false;

      if (this.line === "") {
        let startIndex = -1;

        let word = "";
        let wordCharWidth = 0;
        let wordStartIndex = -1;
        let wordEndIndex = -1;

        for (let i = this.msgIndex; i < this.message.length; i++) {
          let found = false;
          if (startIndex < 0) {
            startIndex = i;
          }
          // get the next character from the message
          const ch = this.message.charAt(i);
          if (this.isEmptyCharacter(ch)) {
            // found a whitespace character before a word, need to end loop
            if (word === "") {
              word = " ";
            }

            wordCharWidth += this.bipmapFontData.getCharWidth(word.charCodeAt(0));

            wordEndIndex = i + 1;
            found = true;
          } else if (this.isNewLineCharacter(ch)) {
            this.newLine = true;
            found = true;
          } else {
            if (wordStartIndex < 0) {
              wordStartIndex = i;
            }

            wordCharWidth += this.bipmapFontData.getCharWidth(ch.charCodeAt(0));

            // word += ch;
            wordEndIndex = i + 1;
            word = this.message.substring(wordStartIndex, wordEndIndex);

            const nextChar = this.message.charAt(i + 1);
            if ((i + 1 < this.message.length) && this.isEmptyCharacter(nextChar) || this.isNewLineCharacter(nextChar)) {
              found = true;
            } else if (i === this.message.length - 1) {
              found = true;
            }
          }
          if (found) {
            if (this.newLine) {
              break;
            }
            // case 1: The word WILL NOT fit on any line.
            // In this case we need to break the word into substrings, if the substring will not fit within the
            // message box, then the message box should display an empty message.
            const len = wordCharWidth;
            if (len > this.lineWidthMax) {
              // todo need to test case 1
              if (len === 1) {
                // cannot get substring of word, display an empty message
                this.messageDone = true;
              } else {
                this.line = this.message.substring(startIndex, i);
                this.lineCharIndex = 0;

                this.msgIndex = i;
                // todo isFull = true;
              }
              break;
            } else {
              const filledWidth = this.lineCharWidth;
              if (filledWidth + len > this.lineWidthMax) {
                if (this.messageLineIndex < this.linesMax - 1) {
                  // case 2: The word WILL NOT fit on the current line (not the last line)
                  // In this case we need to increment the line index, whitespace will be skipped
                  if (word === " ") {
                    // todo skipWhiteSpace = true;
                  }
                } else {
                  // case 3: The word WILL NOT fit on the current line (not the last line)
                  // In this case we need to state that the message box is full, the line index will be incremented
                  // once the user presses the action button
                  // todo isFull = true;
                }
                break;
              }
            }
            // if we have not broken from the loop, then the line can continue to be filled.
            // clear the variables to find the next word
            this.lineCharWidth += wordCharWidth;

            this.line = this.message.substring(startIndex, wordEndIndex);

            word = "";
            wordCharWidth = 0;
            wordStartIndex = -1;
            wordEndIndex = -1;
          }
        }
      }
      // the message box should be empty because nothing could fit within the line width
      if (this.messageDone) {
        return;
      }

      // the message box cannot take anymore characters until it has been cleared
      if (isFull) {
        this.rollover = true;
        this.hasMore = true;
      } else {
        if (this.rollover) {
          // todo there is an edge case when the word is too big to fit the message box, even when the message box is empty.
          this.rollover = false;
        }
        if (skipWhiteSpace) {
          // this.strIndex += 1;
          // this.typeCounter = 0;
          // todo should we instead loop through all the whitespace until we find a non-whitespace character?
        } else {
          let lineDone = false;

          if (this.lineCharIndex <= this.line.length) {
            if (this.messageLines.length === 0) {
              this.messageLineIndex = 0;
              this.messageLines.push("");
            }

            this.messageLines[this.messageLineIndex] = this.line.substring(0, this.lineCharIndex);
            this.messageText.setText(this.messageLines);

            if (this.lineCharIndex >= this.line.length) {
              lineDone = true;
            }
          } else {
            lineDone = true;
          }

          if (lineDone) {
            if (this.msgIndex < this.message.length) {
              if (this.messageLineIndex >= this.linesMax - 1) {
                this.hasMore = true;
              } else {
                this.messageLineIndex += 1;
                this.messageLines.push("");
              }
            } else {
              this.messageDone = true;
            }
            this.line = "";
            this.lineCharWidth = 0;
            this.lineCharIndex = 0;
            if (this.newLine) {
              this.msgIndex++; // need to skip the newline character, otherwise the dialog will be inactive
              this.newLine = false;
            }
          } else {
            // increment the counters
            this.typeCounter += this.typeSpd;
            if (this.typeCounter >= this.typeCounterMax) {
              this.lineCharIndex += 1;
              // audio
              if (playSound) {
                 // todo play text sound
                // GameController.instance(this.scene).playSFX("");
              }
              this.msgIndex += 1;

              this.typeCounter = 0;
            }
          }
        }
      }
    }
  }

  postUpdate() {
    if (this.close) {
      this.show(false);
      this.close = false;
    }
  }

  resetDialogPosition() {
    super.resetDialogPosition();
    // this.dialogBox.depth = this.dialogBox.y;
  }

  show(value:boolean) {
    super.show(value);

    this.messageText.x = this.dialogBox.x + this.props.padding.inner.x;
    this.messageText.y = this.dialogBox.y + this.props.padding.inner.y;
    // this.messageText.depth = this.messageText.y;
    this.messageText.setVisible(value);
  }

  /**
   * @param {MessageGraph} messageGraph
   * @param {boolean} toFront
   */
  addMessage(messageGraph:MessageGraph, toFront:boolean= false) {
    if (toFront) {
      this.messageGraphQueue.addFront(messageGraph);
    } else {
      this.messageGraphQueue.addBack(messageGraph);
    }
  }

  isEmptyCharacter(ch:string) {
    return " \t".indexOf(ch) > -1;
  }

  isNewLineCharacter(ch:string) {
    return "\n\r\v".indexOf(ch) > -1;
  }

  resetMsgCounter() {
    this.message = null;
    this.messageLines = [];
    this.messageLineIndex = 0;

    this.msgIndex = 0;
    this.line = "";
    this.lineCharWidth = 0;
    this.lineCharIndex = 0;

    this.typeCounter = 0;
  }
}