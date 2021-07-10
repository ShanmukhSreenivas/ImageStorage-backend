const User = require('../models/User')
const Store = require('../models/Store')
const graphql = require('graphql')
const path = require('path')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
require('dotenv').config();

const { GraphQLObjectType , GraphQLInt, GraphQLString , GraphQLSchema , GraphQLList, GraphQLNonNull } = graphql

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
          resolve: async (parent,args,req) => {          
             if(!req.isAuth){
              throw new Error("Unauthenticated!")
            }
            const mainDir = path.dirname(require.main.filename);
            filename = `${mainDir}/uploads/${args.fileurl}`;
            try{
              const photo = await cloudinary.uploader.upload(filename);
              await Store.Update({
                userId: req.userId,
                imageurl: `${photo.public_id}.${photo.format}` 
              }, {
                where: { userId: req.userId }
              });
              return {
                userId: req.userId,
                imageurl: `${photo.public_id}.${photo.format}`
              }
            }
            catch(error){
              throw new Error(error);
            }     
        }
      },
    }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation : Mutation
})