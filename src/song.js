const ytdl = require('ytdl-core')
class Song {
  constructor (inf) {
    this.url = inf.info.uri
		this.title = inf.info.title
		this.author = inf.info.author
    this.length = inf.info.length / 1000
    this.vID = inf.info.identifier
    this.track = inf.track
    ytdl.getBasicInfo(this.url).then(inf => {
      this.thumbnail = inf.player_response.videoDetails.thumbnail.thumbnails[3].url
    })
  }
}

module.exports = Song
