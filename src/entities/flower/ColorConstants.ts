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
  },
  getColorCharacter(color:number) : string {
    switch (color) {
      case ColorConstants.Color.RED: return "R";
      case ColorConstants.Color.YELLOW: return "Y";
      case ColorConstants.Color.BLUE: return "B";
      case ColorConstants.Color.PURPLE: return "P";
      case ColorConstants.Color.ORANGE: return "O";
      case ColorConstants.Color.GREEN: return "G";
      case ColorConstants.Color.WHITE: return "W";
    }
    return "";
  }
};