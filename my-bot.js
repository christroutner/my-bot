/*
  A custom bot program made from combining several examples.
*/

const mineflayer = require("mineflayer");

const { pathfinder, Movements } = require("mineflayer-pathfinder");
const {
  GoalNear,
  GoalBlock,
  GoalXZ,
  GoalY,
  GoalInvert,
  GoalFollow
} = require("mineflayer-pathfinder").goals;

// Instantiate the bot.
const bot = mineflayer.createBot({
  host: process.env.SERVER, // optional
  port: 25565, // optional
  username: process.env.USERNAME, // email and password are required only for
  password: process.env.PASSWORD, // online-mode=true servers
  version: false, // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
  auth: "microsoft" // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
});

// Load plugins
bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  // Once we've spawn, it is safe to access mcData because we know the version
  const mcData = require("minecraft-data")(bot.version);

  // We create different movement generators for different type of activity
  const defaultMove = new Movements(bot, mcData);

  bot.on("path_update", r => {
    const nodesPerTick = ((r.visitedNodes * 50) / r.time).toFixed(2);
    console.log(
      `I can get there in ${
        r.path.length
      } moves. Computation took ${r.time.toFixed(2)} ms (${
        r.visitedNodes
      } nodes, ${nodesPerTick} nodes/tick)`
    );
  });

  bot.on("goal_reached", goal => {
    console.log("Here I am !");
  });

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;

    const target = bot.players[username] ? bot.players[username].entity : null;

    // COME command
    if (message === "come") {
      if (!target) {
        bot.chat("I don't see you !");
        return;
      }
      const p = target.position;

      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1));

      // GOTO command
    } else if (message.startsWith("goto")) {
      const cmd = message.split(" ");

      if (cmd.length === 4) {
        // goto x y z
        const x = parseInt(cmd[1], 10);
        const y = parseInt(cmd[2], 10);
        const z = parseInt(cmd[3], 10);

        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalBlock(x, y, z));
      } else if (cmd.length === 3) {
        // goto x z
        const x = parseInt(cmd[1], 10);
        const z = parseInt(cmd[2], 10);

        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalXZ(x, z));
      } else if (cmd.length === 2) {
        // goto y
        const y = parseInt(cmd[1], 10);

        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalY(y));
      }

    // FOLLOW command
    } else if (message === "follow") {
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalFollow(target, 3), true);
      // follow is a dynamic goal: setGoal(goal, dynamic=true)
      // when reached, the goal will stay active and will not
      // emit an event

    // AVOID command
    } else if (message === "avoid") {
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(target, 5)), true);

    // STOP (following) command
    } else if (message === "stop") {
      bot.pathfinder.setGoal(null);
    }
  });
});
