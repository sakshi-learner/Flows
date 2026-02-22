import { ClassicPreset } from "rete";

export class TextControl extends ClassicPreset.Control {
  public id: string;
  constructor(public value: string) {
    super();
     this.id = 'text-control';
  }
  
  getValue() {
    return this.value;
  }

  setValue(val: string) {
    this.value = val;
  }
}