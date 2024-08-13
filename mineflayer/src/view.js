/*
 *
 * A simple bot demo https://github.com/PrismarineJS/prismarine-viewer
 * Start it then open your browser to http://localhost:3007 and enjoy the view
 *
 */

const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer


const bot = mineflayer.createBot({
  host: 'localhost',
  port: '3000',
  username:'viewer',
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})




