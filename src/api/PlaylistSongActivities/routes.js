const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getPlaylistSongActivitiesHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
