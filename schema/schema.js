const User = require('../models/User')
const Store = require('../models/Store')
const graphql = require('graphql')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
require('dotenv').config();

const { GraphQLObjectType , GraphQLInt, GraphQLString , GraphQLSchema , GraphQLList, GraphQLNonNull } = graphql
const { authenticateFacebook, authenticateGoogle } = require('./passport');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


const UserType = new GraphQLObjectType({
    name: "UserType",
    description: "Documentation for User",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        email : { type : GraphQLString},
        password : { type : GraphQLString},
        
        storage: {
            type: new GraphQLList(StorageType),
            resolve(parent, args){
                return Store.find({userId: parent.id})
            }
        }
    })
})

const StorageType = new GraphQLObjectType({
    name: "StoreType",
    description: "Documentation for Storage",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        userId: {type: new GraphQLNonNull(GraphQLString)},
        imageurl: {type: GraphQLString},        
        
        user: {
            type: UserType,
            resolve(parent, args){
                return Store.find({id: parent.userId})
            }
        }
    })
})

const TokenType = new GraphQLObjectType({
  name: "TokenType",
  description: "Documentation for Tokens for users",
  fields: () => ({
      token: { type: new GraphQLNonNull(GraphQLString)}
  })
})


const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    description: "Documentation for Root query",
    fields: {

        user: {
            type: UserType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.findById(args.id)
            }
        },

        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return User.find({})
            }
        },

        picture: {
            type: StorageType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parent,args){
                return Store.findById(args.id)
            }
        },
        pictures: {
            type: new GraphQLList(StorageType),
            resolve(parent,args){
                return Store.find({})
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    description: "Documentation for Mutation",
    fields: {
        createUser: {
            type: UserType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent,args){
                const user = new User({
                    name: args.name,
                    email: args.email,
                    password: args.password
                })
                user.save()
                return user
            }
        },
        login: {
          type: TokenType,
          args: {
            email: {type: new GraphQLNonNull(GraphQLString)},
            password: {type: new GraphQLNonNull(GraphQLString)}
          },
          resolve: async (parent,args) => {
            const user = await User.findOne({where: args.email});
            if(!user){
              throw new Error('User not found');
            }
            const validatePassword = await user.validatePassword(args.password)
            if(!validatePassword) {
              throw new Error('Password is incorrect');
            }
            return {
              token : user.getJwtToken(),
            }
          },
        },
        uploadImage: {
          type: StorageType,
          args: {
            fileurl: {type: new GraphQLNonNull(GraphQLString)},
          },
          resolve: async (parent,args,{me}) => {          
            try{
              const photo = await cloudinary.v2.uploader.upload(args.fileurl);
              await Store.update({
                imageurl: `${photo.public_id}.${photo.format}` 
              }, {
                where: { userId: me.id }
              });
              return `${photo.public_id}.${photo.format}`
            }
            catch(error){
              throw new Error(error);
            }     
        }
      },
        /*authFacebook: async (_, { input: { accessToken } }, { req, res }) => {
            req.body = {
              ...req.body,
              access_token: accessToken,
            };
      
            try {
              const { data, info } = await authenticateFacebook(req, res);
      
              if (data) {
                const user = await User.upsertFbUser(data);
        
                if (user) {
                  return ({
                    name: user.name,
                    token: user.generateJWT(),
                  });
                }
              }
      
              if (info) {
                console.log(info);
                switch (info.code) {
                  case 'ETIMEDOUT':
                    return (new Error('Failed to reach Facebook: Try Again'));
                  default:
                    return (new Error('something went wrong'));
                }
              }
              return (Error('server error'));
            } catch (error) {
              return error;
            }
          },
          authGoogle: async (_, { input: { accessToken } }, { req, res }) => {
            req.body = {
              ...req.body,
              access_token: accessToken,
            };
      
            try {
              const { data, info } = await authenticateGoogle(req, res);
      
              if (data) {
                const user = await User.upsertGoogleUser(data);
      
                if (user) {
                  return ({
                    name: user.name,
                    token: user.generateJWT(),
                  });
                }
              }
      
              if (info) {
                console.log(info);
                switch (info.code) {
                  case 'ETIMEDOUT':
                    return (new Error('Failed to reach Google: Try Again'));
                  default:
                    return (new Error('something went wrong'));
                }
              }
              return (Error('server error'));
            } catch (error) {
              return error;
            }
          },*/
    }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation : Mutation
})