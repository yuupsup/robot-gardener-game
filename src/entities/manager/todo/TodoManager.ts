/**
 * Manages the flower combinations needed to complete the level
 */
import TodoItem from "./TodoItem";

export default class TodoManager {
  items:Array<TodoItem>;
  index:number;
  constructor() {
    this.items = new Array<TodoItem>();
    this.index = 0;
  }

  get() : string {
    if (this.items.length === 0) {
      return "";
    }
    const todo = this.items[this.index];
    return todo.getMix();
  }

  hasNext() {
    return (this.index + 1) < this.items.length;
  }

  next() {
    this.index++;
  }

  add(...colors) {
    this.items.push(new TodoItem(...colors));
  }

  clear() {
    this.items = [];
  }
}