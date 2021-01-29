import Phaser from 'phaser';
import GameController from "../../GameController";
import MessageGraph from "../../gui/dialog/message/MessageGraph";
import MessageNode from "../../gui/dialog/message/MessageNode";
import {GameConstants} from "../../GameConstants";

export default class TutorialManager {
  scene:Phaser.Scene;
  constructor(scene:Phaser.Scene) {
    // const dialogManager = GameController.instance(scene).getDialogManager(scene);
    //
    // const mg = new MessageGraph();
    // const nodeA = new MessageNode('A').setMessage('Hello');
    // const nodeB = new MessageNode('B').setMessage('World').setProceedOnUserAction(false);
    //
    // mg.addNode(nodeA);
    // mg.addNode(nodeB);
    //
    // mg.addEdgeTo(nodeA.name, nodeB.name);
    //
    // dialogManager.addMessage(mg);
  }

  setup(data:any, scene:Phaser.Scene) {
    const dialogManager = GameController.instance(scene).getDialogManager(scene);
    dialogManager.setPosition(80, GameConstants.Screen.ROOM_HEIGHT - 51);

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

    // todo need to instruct the player on how to play
    //
    // 1. Give instructions
    // 2. Player follows instructions
    // 3. Once instructions are completed, clear all grid entities (flowers)
    // 4. If more instructions, create the entities for the instruction and proceed to step (1), otherwise, tutorial is finished, proceed to next level

    // todo need to pass the instructions to this class, will be an array of objects
    // todo need the TodoManager


    const dialogManager = GameController.instance(scene).getDialogManager(scene);
    dialogManager.update(time, delta);
  }
}