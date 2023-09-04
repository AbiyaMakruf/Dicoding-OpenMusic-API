class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._validator.validateCollaborationsPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.verifyUserId(userId);
    await this._service.verifyPlaylistId(playlistId);
    const collaborationId = await this._service.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._validator.validateCollaborationsPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
