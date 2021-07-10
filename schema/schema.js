const User = require('../models/User')
const Store = require('../models/Store')
const graphql = require('graphql')
const path = require('path')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
require('dotenv').config();
const { authenticateFacebook, authenticateGoogle } = require('./passport')

const { GraphQLObjectType ,GraphQLInputObjectType, GraphQLInt, GraphQLString , GraphQLSchema , GraphQLList, GraphQLNonNull } = graphql

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
    name: "StorageType",
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
      userId: { type: new GraphQLNonNull(GraphQLString)},
      token: { type: new GraphQLNonNull(GraphQLString)}
  })
})

const AuthInputType = new GraphQLInputObjectType({
  name: "AuthInputType",
  description: "Documentation for Tokens for users",
  fields: () => ({
      accessToken: { type: new GraphQLNonNull(GraphQLString)}
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
        },
        login: {
          type: TokenType,
          args: {
            email: {type: new GraphQLNonNull(GraphQLString)},
            password: {type: new GraphQLNonNull(GraphQLString)}
          },
          resolve: async (parent,args) => {
            const user = await User.findOne({email: args.email});
            if(!user){
              throw new Error('User not found');
            }
            const validatePassword = await user.validatePassword(args.password)
            if(!validatePassword) {
              throw new Error('Password is incorrect');
            }
            return {
              userId: user.id,
              token: user.getJwtToken(),
            }
          },
        },
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
        uploadImage: {
          type: StorageType,
          args: {
            fileurl: {type: new GraphQLNonNull(GraphQLString)},
          },
          resolve: async (args, req) => {          
             if(!req.isAuth){
              throw new Error("Unauthenticated!")
            }
            const mainDir = path.dirname(require.main.filename);
            filename = `${mainDir}/uploads/${args.fileurl}`;
            try{
              const photo = await cloudinary.uploader.upload(filename);
              const store = new Store({
                userId: req.userId,
                imageurl: `${photo.public_id}.${photo.format}`,
           })
            store.save()
            return store
            }
            catch(error){
              throw new Error(error);
            }     
        }
      },
      authFacebook: {
        type: TokenType,
        args: {
          input: {
            type: new GraphQLNonNull(AuthInputType)
          }
        },      
        resolve: async (_, { input }, { req, res }) => {
        
          req.body = {
           ...req.body, 
            access_token: input.accessToken,
          };
     
          try {
            // data contains the accessToken, refreshToken and profile from passport
            const { data, info } = await authenticateFacebook(req, res);
    
            if (data) {
              const user = await User.upsertFbUser(data);
      
              if (user) {
                return ({
                  userId: user.id,
                  token: user.getJwtToken(),
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
        }
    },
      authGoogle: { 
        type: TokenType,
        args: {
          input: {
            type: new GraphQLNonNull(AuthInputType)
          }
        },      
        resolve: async (_, { input }, { req, res }) => {
          req.body = {
            ...req.body, 
             access_token: input.accessToken,
           };
    
        try {
          // data contains the accessToken, refreshToken and profile from passport
          const { data, info } = await authenticateGoogle(req, res);
  
          if (data) {
            const user = await User.upsertGoogleUser(data);
  
            if (user) {
              return ({
                userId: user.id,
                token: user.getJwtToken(),
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
      }
      }
    },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation : Mutation
})