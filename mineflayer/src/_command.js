

// Create your bot
const mineflayer = require('mineflayer')


const bot = mineflayer.createBot({
  host: 'localhost',
  port: '9999',
  username: 'cmd_Bot',

})

// Load the cmd plugin
const cmd = require('mineflayer-cmd').plugin

const tags = {};
function cleanText(text) {
  return text.split('\n')[0];
}

cmd.allowConsoleInput = false // Optional config argument
bot.loadPlugin(cmd)

// Register your custom command handlers, if desired (plugins can load them too)
function sayCommand (sender, flags, args) {
  return new Promise((resolve, reject) => {
    let message = ''

    if (flags.showsender) message += sender + ': '
    if (flags.color) message += '&' + flags.color[0]

    message += args.join(' ')
    bot.chat(message)
    resolve()
  })
}


function goCommand(sender, flags, args){
  return new Promise((resolve, reject) => {
    let cmd_line = ''
    let message = ''

    // if (flags.move){
    // }

    message += args.join(' ')
    bot.chat(`/tp cmd_Bot ${Math.floor(tags[message].position.x)} ${Math.floor(tags[message].position.y)} ${Math.floor(tags[message].position.z)}`)
    resolve()
  })
}

bot.once('cmd_ready', () => {
  bot.cmd.registerCommand('say', sayCommand, // Create a new command called 'say' and set the executor function
    'make me say something', // help text
    'say <message>') // usage text

  // Add a flag called 'color' that expects 1 input
    .addFlag('color', 1, ['color code'], 'Changes the chat color')

  // Add a flag called 'showsender' that expects 0 inputs
    .addFlag('showsender', 0, [], 'If present, displays the sender who sent this message')

  bot.cmd.registerCommand('go', goCommand,
    'give the tag of sign to go to',
    'go <tag on sign>')


    // .addFlag('move', 1, ['move type'], 'decide the way we go to sign')

 })

// And listen for command inputs from any source
// Let's listen for chat events that start with "!"
bot.on('chat', (username, message) => {
  if (message.startsWith('!')) {
    const command = message.substring(1)
    bot.cmd.run(username, command) // Run with the sender and the command itself
  }
})


bot.once('spawn', async () =>{
  await bot.waitForChunksToLoad()


  bot.chat("chunk loaded starting process")

  //init find all blocks
  const cameraPositions = bot.findBlocks({
    matching: bot.registry.blocksByName.oak_sign.id,
    maxDistance: 50,
    count: 100, // Increase this if needed
  });

  bot.on('chat', (username, message) =>{
    if (username === bot.username) return

    if (message == "find"){
      cameraPositions.forEach(element => {
        let block = bot.world.getBlock(element)
        let sign_tag = cleanText(block.getSignText()[0])
        bot.chat(`The sign says: ${sign_tag} loc at ${block.position}`)
        console.log(sign_tag)

        tags[sign_tag] = block;
      });
    }

    if (message == "test"){
      bot.chat("testing")
      for (let key in tags) {
        console.log(`${key}=${tags[key]}`);
      }
    }

    switch (true) {
      case /^watch$/.test(message): //intresting use of regex
        const all_signs = init_view_locations();

        break
      case /^write .+$/.test(message):
        // write message
        // ex: write I love diamonds
        updateSign(message)
        break
    }
  })
})

