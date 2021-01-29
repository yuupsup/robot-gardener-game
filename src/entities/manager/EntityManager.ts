import Phaser from 'phaser';
import {GameConstants} from "../../GameConstants";
import {EntityConstants} from "../EntityConstants";
import {SceneConstants} from "../../scenes/SceneConstants";
import LevelScene from "../../scenes/LevelScene";
import Entity from "../Entity";
import EntityToAdd from "./EntityToAdd";
import GameController from "../../GameController";
import Command from "../../pattern/command/Command";

export default class EntityManager {
  entities:Map<number, Entity>; // key: entity id, value: entity
  entitiesToAdd:Array<EntityToAdd>;
  entitiesToRemove:Map<number, any>; // map of entity identifiers that need to be removed from the scene (not DESTROYED)
  groupsById:Map<string, Phaser.GameObjects.Group>;
  newId:number;

  entityGridPosition:Map<number, Set<number>>; // stores the grid position of all entities (key: row-major order grid position, value: entity ids)

  scene:LevelScene;

  constructor(scene:LevelScene) {
    this.entities = new Map<number, Entity>();
    this.entitiesToAdd = new Array<EntityToAdd>();
    this.entitiesToRemove = new Map<number, any>();
    this.groupsById = new Map<string, Phaser.GameObjects.Group>();
    this.newId = 0; // represents the current id to be provided to a created entity

    this.entityGridPosition = new Map<number, Set<number>>();

    this.scene = scene;
  }

  /**
   * Returns the instance of the GameController from the Phaser.Game instance.
   * @param {Phaser.Scene} scene
   * @return {GameController}
   */
  static instance(scene:Phaser.Scene) : EntityManager {
    const levelScene = scene.scene.get(SceneConstants.Scenes.LEVEL) as LevelScene;
    return levelScene.entityManager;
  }

  /**
   * Generates an id for the entities.
   * @return {number}
   */
  generateId() {
    this.newId++;
    return this.newId;
  }

  /**
   * Adds and setup the entity.
   * NOTE: This method should only be called from within the EntityManager.
   * @param {Entity} entity
   * @param {Phaser.Scene} scene
   * @param {boolean} isStatic denotes if the instance should use static arcade physics
   */
  addEntity(entity:Entity, scene:Phaser.Scene, isStatic:boolean) {
    //this.entities.push(entity);
    // todo adding entity graph to transform children (moving platforms)
    scene.physics.add.existing(entity, isStatic);

    entity.id = this.generateId();
    entity.setup();

    scene.add.existing(entity);

    this.entities.set(entity.id, entity);
  }

  addEntityToAdd(entity:Entity, scene:Phaser.Scene, isStatic:boolean, addToGroupId:string|null = null) {
    this.entitiesToAdd.push(new EntityToAdd(entity, scene, isStatic, addToGroupId));
  }

  /**
   * Adds the entity to be removed
   * @param {number} id identifier of the entity
   * @param {string} groupId of the group that contains the entity
   */
  addEntityToRemove(id:number, groupId:string) {
    this.entitiesToRemove.set(id, {
      id: id,
      groupId: groupId
    });
  }

  /**
   * Gets the group from the id
   * @param {string} groupId
   * @return {Phaser.GameObjects.Group|null}
   */
  getGroupById(groupId:string) : Phaser.GameObjects.Group|undefined {
    return this.groupsById.get(groupId);
  }

  /**
   * Creates the group and adds it to the scene.
   * @param classType
   * @param groupId
   * @param isStatic determines whether the group is static, otherwise it is dynamic
   * @param scene
   */
  createGroup(classType:any, groupId:string, isStatic:boolean, scene:Phaser.Scene) : Phaser.GameObjects.Group {
    const group = isStatic ?
      scene.physics.add.staticGroup({
        classType: classType
      })
      :
      scene.physics.add.group({
        classType: classType
      });
    this.addGroup(groupId, group, false, isStatic, scene);
    return group;
  }

  /**
   * Adds the group to the map containing all groups
   * @param groupId
   * @param {Phaser.GameObjects.Group} group
   * @param {boolean} pushEntities represents whether or not to push entities to the entity list
   * @param {boolean} isStatic
   * @param {Phaser.Scene} scene represents whether or not to push entities to the entity list
   */
  addGroup(groupId:string, group:Phaser.GameObjects.Group, pushEntities:boolean, isStatic:boolean, scene:Phaser.Scene) {
    if (pushEntities) {
      const children = group.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as Entity;
        this.addEntity(child, scene, isStatic);
      }
    }
    this.groupsById.set(groupId, group);
  }

  /**
   * Adds an entity to the group with the provided id.
   * @param {Entity} entity
   * @param {string} groupId
   * @param {boolean} isStatic
   * @param {Phaser.Scene} scene
   */
  addEntityToGroup(entity:Entity, groupId:string, isStatic:boolean, scene:Phaser.Scene) {
    if (this.groupsById.has(groupId)) {
      const group = this.groupsById.get(groupId);
      if (group) {
        group.add(entity, false);
        this.addEntity(entity, scene, isStatic);
      }
    }
  }

  /**
   * Remove entities in the "to be removed" map structure
   */
  removeEntities() {
    // this.entitiesToRemove <- map
    // need to remove entity from entity grid position map
    this.entitiesToRemove.forEach((function(self:EntityManager) {
      return function (props:any) {
        const id = props.id;
        const entity = self.entities.get(id);
        if (entity) {
          // remove from the group
          if (props.groupId) {
            const group = self.getGroupById(props.groupId);
            if (group) {
              group.remove(entity, false, true);
            }
          } else {
            entity.destroy();
          }
          self.entities.delete(id);
          self.entitiesToRemove.delete(id);
          // remove from entity grid map
          self.entityGridPosition.forEach((function(self:EntityManager, id:number) {
            return function (idSet:Set<number>) {
              idSet.delete(id);
            };
          })(self, id));
        }
      };
    })(this));
  }



  update(time: number, delta: number) {
    // add entities to the collection
    for (let i = 0; i < this.entitiesToAdd.length; i++) {
      const entityToAdd = this.entitiesToAdd[i];

      this.addEntity(entityToAdd.entity, entityToAdd.scene, entityToAdd.isStatic);

      // add the entity grid positions
      if (entityToAdd.entity.grid) {
        this.addEntityGridPosition(entityToAdd.entity);
      }

      if (entityToAdd.groupId) {
        const group = this.getGroupById(entityToAdd.groupId);
        if (group) {
          group.add(entityToAdd.entity, false);
        }
      }
    }
    this.entitiesToAdd = [];

    const gameController = GameController.instance(this.scene);

    /**
     * Commands
     */
    const commandManager = gameController.getCommandManager(this.scene);
    if (commandManager) {
      // iterate the commands
      while (commandManager.size() > 0) {
        const command = commandManager.next();
        if (command) {
          gameController.sendCommandToSystems(command, this.scene);

          // sends commands to entities
          this.entities.forEach((function(time:number, delta:number, command:Command) {
            return function (entity:Entity) {
              entity.command(command);
            };
          })(time, delta, command));
        }
      }
    }

    // update the input manager
    const inputManager = gameController.getInputManager(this.scene);
    if (inputManager) {
      inputManager.update();
    }
    const cameraManager = gameController.getCameraManager(this.scene);
    if (cameraManager) {
      cameraManager.update();
    }

    const levelManager = gameController.getLevelManager(this.scene);
    if (levelManager) {
      levelManager.update(time, delta);
    }

    const dialogManager = gameController.getDialogManager(this.scene);
    if (dialogManager) {
      dialogManager.update(time, delta);
    }

    // preupdate
    this.entities.forEach((function(time:number, delta:number) {
      return function (entity:Entity) {
        entity.preUpdateCall(time, delta);
      };
    })(time, delta));

    // update
    this.entities.forEach((function(time:number, delta:number) {
      return function (entity:Entity) {
        entity.update(time, delta);
      };
    })(time, delta));

    // postupdate
    this.entities.forEach((function(time:number, delta:number) {
      return function (entity:Entity) {
        entity.postUpdate(time, delta);
      };
    })(time, delta));

    // update the entity grid position
    this.entities.forEach((function(time:number, delta:number, entityManager:EntityManager) {
      return function (entity:Entity) {
        if (entity.grid) {
          let gx, gy, coord;
          let idSet: Set<number>;
          // remove entity from previous position
          gx = entity.transformProperties.gridPrevPosition.x;
          gy = entity.transformProperties.gridPrevPosition.y;
          coord = entityManager.convertPositionToRowMajorOrder(gx, gy);
          if (entityManager.entityGridPosition.has(coord)) {
            idSet = entityManager.entityGridPosition.get(coord);
            idSet.delete(entity.id);
          }
          // remove entry from map when empty
          if (idSet && idSet.size === 0) {
            entityManager.entityGridPosition.delete(coord);
          }
          // add entity to current position
          entityManager.addEntityGridPosition(entity);
        }
      };
    })(time, delta, this));

    // remove entities
    if (this.entitiesToRemove.size > 0) {
      this.removeEntities();
    }
    // level manager
    levelManager.postUpdate();
  }

  addEntityGridPosition(entity:Entity) {
    // add entity to current position
    const gx = entity.transformProperties.gridPosition.x;
    const gy = entity.transformProperties.gridPosition.y;
    const coord = this.convertPositionToRowMajorOrder(gx, gy);
    if (!this.entityGridPosition.has(coord)) {
      this.entityGridPosition.set(coord, new Set<number>());
    }
    const idSet = this.entityGridPosition.get(coord);
    idSet.add(entity.id);
  }

  /**
   * Finds the first entity at the position that matches the provided entity type.
   * @param x world coordinate
   * @param y world coordinates
   * @param entityType type of entity (see EntityConstants)
   * @param ignoreEntity
   */
  getEntityAtGridPosition(x:number, y:number, entityType:number, ignoreEntity:Entity|null=null) : Entity|null {
    const entities = this.getEntitiesAtGridPosition(x, y, entityType, ignoreEntity);
    if (entities.length > 0) {
      return entities[0];
    }
    return null;
  }

  getEntitiesAtGridPosition(x:number, y:number, entityType:number, ignoreEntity:Entity|null=null) : Array<Entity> {
    const result = new Array<Entity>();

    const idSet = this.entityGridPosition.get(this.convertPositionToRowMajorOrder(x, y));
    if (idSet && idSet.size > 0) {
      idSet.forEach((function(arrIn:Array<any>, entityType:number, entityManager:EntityManager) {
        return function(id:number) {
          const entity = entityManager.entities.get(id);
          if (entity && (entityType === EntityConstants.Type.NONE || entity.entityType === entityType) && (!ignoreEntity || (entity.id !== ignoreEntity.id))) {
            // arrIn.push(entity.getProperties());
            arrIn.push(entity);
          }
        };
      })(result, entityType, this));
    }
    return result;
  }

  convertPositionToRowMajorOrder(x:number, y:number) : number {
    const nx = Math.floor(x / GameConstants.Tile.SIZE);
    const ny = Math.floor(y / GameConstants.Tile.SIZE);
    return nx * GameConstants.Screen.ROOM_WIDTH + ny;
  }

  destroy() {
    // remove all entities
    this.entities.forEach((function(self:EntityManager) {
      return function (entity:Entity) {
        self.addEntityToRemove(entity.id, entity.groupId);
      };
    })(this));
    this.removeEntities();

    this.entitiesToAdd = [];
    this.entities.clear();
    this.entitiesToRemove.clear();
    this.entityGridPosition.clear();
    // remove all groups
    this.groupsById.forEach(function (group:Phaser.GameObjects.Group) {
      group.destroy(true);
    });
    this.groupsById.clear();

    this.newId = 0; // reset id
  }
}