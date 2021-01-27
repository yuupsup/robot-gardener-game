import {ColorConstants} from "../../flower/ColorConstants";

export default class TodoItem {
  colors:Array<any>;
  colorMix:string;

  constructor(...colors) {
    this.colors = new Array<any>();
    this.colorMix = "";

    for (let i = 0; i < colors.length; i++) {
      const c = colors[i];
      const char = ColorConstants.getColorCharacter(c);
      this.colors.push({
        color: c,
        character: char
      });
      this.colorMix += char; // append the character
    }
  }

  getMix() : string {
    return this.colorMix;
  }
}