import MessageNode from "./MessageNode";
import DirectedGraph from "../../../ds/DirectedGraph";

export default class MessageGraph extends DirectedGraph {
  owner:any;
  head:MessageNode|null;
  currentNode:MessageNode|null;

  /**
   * @param owner represents the creator of the messages.
   */
  constructor(owner = null) {
    super();
    this.owner = owner

    this.head = null; // represents the start node of the graph
    this.currentNode = null;
  }

  isEmpty() : boolean {
    return this.head === null;
  }

  getOwner() : any {
    return this.owner;
  }

  getCurrent() : MessageNode|null {
    return this.currentNode;
  }

  /**
   * Check the current node to see if there are any more 'out' nodes.
   * @returns {Boolean}
   */
  hasNext() :boolean {
    if (this.currentNode === null) {
      return false;
    }
    const node = this.currentNode.getNext();
    return node !== null;
  }

  next() {
    if (this.currentNode && this.hasNext()) {
      this.currentNode = this.currentNode.getNext() as MessageNode;
    }
  }

  /**
   *
   * @param {MessageNode} messageNode
   */
  addNode(messageNode:MessageNode) {
    super.addNode(messageNode);

    if (this.head === null) {
      this.head = messageNode;
      this.currentNode = this.head;
    }
  }

  resetIterator() {
    this.currentNode = this.head;
  }
}