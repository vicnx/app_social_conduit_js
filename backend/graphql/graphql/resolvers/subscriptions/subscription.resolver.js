const mongoose = require('mongoose');
const Subscription = mongoose.model('Subscription');
const User = mongoose.model('User');
var auth  = require("../../../routes/auth")

const request = require("../../../routes/api/requests")
//const City = mongoose.model('City');



const resolvers = {
    Query: {
      subscription: (root, {slug}) => {
        return Subscription.findOne({slug: slug}).exec();
      },
      subscriptions: async (root, {limit, offset, user}) =>  {
        //si le pasamos user (email) recoge el ID del usuario y lo filtra.
        if(user){
          let usuario = await get_user_id(user)
          return Subscription.find({'user':usuario._id}).skip(offset).limit(limit).exec();
        }else{
          //si no le pasamos user los muestra todos
          return Subscription.find().skip(offset).limit(limit).exec();
        }
        
      },
      subscriptionsCount: async (root,{user}) => {
        if(user){
          let usuario = await get_user_id(user)
          return Subscription.find({'user':usuario._id}).count().exec();
        }else{
          return Subscription.count().exec();
        }

      }
    },
    Mutation: {
      createSubscription: async (root, {input}) => {
        console.log(input);
          console.log(await request.get_all_yuks());
          let user = await request.get_user_by_username(input.username);
          console.log(user);
          input.user= await get_user_id(user.profile.email);
          // let subscription = new Subscription(input);
          // await subscription.save();
          // return subscription;
      },
      deleteSubscription: async (parent, { input }) => {
        var ok = Boolean(input);
        var sub = await Subscription.findOne({slug: input.slug});
        if(sub == null){
          ok = false;
          // return {false};
        }else{
          Subscription.find({slug: input.slug}).remove().exec()
        }
        
        return { ok };
      },
    },
    //per a obtindre el user de cada sub
    Subscription: {
      user: (parent) => {
          return User.findOne({_id: parent.user}).exec();
      }
    }
};
//funcion para obtener el ID de un usuario por email
async function get_user_id(email){
  var user = await User.findOne({'email':email});
  return user;
}
module.exports = resolvers;