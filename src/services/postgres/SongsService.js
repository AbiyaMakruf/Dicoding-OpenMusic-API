const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration = null, albumId = null,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query;
    if (title !== undefined && performer !== undefined) {
      query = {
        text: 'SELECT id,title,performer FROM songs WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
    } else if (title !== undefined) {
      query = {
        text: 'SELECT id,title,performer FROM songs WHERE LOWER(title) LIKE $1',
        values: [`%${title}%`],
      };
    } else if (performer !== undefined) {
      query = {
        text: 'SELECT id,title,performer FROM songs WHERE LOWER(performer) LIKE $1',
        values: [`%${performer}%`],
      };
    } else {
      query = {
        text: 'SELECT id,title,performer FROM songs',
      };
    }
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration = null, albumId = null,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "album_id" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
