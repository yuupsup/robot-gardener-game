import Phaser from 'phaser';
import GameController from "../../GameController";
import MessageGraph from "../../gui/dialog/message/MessageGraph";
import MessageNode from "../../gui/dialog/message/MessageNode";
import {GameConstants} from "../../GameConstants";
import {CommandType} from "../../pattern/command/CommandType";
import Command from "../../pattern/command/Command";
import TodoManager from "../../entities/manager/todo/TodoManager";
import {ColorConstants} from "../../entities/color/ColorConstants";
import Flower from "../../entities/flower/Flower";
import {EntityConstants} from "../../entities/EntityConstants";

export default class TutorialManager {
  todoManager:TodoManager;
  constructor(todoManager:TodoManager) {
    this.todoManager = todoManager;
  }

  setup(data:any, scene:Phaser.Scene) {
    const dialogManager = GameController.instance(scene).getDialogManager(scene);

    if (data.instructions) {
      const instructions = data.instructions;
      for (let i = 0; i < instructions.length; i++) {
        const data = instructions[i];
        if (data.messages) {
          let prevNode = null;
          const mg = new MessageGraph();

          for (let j = 0; j < data.messages.length; j++) {
            const message = data.messages[j];
            const node = new MessageNode(message.name).setMessage(message.text).setAuto(message.auto).setProceedOnUserAction(message.proceedOnUserAction);
            /**
             * Callbacks
             */
            // player moves and pick up/put down flower
            if (message.pickup) {
              node.setOnEnd((function(scene:Phaser.Scene) {
                return function() {
                  const dialogManager = GameController.instance(scene).getDialogManager(scene);
                  dialogManager.pause();

                  const commandManager = GameController.instance(scene).getCommandManager(scene);
                  commandManager.addStatic(CommandType.Entity.UNPAUSE);
                  commandManager.addStatic(CommandType.Player.TUTORIAL_PICK_UP);
                };
              })(scene));
            } else if (message.putdown) {
              node.setOnEnd((function(scene:Phaser.Scene) {
                return function() {
                  const dialogManager = GameController.instance(scene).getDialogManager(scene);
                  dialogManager.pause();

                  const commandManager = GameController.instance(scene).getCommandManager(scene);
                  commandManager.addStatic(CommandType.Entity.UNPAUSE);
                  commandManager.addStatic(CommandType.Player.TUTORIAL_PUT_DOWN);
                };
              })(scene));
            } else if (message.showtodo) {
              node.setOnEnd((function(todoManager:TodoManager) {
                return function() {
                  // todo show the todo item
                  todoManager.add(ColorConstants.Color.RED, ColorConstants.Color.BLUE);
                  todoManager.setMoveIn();
                  todoManager.updateLetterDisplay();
                };
              })(this.todoManager));
            } else if (message.createflower) {
              node.setOnStart((function(scene:Phaser.Scene) {
                return function() {
                  new Flower({
                    scene: scene,
                    x: 136,
                    y: 104,
                    width: 16,
                    height: 16,
                    xoffset: 8,
                    yoffset: 8,
                    group: EntityConstants.Group.FLOWER,
                    color: ColorConstants.Color.BLUE,
                    texture: 'flower'
                  });
                };
              })(scene));
              node.setOnEnd((function(scene:Phaser.Scene) {
                return function() {
                  const dialogManager = GameController.instance(scene).getDialogManager(scene);
                  dialogManager.pause();

                  const commandManager = GameController.instance(scene).getCommandManager(scene);
                  commandManager.addStatic(CommandType.Entity.UNPAUSE);
                  commandManager.addStatic(CommandType.Player.TUTORIAL_PAIR_FLOWERS);
                };
              })(scene));
            } else if (message.done) {
              node.setOnEnd((function(scene:Phaser.Scene) {
                return function() {
                  const commandManager = GameController.instance(scene).getCommandManager(scene);
                  // commandManager.addStatic(CommandType.Level.TUTORIAL_COMPLETE);
                  commandManager.addStatic(CommandType.Level.NEXT_LEVEL); // tutorial completed
                };
              })(scene));
            }
            mg.addNode(node);

            // attach the message nodes
            if (prevNode) {
              mg.addEdgeTo(prevNode.name, node.name);
            }
            prevNode = node;
          }
          // add to dialog manager
          if (!mg.isEmpty()) {
            dialogManager.addMessage(mg);
          }
        }
      }
    }
  }

  update(time:number, delta:number, scene:Phaser.Scene) {
    // const dialogManager = GameController.instance(scene).getDialogManager(scene);
    // dialogManager.update(time, delta);
  }

  command(command:Command, scene:Phaser.Scene) {
    const dialogManager = GameController.instance(scene).getDialogManager(scene);

    if (command.type === CommandType.Level.TUTORIAL_PICK_UP
      || command.type === CommandType.Level.TUTORIAL_PUT_DOWN
      || command.type === CommandType.Level.TUTORIAL_PAIR_FLOWERS) {
      dialogManager.unpause(); // proceed to the next message
    }
  }
}