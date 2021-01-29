import Phaser from "phaser";
import {CommandType} from "../../pattern/command/CommandType";
import {DialogState} from "./DialogState";
import DialogMessageBox from "./DialogMessageBox";
import Command from "../../pattern/command/Command";

export default class DialogManager {
  scene:Phaser.Scene;
  messageBox:DialogMessageBox;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.messageBox = new DialogMessageBox(scene);
  }

  /**
   * Observe the command.
   * @param {Command} command
   */
  command(command:Command) {
    if (command.type === CommandType.Dialog.ADD) {
      command.call();
      if (command.data.messageGraph) {
        this.messageBox.addMessage(command.data.messageGraph);
      }
    } else if (command.type === CommandType.Dialog.PAUSE) {
      this.messageBox.setState(DialogState.PAUSED);
    } else if (command.type === CommandType.Dialog.RESUME) {
      this.messageBox.setState(DialogState.NORMAL);
    }
  }

  update(time:number, delta:number) {
    this.messageBox.update(time, delta);
    this.messageBox.postUpdate();
  }

  postUpdate() {
  }

  setPosition(x:number, y:number) {
    this.messageBox.setPosition(x, y);
  }

  /**
   * Sets the speed at which characters are shown on the message box.
   */
  setMessageBoxTextSpeed(speed:number) {
    this.messageBox.typeSpd = speed;
  }

  proceed() {
    this.messageBox.proceed = true;
  }

  /**
   * Dialog box is visible.
   */
  show() {
    this.messageBox.show(true);
  }

  /**
   * Dialog box is not visible.
   */
  hide() {
    this.messageBox.show(false);
  }

  isOpen() {
    return this.messageBox.isOpen();
  }

  pause() {
    this.messageBox.setState(DialogState.PAUSED);
  }

  unpause() {
    this.messageBox.setState(DialogState.NORMAL);
  }

  /**
   * Enables user input for the dialog box.
   */
  enable() {
    this.messageBox.setUserInputEnabled(true);
  }

  /**
   * Disables user input for the dialog box.
   */
  disable() {
    this.messageBox.setUserInputEnabled(false);
  }

  /**
   * @param {MessageGraph} messageGraph
   * @param {boolean} toFront
   */
  addMessage(messageGraph, toFront= false) {
    this.messageBox.addMessage(messageGraph, toFront);
  }

  clear() {
    this.messageBox.clear(); // todo need better clean up here
    this.messageBox = new DialogMessageBox(this.scene);
  }

  destroy() {

  }
}