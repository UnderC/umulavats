const events = require('events')
const fetch = require('node-fetch')
const Song = require('./song')

class Server extends events.EventEmitter {
  constructor (gID, client) {
    super()
    this.gID = gID
    this.player = null
    this.player = null
    this.skipSafe = false
    this.volume = 50
    this.repeat = false
    this.random = false
    this.playing = false
    this.currentSong = null
    this.songs = []
    this.client = client
  }

  async _ (channel) {
    if (!channel) return this.emit('notChannel')
    if (this.player) return this.emit('alreadyJoined')
    this.player = this.client.player.join(
      {
        guild: this.gID,
        channel: channel.id,
        host: this.client.player.nodes.first().host
      },
      { selfdeaf: false, selfmute: false }
    )
  }

  clear () {
    this.songs = []
  }

  seek (sec) {
    this.player.seek(sec * 1000 + this.player.state.position)
  }

  start () {
    if (!this.player) return
    if (!this.player.playing) this.play(this.songs.shift())
  }

  play (song) {
    if (!this.player || !song) return this.stop()
    if (this.repeat) this.songs.push(song)
    this.emit('playing', song)
    this.playing = true
    this.currentSong = song
    this.player.play(this.currentSong.track)
    this.player.volume(this.volume)

    this.player.on('end', dat => {
      this.playing = false
      if (this.skipSafe) {
        this.skipSafe = false
        return this.stop()
      } else if (dat.reason === 'REPLACED') return

      this.play(this.songs.shift())
    })

    this.player.on('error', err => {
      console.log(err)
      this.skip()
    })
  }

  pause () {
    if (this.player) this.player.pause(!this.player.paused)
  }

  fix (channel) {
    if (!channel) return
    if (this.currentSong) this.songs = [this.currentSong].concat(this.songs)
    this.playing = false
    this.stop()
    this._(channel)
    this.start()
  }

  skip () {
    if (this.player) this.player.stop()
  }

  stop (cb) {
    if (this.player) {
      this.client.player.leave(this.gID)
      delete this.player
    }

    if (cb) cb()
  }

  setVolume (vol) {
    this.emit('changeVol', this.volume, vol)
    this.volume = vol
    if (this.player) this.player.volume(vol)
  }

  add (song, isMyList) {
    const _s = new Song(song)
    if (!isMyList) this.emit('addSong', _s)
    this.songs.push(_s)
  }

  getSongs (query) {
    const node = this.client.player.nodes.first()
    const params = new URLSearchParams()
    params.append('identifier', query)
    return fetch(
      `http://${node.host}:${node.port}/loadtracks?${params.toString()}`,
      { headers: { Authorization: node.password } }
    )
      .then(res => res.json())
      .then(data => data.tracks)
      .catch(console.error)
  }
}

module.exports = Server
