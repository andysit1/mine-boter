"""
  send the minecraft bot view to vmix.
  https://github.com/PrismarineJS/prismarine-viewer/blob/master/examples/electron/index.js
  https://github.com/PrismarineJS/prismarine-viewer/blob/master/examples/python/receiver.py
  const mineflayer = require('mineflayer')
  const mineflayerViewer = require('prismarine-viewer').headless

  const bot = mineflayer.createBot({
    username: 'Bot'
  })

  const streamServer = 'cdg.contribute.live-video.net' // see https://help.twitch.tv/s/twitch-ingest-recommendation for list, choose the closest to you
  const streamKey = '' // your streaming key


  #instead send to vmix server
  bot.once('spawn', () => {
    mineflayerViewer(bot, { output: `rtmp://${streamServer}/app/${streamKey}`, width: 1280, height: 720, logFFMPEG: true })
    bot.setControlState('jump', true)
  })

  https://github.com/IceTank/mineflayer-panorama
"""
