const Boom = require('boom');
const perSeatPostModel = require('.././models/per-seat-post');
const db = require('../../config/db');
const all = {
  async: async function (request, reply) {
    try {
      const data = await perSeatPostModel.find({});
      if(data === null || data === undefined) reply([]).code(404);
      else  reply(data).code(200);
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
};
const search = {
  async: async function (request, reply) {
    try {
      const data = await perSeatPostModel.find({
          'trip.startPlace' : request.params.start,
          status : true
      },{isBlocked:0,__v:0,isSuccess:0,status:0});
      if(data === null || data === undefined) reply([]).code(404);
      else  {
        reply(data).code(200);
      }
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
};
const create = {
  async: async function (request, reply) {
    try {
      const perSeatPost = new perSeatPostModel(request.payload);
      perSeatPost.serial = await perSeatPostModel.find({}).count() + 1;
      const data =  await perSeatPost.save();
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
      const data =  await perSeatPostModel.find({_id : request.params._id});
      if(data === null || data === undefined) reply({}).code(404);
      else  reply(data).code(200);
    } catch (err) {
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
}

const update = {
  async : async function(request,reply){
    try{
     const data =  await perSeatPostModel.update({serial : request.params.serial},request.payload);
     if(data === null || data === undefined)reply({}).code(404);
     else reply({}).code(204)
    }catch(err){
      reply(Boom.badRequest(err.toString())),code(400);
    }
  }
}

const destroy = {
  async : async function(request,reply){
    try{
      const data = await perSeatPostModel.remove({serial : request.params.serial});
      if(data == null || data === undefined)reply({}).code(404);
      else reply({}).code(200);
    }catch(err){
      reply(Boom.badRequest(err.toString())).code(400);
    }
  }
}

//Socket
async function socketCreate(server,serial,params) {
  try {
    console.log("params", params);
    const perSeatPost = new perSeatPostModel(params);
    perSeatPost.passengers = perSeatPost.passengers || [];
    perSeatPost.perSeatPrice = 0;
    perSeatPost.serial = await perSeatPostModel.find({}).count() + 1;
    const data =  await perSeatPost.save();
    if(data === null || data === undefined) return 404;
    else  return data;
  } catch (err) {
    return err;
  }
}

async function socketAddPassenger(server,data){
    try{
      console.log("params",data.buySeat)
      let user = JSON.parse(data.user);
      let post = JSON.parse(data.post);
      user.isCanceled = false;
      //console.log("user",user)
      //post.passengers.push(user);
      if(data.buySeat <= post.availableCapacity){
        post.availableCapacity = post.availableCapacity - data.buySeat;
      }
     const res =  await perSeatPostModel.findOneAndUpdate({_id : post._id},{$set : {availableCapacity : post.availableCapacity},
       $push : {"passengers" :{
         _id : user._id,
         phone : user.phone,
         name : user.name,
         email : user.email,
         seatBought : data.buySeat,
         source : post.source,
         destination : post.destination,
         boughtDate : new Date(),
         totalPrice :  data.buySeat * post.cost,
         isCanceled : false
       }}},
      {upsert:true, new : true});
     if(res === null || res === undefined)return 404;
     else return res;
    }catch(err){
      return err;
    }
}
module.exports = {
    all,
    search,
    create,
    byId,
    update,
    destroy,
    socketCreate,
    socketAddPassenger
}
