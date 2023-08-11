//Server
require('dotenv').config();
const Hapi = require('@hapi/hapi');

//Albums
const albums = require('./api/albums');
//const AlbumsService = require('./services/inMemory/AlbumsService');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

//Songs
const songs = require('./api/songs');
//const SongsService = require('./services/inMemory/SongsService');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async() => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();

    const server = Hapi.server({
        host : process.env.HOST,
        port : process.env.PORT,
    });

    await server.register([
        {
            plugin : albums,
            options: {
                service : albumsService,
                validator: AlbumsValidator,
            }
        },
        {
            plugin : songs,
            options: {
                service : songsService,
                validator: SongsValidator,
            }
        },
    ]);
    

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`)
};

init();