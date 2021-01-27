export const MathUtils = {
  Angle: {
    /**
     * Adds value to the provided angle and returns the result
     * @param {number} angle
     * @param {number} value
     */
    add: function(angle:number, value:number) : number {
      let deg = angle + value;
      if (deg > 359) {
        deg -= 359;
      } else if (deg < 0) {
        deg += 359;
      }
      return deg;
    },
    /**
     * Returns x position of circle with the provided length (radius)
     * @param len
     * @param angle in radians
     * @return {number}
     */
    lengthDirX: function(len:number, angle:number) : number {
      return Math.cos(angle) * len;
    },
    /**
     * Returns y position of circle with the provided length (radius)
     * @param len
     * @param angle in radians
     * @return {number}
     */
    lengthDirY: function(len:number, angle:number) : number {
      return Math.sin(angle) * len;
    }
  }
};