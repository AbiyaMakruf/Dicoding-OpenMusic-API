class PlaylistsSongsHandler {
  constructor(service, validator, serviceActivities) {
    this._service = service;
    this._validator = validator;
    this._serviceActivities = serviceActivities;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistsSongsHandler = this.getPlaylistsSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._validator.validatePlaylistSongPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.verifySongId(songId);
    await this._service.addSongToPlaylist(playlistId, songId);
    await this._serviceActivities.addActivities({
      playlistId, songId, credentialId, action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);
    return response;
  }

  async getPlaylistsSongsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsFromPlaylist(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });

    response.code(200);
    return response;
  }

  async deletePlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._validator.validatePlaylistSongPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.verifySongId(songId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    await this._serviceActivities.addActivities({
      playlistId, songId, credentialId, action: 'delete',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistsSongsHandler;
