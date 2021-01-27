import Phaser from 'phaser';

export default class AABB {
  x:number;
  y:number;
  xoffset:number;
  yoffset:number;
  width:number;
  height:number;
  left:number;
  top:number;
  right:number;
  bottom:number;

  constructor(config:any) {
    this.x = (config.x || 0) - (config.xoffset || 0);
    this.y = (config.y || 0) - (config.yoffset || 0);
    this.xoffset = config.xoffset || 0;
    this.yoffset = config.yoffset || 0;
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.left = this.x;
    this.top = this.y;
    this.right = Math.max((this.left + this.width) - 1, 0);
    this.bottom = Math.max((this.top + this.height) - 1, 0);
  }

  static create(position:Phaser.Math.Vector2|any, offset:Phaser.Math.Vector2|any, width:number, height:number) : AABB {
    return new AABB({
      x: position.x || 0,
      y: position.y || 0,
      xoffset: offset.x || 0,
      yoffset: offset.y || 0,
      width: width || 0,
      height: height || 0
    });
  }

  /**
   * Creates a copy of an AABB instance.
   * @param {AABB} aabb
   */
  static createCopy(aabb:AABB) : AABB {
    let newAABB = AABB.create({}, {}, 0, 0);
    newAABB.copy(aabb);
    return newAABB;
  }

  update(position:Phaser.Math.Vector2|any) {
    this.x = position.x - this.xoffset;
    this.y = position.y - this.yoffset;
    this.left = this.x;
    this.top = this.y;
    this.right = (this.left + this.width) - 1;
    this.bottom = (this.top + this.height) - 1;
  }

  /**
   * Copies the properties from another AABB instance.
   * @param {AABB} aabb
   */
  copy(aabb:AABB) {
    this.x = aabb.x;
    this.y = aabb.y;
    this.xoffset = aabb.xoffset;
    this.yoffset = aabb.yoffset;
    this.left = aabb.left;
    this.top = aabb.top;
    this.right = aabb.right;
    this.bottom = aabb.bottom;
    this.width = aabb.width;
    this.height = aabb.height;
  }

  /**
   * Checks for an intersection between this and another AABB.
   * @param {AABB} other
   */
  isCollide(other:AABB) : boolean {
    const w = this.right - this.left;
    const h = this.bottom - this.top;
    const o_w = other.right - other.left;
    const o_h = other.bottom - other.top;

    let l = other.x - (this.x + w);   // left
    let t = (other.y + o_h) - this.y; // top
    let r = (other.x + o_w) - this.x;  // right
    let b = other.y - (this.y + h);  // bottom
    return !(l > 0 || r < 0 || t < 0 || b > 0);
  }
}