class MessageNode {
  constructor(node) {
    this.node = node;
  }

  async execute({ state, input }) {
    // button click case
    if (input?.buttonId) {
      const btn = this.node.buttons.find(b => b.id === input.buttonId);
      if (btn?.next) {
        return { nextNodeId: btn.next };
      }
    }

    // normal message
    return {
      output: {
        type: "text",
        text: this.node.text,
        buttons: this.node.buttons.map(b => ({
          id: b.id,
          label: b.label
        }))
      },
      nextNodeId: this.node.next
    };
  }
}

module.exports = MessageNode;
