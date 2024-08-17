/*
 * What's better than a bot that knows how to read and understands art?
 *
 * Learn how easy it is to interact with signs and paintings in this example.
 *
 * You can send commands to this bot using chat messages, the bot will
 * reply by telling you the name of the nearest painting or the text written on
 * the nearest sign, and you can also update signs with custom messages!
*
* To update a sign simply send a message in this format: write [your message]
*/
const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')

const bot = mineflayer.createBot({
  host:'localhost',
  port: 9999,
  username: 'viewer',
})


// funny just to keep
// function init_view_locations(){
//   bot.chat("finding signs in chunk")

//   const signs = [];
//   const chunk = bot.world.getColumnAt(bot.entity.position)

//   if (!chunk) {
//     bot.chat("chunk is not loaded")
//     return signs;
//   }

//   bot.chat("loaded chunk")

//   //chunk data is not synced with world position


//   for (let y = 0; y < 80; y++) {
//     for (let z = 0; z < 16; z++) {
//       for (let x = 0; x < 16; x++) {
//         const block = chunk.getBlock(new Vec3(x, y, z));

//         if (block && isSignBlock(block)) {
//           bot.chat(block.position)
//           signs.push(
//             {
//               block_obj: block,
//               position: new Vec3(x, y, z),
//             }
//           );
//         }
//       }
//     }
//   }

//   signs.forEach(element => {
//     bot.chat(`The sign says: ${element.block_obj.getSignText()} loc at ${element.position}`)
//   });

//   return signs;
// }

function isSignBlock(block) {
  return block.name.endsWith('sign');
}

function watchPaintingOrSign () {
  const paintingBlock = bot.findBlock({
    matching (block) {
      return !!block.painting
    }
  })

  const signBlock = bot.findBlock({
    matching: ['oak_sign'].map(name => bot.registry.blocksByName[name].id)
  })


  if (signBlock) {
    signBlock.forEach(element => {
      bot.chat(`The sign says: ${element.getSignText()}`)
    });
  } else if (paintingBlock) {
    bot.chat(`The painting is: ${paintingBlock.painting.name}`)
  } else {
    bot.chat('There are no signs or paintings near me')
  }
}

function updateSign (message) {
  const signBlock = bot.findBlock({
    matching: ['painting', 'sign'].map(name => bot.registry.blocksByName[name].id)
  })
  if (signBlock) {
    bot.updateSign(signBlock, message.split(' ').slice(1).join(' '))
    bot.chat('Sign updated')
  } else {
    bot.chat('There are no signs near me')
  }
}




const tags = {};
function cleanText(text) {
  // Split the text at the first space and return the first part

  return text.split('\n')[0];
}






bot.once('spawn', async () =>{
  await bot.waitForChunksToLoad()


  mineflayerViewer(bot, { port: 3007, firstPerson: true })
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

