const mineflayer = require('mineflayer')
const repl = require('repl')


const bot = mineflayer.createBot({
  host: 'localhost',
  port: '3000',
  username : 'a'
})

bot.on('login', () => {
  const r = repl.start('> ')
  r.context.bot = bot

  r.on('exit', () => {
    bot.end()
  })

  

})