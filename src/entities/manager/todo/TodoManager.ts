import Phaser from "phaser";
import TodoItem from "./TodoItem";
import {GameConstants} from "../../../GameConstants";
import {Easing} from "../../../utils/Easing";
/**
 * Manages the flower combinations needed to complete the level
 */
export default class TodoManager {
  items:Array<TodoItem>;
  index:number;
  displayIndex:number; // the current index from the items displayed
  done:boolean; // all items completed

  todoItemImg:Phaser.GameObjects.Image;

  // at most there will be three color letters displayed in an item
  colorLetter1:Phaser.GameObjects.Sprite;
  colorLetter2:Phaser.GameObjects.Sprite;
  colorLetter3:Phaser.GameObjects.Sprite;

  crossImg1:Phaser.GameObjects.Image;
  crossImg2:Phaser.GameObjects.Image;

  moveTime:number; // used to determine when to move the item on screen
  moveTimeMax:number;
  moveTimeSpd:number;

  moveDist:number;

  position:Phaser.Math.Vector2;

  States:any;
  currentState:number;

  constructor(scene:Phaser.Scene) {
    this.items = new Array<TodoItem>();
    this.index = 0;
    this.displayIndex = 0;
    this.done = false;

    this.position = new Phaser.Math.Vector2(GameConstants.Screen.ROOM_WIDTH * 0.5, -16);

    this.todoItemImg = scene.add.image(this.position.x, this.position.y, 'todo-item');

    this.colorLetter1 = scene.add.sprite(-16, 0, 'color-letters').setVisible(false);
    this.colorLetter2 = scene.add.sprite(-16, 0, 'color-letters').setVisible(false);
    this.colorLetter3 = scene.add.sprite(-16, 0, 'color-letters').setVisible(false);

    this.crossImg1 = scene.add.image(-16, 0, 'cross').setVisible(false);
    this.crossImg2 = scene.add.image(-16, 0, 'cross').setVisible(false);

    this.moveTime = 0;
    this.moveTimeMax = 1;
    this.moveTimeSpd = 1;

    this.moveDist = 32;

    this.States = {};
    this.States.IDLE = 0;
    this.States.MOVE_IN = 1;
    this.States.MOVE_OUT = 2;

    this.currentState = this.States.IDLE;
  }

  isDone() : boolean {
    return this.done;
  }


  setMoveIn() {
    this.currentState = this.States.MOVE_IN;
  }

  setMoveOut() {
    this.currentState = this.States.MOVE_OUT;
  }

  get(index:number|undefined=undefined) : TodoItem|null {
    index = index === undefined ? this.index : index;
    if (this.items.length === 0 || index > this.items.length) {
      return null;
    }
    return this.items[index];
  }

  getMix() : string {
    const todo = this.get();
    return todo !== null ? todo.getMix() : "";
  }

  hasNext() {
    return (this.index + 1) < this.items.length;
  }

  next() {
    this.index++;
  }

  add(...colors) {
    this.items.push(new TodoItem(...colors));
  }

  /**
   * Updates the position of the cross and letters.
   */
  updateLetterPosition() {
    const todo = this.get(this.displayIndex);
    if (todo) {
      if (todo.size() === 2) {
        this.colorLetter1.setPosition(this.position.x - 10, this.todoItemImg.y);
        this.crossImg1.setPosition(this.position.x, this.todoItemImg.y);
        this.colorLetter2.setPosition(this.position.x + 10, this.todoItemImg.y);
      } else if (todo.size() === 3) {
        this.colorLetter1.setPosition(this.position.x - 20, this.todoItemImg.y);
        this.crossImg1.setPosition(this.position.x - 10, this.todoItemImg.y);
        this.colorLetter2.setPosition(this.position.x, this.todoItemImg.y);
        // last
        this.crossImg2.setPosition(this.position.x + 10, this.todoItemImg.y);
        this.colorLetter3.setPosition(this.position.x + 20, this.todoItemImg.y);
      }
    }
  }

  /**
   * Updates the letters to be displayed.
   */
  updateLetterDisplay() {
    const todo = this.get();
    if (todo && todo.size() > 0) {
      const anim = this.colorLetter1.scene.anims.get('color-letters');
      this.colorLetter1.anims.setCurrentFrame(anim.frames[todo.colors[0].color]);
      this.colorLetter2.anims.setCurrentFrame(anim.frames[todo.colors[1].color]);

      if (todo.size() === 2) {
        // hide
        this.colorLetter3.setVisible(false);
        this.crossImg2.setVisible(false);
      } else if (todo.size() === 3) {
        this.colorLetter3.anims.setCurrentFrame(anim.frames[todo.colors[2].color]);
        // show
        this.colorLetter3.setVisible(true);
        this.crossImg2.setVisible(true);
      }
      this.colorLetter1.setVisible(true);
      this.colorLetter2.setVisible(true);
      this.crossImg1.setVisible(true);
    }
  }

  update(time:number, delta:number) {
    if (this.currentState === this.States.MOVE_IN) {
      this.moveIn(delta);
    } else if (this.currentState === this.States.MOVE_OUT) {
      this.moveOut(delta);
    }
    // update the letters position
    this.updateLetterPosition();
  }

  moveIn(delta:number) {
    this.moveTime = Phaser.Math.Clamp(this.moveTime + this.moveTimeSpd * delta, 0, 1);

    const dist = Easing.easeOutExpo(this.moveTime) * this.moveDist;

    this.todoItemImg.y = this.position.y + dist;

    if (this.moveTime === 1) {
      this.currentState = this.States.IDLE;
    }
  }

  moveOut(delta:number) {
    this.moveTime = Phaser.Math.Clamp(this.moveTime - this.moveTimeSpd * 2 * delta, 0, 1);

    const dist = Easing.easeInQuad(this.moveTime) * this.moveDist;

    this.todoItemImg.y = this.position.y + dist;

    if (this.moveTime === 0) {
      if (this.isDone()) {
        this.currentState = this.States.IDLE;
      } else {
        this.displayIndex = this.index; // update the display index
        this.updateLetterDisplay();
        this.currentState = this.States.MOVE_IN;
      }
    }
  }

  reset() {
    this.items = [];
    this.index = 0;
    this.displayIndex = 0;
    this.done = false;

    this.moveTime = 0;

    this.todoItemImg.setPosition(this.position.x, this.position.y);

    this.colorLetter1.setPosition(-16, 0).setVisible(false);
    this.colorLetter2.setPosition(-16, 0).setVisible(false);
    this.colorLetter3.setPosition(-16, 0).setVisible(false);

    this.crossImg1.setPosition(-16, 0).setVisible(false);
    this.crossImg2.setPosition(-16, 0).setVisible(false);

    this.currentState = this.States.IDLE;
  }
}