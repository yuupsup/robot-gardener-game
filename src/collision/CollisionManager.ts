import Phaser from 'phaser';
import {GameConstants} from "../GameConstants";
import {CollisionResolve} from "./CollisionResolve";
import AABB from "./AABB";
import TileManager from "../tile/TileManager";

export default class CollisionManager {
  /**
   * Checks for a collision with a tile using the AABB swept based collision detection.
   * @param {AABB} aabb
   * @param {Phaser.Math.Vector2|object} position
   * @param {Phaser.Math.Vector2|object} velocity
   * @param entityId
   * @param delta
   * @param {number} sceneWidth represents the width (in pixels) of the scene
   * @param {number} sceneHeight represents the height (in pixels) of the scene
   * @param {number} collisionResolve represents the type of collision resolve to apply
   * @param {string} tileLayerId
   * @param {boolean} ignoreEntity ignore entity collisions
   * @param {Phaser.Scene} scene
   * @returns An object consisting of the caller's position and velocity values updated based on the results of the collision. If no collision occurred, then the values are the same.
   */
  static sweptCollision(aabb:AABB, position:Phaser.Math.Vector2|any, velocity:Phaser.Math.Vector2|any, entityId:number, delta:number, sceneWidth:number, sceneHeight:number, collisionResolve:number, tileLayerId:string, ignoreEntity:boolean, scene:Phaser.Scene) : any {
    let offset = {x: aabb.xoffset, y: aabb.yoffset};
    let tmpAABB = AABB.create(position, offset, aabb.width, aabb.height);
    let broadphaseAABB = AABB.createCopy(tmpAABB);

    let tmpPos = {x: position.x, y: position.y};
    let tmpVel = {x: velocity.x, y: velocity.y};
    let tmpVelDelta = {x: velocity.x * delta, y: velocity.y * delta};

    CollisionManager.updateSweptBroadphaseAABB(broadphaseAABB, tmpVelDelta);

    let result:any = {};

    let collisionList = [];

    // find all the tile collisions
    let tileListIn = [];
    TileManager.getTileCollisions(broadphaseAABB, tmpVelDelta, sceneWidth, sceneHeight, tileLayerId, tileListIn, scene);
    CollisionManager.addToCollisionList(tileListIn, collisionList, false, entityId);

    // find all the entity collisions
    let listIn = ignoreEntity ? [] : CollisionManager.getEntityCollisions(broadphaseAABB, tmpVelDelta, scene, false, true);
    CollisionManager.addToCollisionList(listIn, collisionList, true, entityId);

    if (collisionList.length > 0) {
      let nearest = CollisionManager.getSweptCollision(tmpAABB, tmpVelDelta, collisionList);

      let collisionTime = nearest.time;
      let normal = nearest.normal;

      tmpPos.x += tmpVelDelta.x * collisionTime;
      tmpPos.y += tmpVelDelta.y * collisionTime;

      // update the temporary bounds
      tmpAABB.update(tmpPos);

      if (collisionTime < 1) {
        let remTime = 1 - collisionTime;

        if (normal.x !== 0) {
          tmpVel.x = 0;
        }
        if (normal.y !== 0) {
          tmpVel.y = 0;
        }

        if (collisionResolve === CollisionResolve.DEFAULT) {
          tmpVel.x = 0;
          tmpVel.y = 0;

          result.normal = {
            x: normal.x,
            y: normal.y
          };
        } else if (collisionResolve === CollisionResolve.SLIDE) {
          // slide
          let dotprod = (tmpVelDelta.x * normal.y + tmpVelDelta.y * normal.x) * remTime;

          // this velocity includes delta that was applied to the current velocity
          let newVel = {
            x: dotprod * normal.y,
            y: dotprod * normal.x
          };

          if (newVel.x !== 0 || newVel.y !== 0) {
            // need to check for another swept collision to ensure the instance can slide on the collision
            broadphaseAABB.copy(tmpAABB);
            CollisionManager.updateSweptBroadphaseAABB(broadphaseAABB, newVel);

            collisionList = [];

            // find all the tile collisions
            tileListIn = [];
            TileManager.getTileCollisions(broadphaseAABB, newVel, sceneWidth, sceneHeight, tileLayerId, tileListIn, scene);
            CollisionManager.addToCollisionList(tileListIn, collisionList, false, entityId);

            // find all the entity collisions
            listIn = ignoreEntity ? [] : CollisionManager.getEntityCollisions(broadphaseAABB, newVel, scene, false, true);
            CollisionManager.addToCollisionList(listIn, collisionList, true, entityId);

            if (collisionList.length > 0) {
              nearest = CollisionManager.getSweptCollision(tmpAABB, newVel, collisionList);

              collisionTime = nearest.time;
              normal = nearest.normal;

              newVel.x *= collisionTime;
              newVel.y *= collisionTime;

              // another collision occurred from slide, reset the velocity
              if (collisionTime < 1) {
                if (normal.x !== 0) {
                  tmpVel.x = 0;
                }
                if (normal.y !== 0) {
                  tmpVel.y = 0;
                }
              }
            }
            tmpPos.x += newVel.x;
            tmpPos.y += newVel.y;
          }

          result.normal = {
            x: normal.x,
            y: normal.y
          }
        }
      }
    } else {
      tmpPos.x += tmpVelDelta.x;
      tmpPos.y += tmpVelDelta.y;
    }

    result.position = tmpPos;
    result.velocity = tmpVel;
    if (!result.normal) {
      result.normal = {
        x: 0,
        y: 0
      }
    }

    return result;
  }

  /**
   * Checks for a collision with each (tile or entity) in the provided list using swept based collision detection.
   * @param {AABB} aabb
   * @param {Phaser.Math.Vector2|object} velocity
   * @param collisionListIn
   * @returns the soonest 'hit' result from the collision.
   */
  static getSweptCollision(aabb:AABB, velocity:Phaser.Math.Vector2|any, collisionListIn:Array<any>) : any {
    let nearest:any = {};
    nearest.time = 1;
    nearest.normal = {
      x: 0,
      y: 0
    }
    nearest.bothAxisCollide = false;

    for (let i = 0; i < collisionListIn.length; i++) {
      const inst = collisionListIn[i];
      let bounds;

      if (inst.type === 'tile') {
        const tile = inst.object;
        const tileX = tile.x * GameConstants.Tile.SIZE;
        const tileY = tile.y * GameConstants.Tile.SIZE;
        const w = GameConstants.Tile.SIZE;
        const h = GameConstants.Tile.SIZE;
        bounds = AABB.create({x: tileX, y: tileY}, {}, w, h);
      } else if (inst.type === 'entity') {
        const entity = inst.object;
        bounds = AABB.createCopy(entity.aabb);
      }

      let hit = CollisionManager.sweptAABB(aabb, velocity, bounds);
      // found a collision that occurred sooner?
      if (hit.time < nearest.time) {
        if (!CollisionManager.isCollisionIgnored(inst, hit.normal)) {
          // update the hit result
          nearest.time = hit.time;
          nearest.normal.x = hit.normal.x;
          nearest.normal.y = hit.normal.y;
          nearest.bothAxisCollide = hit.bothAxisCollide;
        }
      }
    }

    // special case: This case occurs when the distance between both axis x and y are both 0.
    // This can happen when the moving instance hits the corner of a static AABB. In order to resolve
    // this case, we need to recheck each (tile or entity) collision and see which axis is free.
    if (!nearest.overlap && nearest.bothAxisCollide) {
      let hitX = false;
      let hitY = false;

      let tmpAABB = AABB.create({}, {}, 0, 0);
      let bounds = AABB.create({}, {}, 0, 0);

      let vx = velocity.x;
      let vy = velocity.y;

      for (let i = 0; i < collisionListIn.length; i++) {
        const inst = collisionListIn[i];

        if (inst.type === 'tile') {
          const tile = inst.object;
          let tileX = tile.x * GameConstants.Tile.SIZE;
          let tileY = tile.y * GameConstants.Tile.SIZE;
          let w = GameConstants.Tile.SIZE;
          let h = GameConstants.Tile.SIZE;

          let tileAABB = AABB.create({x: tileX, y: tileY}, {}, w, h);
          bounds.copy(tileAABB);
        } else if (inst.type === 'entity') {
          const entity = inst.object;
          bounds.copy(entity.aabb);
        }

        tmpAABB.copy(aabb);

        // horizontal
        if (vx > 0) {
          tmpAABB.x = aabb.x + 1;
        } else if (vx < 0) {
          tmpAABB.x = aabb.x - 1;
        }

        if (!hitX) {
          hitX = tmpAABB.isCollide(bounds);
        }

        // vertical
        tmpAABB.x = aabb.x; // reset the x position
        if (vy > 0) {
          tmpAABB.y = aabb.y + 1;
        } else if (vy < 0) {
          tmpAABB.y = aabb.y - 1;
        }

        if (!hitY) {
          hitY = tmpAABB.isCollide(bounds);
        }

        if (hitX && hitY) {
          break;
        }
      }

      if (hitX && !hitY) {
        if (vx > 0) {
          nearest.normal.x = -1;
          nearest.normal.y = 0;
        } else if (vx < 0) {
          nearest.normal.x = 1;
          nearest.normal.y = 0;
        }
      } else if (!hitX && hitY) {
        if (vy > 0) {
          nearest.normal.x = 0;
          nearest.normal.y = -1;
        } else if (vy < 0) {
          nearest.normal.x = 0;
          nearest.normal.y = 1;
        }
      } else {
        // both axis are not free
        if (hitX && hitY) {
          if (vx > 0) {
            nearest.normal.x = -1;
          } else {
            nearest.normal.x = 1;
          }
          if (vy > 0) {
            nearest.normal.y = -1;
          } else {
            nearest.normal.y = 1;
          }
        } else {
          // both axis are free, allow to move on one axis
          // since this is used for a platform genre, we will allow the x-axis
          nearest.normal.x = 0;
          if (vy > 0) {
            nearest.normal.y = -1;
          } else if (vy < 0) {
            nearest.normal.y = 1;
          }
        }
      }
    }
    return nearest;
  }

  /**
   * Determines if there is a collision between the provided AABB (aabb) and the (tile or entity) bounds.
   * @param {AABB} aabb
   * @param {Phaser.Math.Vector2|object} velocity
   * @param {AABB} bounds bounds from the other instance (tile or entity)
   * @returns a 'hit' object containing the results of the collision.
   */
  static sweptAABB(aabb:AABB, velocity:Phaser.Math.Vector2|any, bounds:AABB) : any {
    let hit:any = {};
    hit.time = 1;
    hit.normal = {
      x: 0,
      y: 0
    }
    hit.bothAxisCollide = false;

    // these values are the inverse time until it hits the other object on the axis
    let xInvEntry;
    let yInvEntry;

    let xInvExit;
    let yInvExit;

    let vx = velocity.x;
    let vy = velocity.y;

    // find the distance between the objects on the near and far sides for both x and y
    if (vx > 0) {
      xInvEntry = bounds.x - (aabb.x + aabb.width);
      xInvExit = (bounds.x + bounds.width) - aabb.x;
    } else {
      xInvEntry = (bounds.x + bounds.width) - aabb.x;
      xInvExit = bounds.x - (aabb.x + aabb.width);
    }

    if (vy > 0) {
      yInvEntry = bounds.y - (aabb.y + aabb.height);
      yInvExit = (bounds.y + bounds.height) - aabb.y;
    } else {
      yInvEntry = (bounds.y + bounds.height) - aabb.y;
      yInvExit = bounds.y - (aabb.y + aabb.height);
    }

    // find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
    // these will give us our value between 0 and 1 of when each collision occurred on each axis.
    let xEntry;
    let yEntry;

    let xExit;
    let yExit;

    if (vx == 0) {
      xEntry = Number.NEGATIVE_INFINITY;
      xExit = Number.POSITIVE_INFINITY;
    } else {
      xEntry = xInvEntry / vx;
      xExit = xInvExit / vx;
    }

    if (vy == 0) {
      yEntry = Number.NEGATIVE_INFINITY;
      yExit = Number.POSITIVE_INFINITY;
    } else {
      yEntry = yInvEntry / vy;
      yExit = yInvExit / vy;
    }

    if (xEntry > 1) {
      xEntry = Number.NEGATIVE_INFINITY;
    }
    if (yEntry > 1) {
      yEntry = Number.NEGATIVE_INFINITY;
    }

    // from here we need to find which axis collided first
    // find the earliest/latest times of collision
    let entryTime = Math.max(xEntry, yEntry); // when the collision first occurred
    let exitTime = Math.min(xExit, yExit); // when the instance exited the collision

    // when no collision occurred
    if (entryTime > exitTime) {
      return hit;
    }
    if (xEntry < 0 && yEntry < 0) {
      return hit;
    }

    if (xEntry < 0) {
      // check that the bounding box started overlapped or not
      if (((aabb.x + aabb.width) < bounds.x) || (aabb.x > (bounds.x + bounds.width))) {
        return hit;
      }
    }
    if (yEntry < 0) {
      if (((aabb.y + aabb.height) < bounds.y) || (aabb.y > (bounds.y + bounds.height))) {
        return hit;
      }
    }

    // collision, calculate normal of collided surface
    if (xEntry > yEntry) {
      if (xInvEntry < 0) {
        hit.normal.x = 1;
        hit.normal.y = 0;
      } else if (xInvEntry > 0) {
        hit.normal.x = -1;
        hit.normal.y = 0;
      } else {
        if (vx < 0) {
          hit.normal.x = 1;
          hit.normal.y = 0;
        } else if (vx > 0) {
          hit.normal.x = -1;
          hit.normal.y = 0;
        }
      }
    } else if (xEntry < yEntry) {
      if (yInvEntry < 0) {
        hit.normal.x = 0;
        hit.normal.y = 1;
      } else if (yInvEntry > 0) {
        hit.normal.x = 0;
        hit.normal.y = -1;
      } else {
        if (vy < 0) {
          hit.normal.x = 0;
          hit.normal.y = 1;
        } else if (vy > 0) {
          hit.normal.x = 0;
          hit.normal.y = -1;
        }
      }
    } else {
      hit.normal.x = 0;
      hit.normal.y = 0;
      hit.bothAxisCollide = true;
    }
    hit.time = entryTime;
    return hit;
  }

  /**
   * Updates the provided AABB with the provided velocity values.
   * @param {AABB} broadphaseAABB
   * @param {Phaser.Math.Vector2|object} velocity
   */
  static updateSweptBroadphaseAABB(broadphaseAABB:AABB, velocity:Phaser.Math.Vector2|any) {
    // update the velocity because when it is too small, (tile or entity) collisions might not be detected
    let vx = velocity.x;
    if (vx > 0 && vx < 1) {
      vx = 1;
    } else if (vx < 0 && vx > -1) {
      vx = -1;
    }
    let vy = velocity.y;
    if (vy > 0 && vy < 1) {
      vy = 1;
    } else if (vy < 0 && vy > -1) {
      vy = -1;
    }

    broadphaseAABB.x = vx > 0 ? broadphaseAABB.x : broadphaseAABB.x + vx;
    broadphaseAABB.y = vy > 0 ? broadphaseAABB.y : broadphaseAABB.y + vy;

    broadphaseAABB.width = vx > 0 ? broadphaseAABB.width + vx : broadphaseAABB.width - vx;
    broadphaseAABB.height = vy > 0 ? broadphaseAABB.height + vy : broadphaseAABB.height - vy;

    broadphaseAABB.left = vx > 0 ? broadphaseAABB.left : broadphaseAABB.left + vx;
    broadphaseAABB.top = vy > 0 ? broadphaseAABB.top : broadphaseAABB.top + vy;
    broadphaseAABB.right = vx > 0 ? broadphaseAABB.right + vx : broadphaseAABB.right;
    broadphaseAABB.bottom = vy > 0 ? broadphaseAABB.bottom + vy : broadphaseAABB.bottom;
  }

  static isCollisionIgnored(inst:any, normal:any) : boolean {
    const obj = inst.object;
    if (inst.type === 'entity') {
      const cbounds = obj.collisionBounds;
      if ((normal.x < 0 && !cbounds.left) || (normal.x > 0 && !cbounds.right)
        || (normal.y < 0 && !cbounds.top) || (normal.y > 0 && !cbounds.bottom)) {
        return true;
      }
    }
    return false;
  }

  static getEntityCollisions(aabb:AABB, velocity:Phaser.Math.Vector2|any, scene:Phaser.Scene, includeDynamic:boolean, includeStatic:boolean) : any {
    // Note: The below was commented out because an entity would "slip" through the left side of a collision entity
    // because the overlap rectangle did not correct register it.
    let w = velocity.x > 0 || velocity.x < 0 ? aabb.width : aabb.width;// (aabb.right - aabb.left);
    // let h = velocity.y > 0 || velocity.y < 0 ? aabb.height : (aabb.bottom - aabb.top);
    let h = aabb.bottom - aabb.top;

    return scene.physics.overlapRect(aabb.x, aabb.y, w, h, includeDynamic, includeStatic);
  }

  /**
   *
   * @param listIn
   * @param collisionListIn
   * @param isEntity
   * @param entityId the id of the entity that has called this method
   */
  static addToCollisionList(listIn:any, collisionListIn:any, isEntity:boolean, entityId:number) {
    for (let i = 0; i < listIn.length; i++) {
      const inst = listIn[i];
      let type = '';
      let object = null;

      if (isEntity) {
        const gameObject:any = inst.gameObject;
        // need to ignore instances that are passengers
        if (gameObject.isEntity && gameObject.id !== entityId && gameObject.isSolid() && (!gameObject.aboard || (gameObject.aboard && gameObject.aboard.id !== entityId))) {
          type = 'entity';
          object = gameObject;
        }
      } else if (!isEntity) {
        type = 'tile';
        object = inst;
      }
      if (object) {
        collisionListIn.push({
          type: type,
          object: object
        });
      }
    }
  }
}