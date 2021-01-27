import {ColorConstants} from "./ColorConstants";

export default class ColorManager {
  colorCombo:Map<string, number>
  constructor() {
    this.colorCombo = new Map<string, number>();

    // clone
    this.colorCombo.set("RR", ColorConstants.Color.RED);
    this.colorCombo.set("YY", ColorConstants.Color.YELLOW);
    this.colorCombo.set("BB", ColorConstants.Color.BLUE);

    this.colorCombo.set("PP", ColorConstants.Color.PURPLE);
    this.colorCombo.set("OO", ColorConstants.Color.ORANGE);
    this.colorCombo.set("GG", ColorConstants.Color.GREEN);

    this.colorCombo.set("WW", ColorConstants.Color.WHITE);

    // mix
    this.colorCombo.set("RB", ColorConstants.Color.PURPLE);
    this.colorCombo.set("RY", ColorConstants.Color.ORANGE);
    this.colorCombo.set("YB", ColorConstants.Color.GREEN);

    // subtractive
    // white MUST be between other two colors
    this.colorCombo.set("PWR", ColorConstants.Color.BLUE);
    this.colorCombo.set("PWB", ColorConstants.Color.RED);

    this.colorCombo.set("OWR", ColorConstants.Color.YELLOW);
    this.colorCombo.set("OWY", ColorConstants.Color.RED);

    this.colorCombo.set("GWB", ColorConstants.Color.YELLOW);
    this.colorCombo.set("GWY", ColorConstants.Color.BLUE);
  }

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

  /**
   * @param colorA
   * @param colorB
   * @param isWhite the two colors are combined with white
   */
  getCombinedColor(colorA:number, colorB:number, isWhite:boolean) : number {
    const colorCharacters = this.getColorCharacter(colorA) + (isWhite ? "W" : "") + this.getColorCharacter(colorB);
    const colorCharactersReversed = this.getColorCharacter(colorB) + (isWhite ? "W" : "") + this.getColorCharacter(colorA);

    // check both character orders
    let color = ColorConstants.Color.NONE
    if (this.colorCombo.has(colorCharacters)) {
      color = this.colorCombo.get(colorCharacters);
    } else if (this.colorCombo.has(colorCharactersReversed)) {
      color = this.colorCombo.get(colorCharactersReversed);
    }
    return color;
  }
}