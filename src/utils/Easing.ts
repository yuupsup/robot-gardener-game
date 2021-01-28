export const Easing = {
  linear: function(t:number) {
    return t;
  },

  easeInOutSine: function(t:number) {
    return (-0.5 * (Math.cos(Math.PI * t) - 1));
  },

  /**
   * @param {number} t
   * @return {number}
   */
  // accelerating from zero velocity
  easeInQuad: function(t:number) : number {
    return t * t;
  },

  /**
   * @param {number} t
   * @return {number}
   */
  // decelerating to zero velocity
  easeOutQuad: function(t:number) : number {
    return t * (2 - t);
  },

  easeInExpo: function(t:number) : number {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
  },

  easeOutExpo: function(t:number) : number {
    return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
  },

  // decelerating to zero velocity
  easeOutCubic: function(t:number) : number {
    return --t * t * t + 1;
  }
};