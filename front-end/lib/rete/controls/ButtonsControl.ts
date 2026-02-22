import { ClassicPreset } from "rete";
import type { Btn } from "../nodes";

export class ButtonsControl extends ClassicPreset.Control {
  public parent: any = null;
  public buttons: Btn[];
  public id: string;

  constructor(initial: Btn[] = []) {
    super();
    this.buttons = initial;
    this.id = 'buttons-control';
  }

  getButtons() {
    return this.buttons;
  }

  setButtons(next: Btn[]) {
    this.buttons = next;
  }
}