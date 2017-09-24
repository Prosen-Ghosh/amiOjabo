const Boom = require('boom');
const cityModel = require('.././models/city');
const db = require('../../config/db');
const all = {
  async: async function (request, reply) {
    try {
      console.info('test controoler');
      const data = await cityModel.find({});
      if(data === null || data === undefined) reply([]).code(404);
      else  reply(data).code(200);
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
};
const create = {
  async: async function (request, reply) {
    try {
      const city = new cityModel(request.payload);
      const data =  await city.save();
      if(data === null || data === undefined) reply({}).code(404);
      else  reply(data).code(201);
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
};

const byId = {
  async: async function (request, reply) {
    try {
      const data =  await cityModel.find({cityId : request.params.id});
      if(data === null || data === undefined) reply({}).code(404);
      else  reply(data).code(200);
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
}
module.exports = {
    all,
    create,
    byId
}