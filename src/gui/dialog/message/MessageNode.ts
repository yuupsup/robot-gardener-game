import GraphNode from "../../../ds/GraphNode";

export default class MessageNode extends GraphNode {
  message:string;
  confirm:boolean;
  onYes:any|null;
  onNo:any|null; // callbacks for when the user selects "Yes" or "No" from the dialog

  onStart:any|null;
  onEnd:any|null; // callbacks for the start of the message and the end of the message
  auto:boolean; // when the message is done, this node will automatically cause the dialog message box to continue
  clearMessageOnNextUpdate:boolean;

  proceedOnUserAction:boolean; // proceeds to the next message from user actions only

  constructor(name) {
    super(name);
    this.message = "";
    this.confirm = false;
    this.onYes = null;
    this.onNo = null; // callbacks for when the user selects "Yes" or "No" from the dialog

    this.onStart = null;
    this.onEnd = null; // callbacks for the start of the message and the end of the message
    this.auto = false; // when the message is done, this node will automatically cause the dialog message box to continue
    this.clearMessageOnNextUpdate = false; // informs the message box to clear the message on the next update after the message has been displayed

    this.proceedOnUserAction = true;
  }

  getMessage() : string {
    return this.message;
  }

  setMessage(msg:string) : MessageNode {
    this.message = msg;
    return this;
  }

  setProceedOnUserAction(value:boolean) : MessageNode {
    if (value !== undefined) {
      this.proceedOnUserAction = value;
    }
    return this;
  }

  setAuto(value:boolean) : MessageNode {
    if (value !== undefined) {
      this.auto = value;
    }
    return this;
  }

  /**
   * @returns {boolean}
   */
  isConfirm() : boolean {
    return this.confirm;
  }

  /**
   * @param value {boolean}
   */
  setConfirm(value:boolean) {
    this.confirm = value;
  }

  /**
   * @returns {boolean}
   */
  hasOnYes() : boolean {
    return this.onYes !== null;
  }

  /**
   * @returns {boolean}
   */
  hasOnNo() : boolean {
    return this.onNo !== null;
  }

  /**
   * Assign the callback function for "Yes"
   * @param func represents the function to assign as the callback function
   * @param thisArg represents the context to call the function
   */
  setOnYes(func:any, thisArg:any = null) {
    if (func) {
      if (thisArg) {
        this.onYes = (function(func, thisArg) {
          return function() {
            func.call(thisArg);
          }
        })(func, thisArg)
      } else {
        this.onYes = func;
      }
    }
  }

  /**
   * Assign the callback function for "No"
   * @param func represents the function to assign as the callback function
   * @param thisArg represents the context to call the function
   */
  setOnNo(func:any, thisArg:any = null) {
    if (func) {
      if (thisArg) {
        this.onNo = (function(func, thisArg) {
          return function() {
            func.call(thisArg);
          }
        })(func, thisArg)
      } else {
        this.onNo = func;
      }
    }
  }

  callYes() {
    if (this.onYes) {
      this.onYes();
    }
  }

  callNo() {
    if (this.onNo) {
      this.onNo();
    }
  }

  isAuto() : boolean {
    return this.auto;
  }

  /**
   * Assign the callback function for the start of the message
   * @param func represents the function to assign as the callback function
   * @param thisArg represents the context to call the function
   */
  setOnStart(func:any, thisArg:any = null) {
    if (func) {
      if (thisArg) {
        this.onStart = (function(func, thisArg) {
          return function() {
            func.call(thisArg);
          }
        })(func, thisArg)
      } else {
        this.onStart = func;
      }
    }
    return this;
  }

  /**
   * Assign the callback function for the end of the message
   * @param func represents the function to assign as the callback function
   * @param thisArg represents the context to call the function
   */
  setOnEnd(func:any, thisArg:any = null) {
    if (func) {
      if (thisArg) {
        this.onEnd = (function(func, thisArg) {
          return function() {
            func.call(thisArg);
          }
        })(func, thisArg)
      } else {
        this.onEnd = func;
      }
    }
    return this;
  }

  callStart() {
    if (this.onStart) {
      this.onStart();
    }
  }

  callEnd() {
    if (this.onEnd) {
      this.onEnd();
    }
  }
}