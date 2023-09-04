/* eslint-disable camelcase */

exports.up = (pgm) => {
  // membuat table playlists_songs
  pgm.createTable('playlists_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // memberikan constraint foreign key pada kolom playlist_id dan song_id
  // terhadap playlists.id dan songs.id
  pgm.addConstraint('playlists_songs', 'fk_playlists_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlists_songs', 'fk_playlists_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus tabel playlists_songs
  pgm.dropTable('playlists_songs');
};
