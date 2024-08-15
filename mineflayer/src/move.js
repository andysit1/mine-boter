// This is an example that uses mineflayer-pathfinder to showcase how simple it is to walk to goal
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const { pid } = require('process')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { Vec3 } = require('vec3')


const bot = mineflayer.createBot({
  host: "localhost",
  port: "9999",
  username: 'gps1',
})

const RANGE_GOAL = 1 // get within this radius of the player

bot.loadPlugin(pathfinder)





function findSweetSpot () {
  const block = bot.blockAtCursor()

  if (!block) {
    return bot.chat('Looking at Air')
  }

  bot.chat(`Looking at ${block.displayName}`)

  findAndMinePumpkins()
}

async function look_pumpkin (){
  await bot.look(-1.5708, 0.59, true)
  await bot.setControlState('forward', true)
  await bot.waitForTicks(60)
}

async function dig_at_cursor(){
  for (var i = 0; i < 3; i++){
    block = bot.blockAtCursor(4)
    if (block){
      await bot.dig(block, 'ignore', 'raycast')
    }
  }
}

function againstWall(){
  var prev_loc = 0;
  bot.setControlState('forward', true)
  while (bot.entity.position != prev_loc){
    prev_loc = bot.entity.position
  }
  bot.clearControlStates()
}


function findSignsAndText(){
  const sign = bot.findBlocks({
    matching: bot.registry.blocksByName.sign.id,
    maxDistance: 32,
    count: 100
  });

}

function findRedCarpet(){

  const red_carpet = bot.findBlocks({
    matching: bot.registry.blocksByName.red_carpet.id,
    maxDistance: 32,
    count: 100
  });


  if (red_carpet.length == 0){
    bot.chat('No red carpet found nearby.')
    return;
  }

  const redcarpet = red_carpet[0];
  bot.chat('Found a carpet! Heading there now.');
  bot.pathfinder.setGoal(new GoalNear(redcarpet.x + .9, redcarpet.y, redcarpet.z, 0));

  bot.once('goal_reached', async () => {
    bot.chat("reached the carpet. Looking for best angle...")

    await look_pumpkin()
    await dig_at_cursor()

  })
}

function findBestMiningDirection(pumpkinPos) {
  // Calculate potential mining directions (e.g., front, back, left, right, top)
  const directions = [
    { position: pumpkinPos.offset(1, 0, 0), yaw: 90 },  // Right
    { position: pumpkinPos.offset(-1, 0, 0), yaw: 270 }, // Left
    { position: pumpkinPos.offset(0, 0, 1), yaw: 180 },  // Back
    { position: pumpkinPos.offset(0, 0, -1), yaw: 0 },   // Front
    { position: pumpkinPos.offset(0, 1, 0), pitch: -45 }, // Above
  ];

  let bestDirection = null;
  let maxPumpkins = 0;

  directions.forEach(direction => {
    const pumpkinsInDirection = getPumpkinsInDirection(pumpkinPos, direction.position);
    if (pumpkinsInDirection > maxPumpkins) {
      maxPumpkins = pumpkinsInDirection;
      bestDirection = direction;
    }
  });

  return bestDirection;
}

function getPumpkinsInDirection(startPos, directionPos) {
  // Example logic to count pumpkins in a line of sight
  let count = 0;
  let currentPos = startPos.clone();

  while (true) {
    currentPos = currentPos.add(directionPos);
    const block = bot.blockAt(currentPos);

    if (block && block.name === 'pumpkin') {
      count++;
    } else {
      break;
    }
  }

  return count;
}


function findAndMinePumpkins() {
  const pumpkins = bot.findBlocks({
    matching: bot.registry.blocksByName.pumpkin.id,
    maxDistance: 32,
    count: 100
  });

  if (pumpkins.length === 0) {
    bot.chat('No pumpkins found nearby.');
    return;
  }

}


bot.on('chat', async (username, message) => {
  if (username === bot.username) return

  if (message === 'loaded') {
    console.log(bot.entity.position)
    await bot.waitForChunksToLoad()
    bot.chat('Ready!')
  }


  if (message.startsWith('find')) {
    const name = message.split(' ')[1]
    if (bot.registry.blocksByName[name] === undefined) {
      bot.chat(`${name} is not a block name`)
      return
    }
    const ids = [bot.registry.blocksByName[name].id]

    const startTime = performance.now()
    const blocks = bot.findBlocks({ matching: ids, maxDistance: 128, count: 10 })
    const time = (performance.now() - startTime).toFixed(2)

    bot.chat(`I found ${blocks.length} ${name} blocks in ${time} ms`)
  }
})



bot.on('chat', async (username, message) => {

  if (message == 'dig'){
    //dig 3
    await dig_at_cursor()
  }

  if (message == 'walk'){
    await bot.look(-1.5708, 0.72, true)
    await bot.setControlState('forward', true)
  }

  if (message == 'stop'){
    bot.clearControlStates()
  }
})


bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: false })
  const defaultMove = new Movements(bot)
  bot.on('chat', (username, message) => {


    if (username === bot.username) return
    if (message == 'ray'){
      bot.chat("trying to look...")
      findSweetSpot()
    }

    if (message == 'me'){
      const target = bot.players[username]?.entity
      if (!target) {
        bot.chat("I don't see you !")
        return
      }
      const { x: playerX, y: playerY, z: playerZ } = target.position

      bot.pathfinder.setMovements(defaultMove)
      bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
    }


    if (username === bot.username) return
    if (message !== 'come') return


    findRedCarpet()


  })
})

bot.on('kicked', console.log)
bot.on('error', console.log)