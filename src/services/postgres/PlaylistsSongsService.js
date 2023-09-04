const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username 
            FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    const playlists = resultPlaylist.rows[0];

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer 
            FROM songs 
            LEFT JOIN playlists_songs ON playlists_songs.song_id = songs.id
            WHERE playlists_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);
    const songs = resultSongs.rows;

    playlists.songs = songs;

    return playlists;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlists_songs WHERE
            song_id = $1 AND playlist_id = $2 RETURNING id`,
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    return result.rows[0].id;
  }

  async verifyPlaylistAccess(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const queryCollaboration = {
      text: 'SELECT user_id FROM collaborations WHERE playlist_id = $1',
      values: [id],
    };

    const resultCollaboration = await this._pool.query(queryCollaboration);

    if (resultCollaboration.rows[0] !== undefined) {
      if (resultCollaboration.rows[0].user_id !== owner) {
        if (result.rows[0].owner !== owner) {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
      }
    } else if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifySongId(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsService;
