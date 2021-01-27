import Phaser from "phaser"
import {DialogState} from "./DialogState";
import {GameConstants} from "../../GameConstants";

export default class DialogBox {
  scene:Phaser.Scene;
  dialogBox:Phaser.GameObjects.Rectangle;
  dialogState:number;
  props:any;

  isDialogOpen:boolean;
  close:boolean;
  userInputEnabled:boolean;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    this.dialogState = DialogState.NORMAL;

    this.props = {
      position: {
        x: 0,
        y: 0
      },
      width: 0,
      height: 0,
      offset: {
        x: 0,
        y: 0
      },
      padding: {
        inner: {
          x: 0,
          y: 0
        },
        outer: {
          x: 0,
          y: 0
        }
      }
    };

    // this.dialogBox = this.scene.add.rectangle(0, 0, this.props.width, this.props.height, 0x000000, 0.6);
    this.dialogBox = this.scene.add.rectangle(0, 0, this.props.width, this.props.height, 0xee02A0, 1);
    this.dialogBox.setOrigin(0, 0);
    this.dialogBox.setVisible(false);
    this.scene.add.existing(this.dialogBox);

    this.isDialogOpen = false;
    this.close = false;

    this.userInputEnabled = true;
  }

  isOpen() {
    return this.isDialogOpen;
  }

  isPaused() {
    return this.dialogState === DialogState.PAUSED;
  }

  /**
   * Sets the dialog box position.
   */
  setPosition(x:number, y:number) {
    this.props.position.x = x;
    this.props.position.y = y;
  }

  getY() : number {
    return this.props.position.y;
  }

  setY(y:number) {
    this.props.position.y = y;
    this.resetDialogPosition();
  }

  resetDialogPosition() {
    this.dialogBox.x = this.props.position.x;
    this.dialogBox.y = this.props.position.y;
  }

  /**
   * Moves the modal on the y-axis the provided amount
   * @param units
   */
  moveY(units:number) {
    this.setY(this.dialogBox.y + units);
  }

  centerOnScreen(screenWidth:number, screenHeight:number) {
    this.setPosition((screenWidth * 0.5) - this.props.width * 0.5, (screenHeight * 0.5) - this.props.height * 0.5);
    this.resetDialogPosition();
  }

  centerOnScreenWidth(width:number) {
    this.props.position.x = (width * 0.5) - this.props.width * 0.5;
    this.resetDialogPosition();
  }

  getWidth() : number {
    return this.props.width;
  }

  getHeight() : number {
    return this.props.height;
  }

  setWidth(width:number) {
    this.props.width = width;
    this.dialogBox.width = width;
    this.dialogBox.displayWidth = width;
  }

  setHeight(height:number) {
    this.props.height = height;
    this.dialogBox.height = height;
    this.dialogBox.displayHeight = height;
  }

  show(value) {
    this.isDialogOpen = value;
    this.dialogBox.setVisible(value);
  }

  getState() {
    return this.dialogState;
  }

  setState(state) {
    this.dialogState = state;
  }

  /**
   * @param {boolean} value
   */
  setUserInputEnabled(value) {
    this.userInputEnabled = value;
  }
}