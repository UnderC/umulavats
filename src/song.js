class Song {
  constructor (inf) {
    this.url = inf.info.url
		this.title = inf.info.title
		this.author = inf.info.author
    this.length = inf.info.length / 1000
    this.vID = inf.info.identifier
    this.track = inf.track
  }
}

module.exports = Song
