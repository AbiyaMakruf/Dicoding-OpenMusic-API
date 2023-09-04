class PlaylistSongActivitiesHandler {
  constructor(service) {
    this._service = service;

    this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
  }

  async getPlaylistSongActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistId(playlistId);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistSongActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongActivitiesHandler;
