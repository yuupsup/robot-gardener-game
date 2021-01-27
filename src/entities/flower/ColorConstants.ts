export const ColorConstants = {
  Color: {
    NONE: -1,
    RED: 0,
    PURPLE: 1,
    BLUE: 2,
    GREEN: 3,
    YELLOW: 4,
    ORANGE: 5,
    WHITE: 6
  },
  isColor: function(color:number) : boolean {
    return color !== ColorConstants.Color.NONE;
  }
};