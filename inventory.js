/*
  A library for working with inventory
*/

let _this;

class Inventory {
  constructor(config) {
    this.bot = config.bot;

    _this = this;
  }

  // This is the handler that is called when the bot detects an 'inv' command.
  handleInventory(cmd) {
    try {
      const invCmd = cmd[1];

      if (invCmd === "list") {
        this.sayItems();
      } else if (invCmd === "toss") {
        this.tossItem(cmd);
      } else if (invCmd === "equip") {
        this.equipItem(cmd);
      }
    } catch (err) {
      console.error("Error in handleInventory: ", err);
      _this.bot.chat(`Error trying to handle 'inv' command.`);
    }
  }

  // async equipItem (name, destination) {
  async equipItem(cmd) {
    try {
      const name = cmd[2];
      const item = _this.itemByName(name);
      const destination = "hand";

      if (item) {
        try {
          await _this.bot.equip(item, destination);
          _this.bot.chat(`equipped ${name}`);
        } catch (err) {
          _this.bot.chat(`cannot equip ${name}: ${err.message}`);
        }
      } else {
        _this.bot.chat(`I have no ${name}`);
      }
    } catch (err) {
      console.log("Error in equipItem: ", err);
      _this.bot.chat(`Error trying to equipItem()`);
    }
  }

  tossItem(cmd) {
    try {
      const amount = 1;
      const name = cmd[2];
      const item = _this.itemByName(name);

      if (!item) {
        _this.bot.chat(`I have no ${name}`);
      } else if (amount) {
        _this.bot.toss(item.type, null, amount, checkIfTossed);
      } else {
        _this.bot.tossStack(item, checkIfTossed);
      }

      function checkIfTossed(err) {
        if (err) {
          _this.bot.chat(`unable to toss: ${err.message}`);
        } else if (amount) {
          _this.bot.chat(`tossed ${amount} x ${name}`);
        } else {
          _this.bot.chat(`tossed ${name}`);
        }
      }
    } catch (err) {
      console.error("Error in tossItem: ", err);
      _this.bot.chat(`Error trying to tossItem()`);
    }
  }

  itemByName(name) {
    return _this.bot.inventory.items().filter(item => item.name === name)[0];
  }

  sayItems(items = _this.bot.inventory.items()) {
    const output = items.map(_this.itemToString).join(", ");
    if (output) {
      _this.bot.chat(output);
    } else {
      _this.bot.chat("empty");
    }
  }

  itemToString(item) {
    if (item) {
      return `${item.name} x ${item.count}`;
    } else {
      return "(nothing)";
    }
  }
}

module.exports = Inventory;
