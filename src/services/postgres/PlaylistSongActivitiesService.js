const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities({
    playlistId, songId, credentialId: userId, action,
  }) {
    const id = `playlist-song-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT playlist_song_activities.id, users.username, songs.title, songs.performer, playlist_song_activities.action, playlist_song_activities.time
            FROM playlist_song_activities
            LEFT JOIN users ON users.id = playlist_song_activities.user_id
            LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
            WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
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

  async verifyPlaylistId(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongActivitiesService;
