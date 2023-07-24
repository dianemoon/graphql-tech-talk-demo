//REQUIREMENTS ---------------------------------------------------------------------
//Requires to use express routing. 
const express = require('express');
//Required to create our endpoint. 
const { graphqlHTTP } = require('express-graphql');

const {
  //Required to create a schema 
  GraphQLSchema, 
  //Required to create custom Object types.
  GraphQLObjectType, 
  //Required to define string, list, int, and non-null types for fields.
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');

//Invoke express to create our app. 
const app = express();

//Declare a PORT number.
const PORT = 3000;

//OUR SAMPLE DATA -----------------------------------------------------------------
//Sample Users Data
const users = [
  { id: 1, name: 'Diane' },
  { id: 2, name: 'Lydia' },
  { id: 3, name: 'Ben'}
]

//Sample Pets Data
const pets = [
  { id: 1, name: 'Gary', species: 'dog', userId: 1 },
  { id: 2, name: 'Ashley', species: 'cat', userId: 1 },
  { id: 3, name: 'Rolex', species: 'hamster', userId: 1 },
  { id: 4, name: 'Sprite', species: 'fish', userId: 1 },
  { id: 5, name: 'Tokyo', species: 'cat', userId: 2 }, 
  { id: 6, name:'Odie', species: 'dog', userId: 2 }, 
  { id: 7, name: 'Juliette', species: 'hamster', userId: 3 },
  { id: 8, name: 'Michelle', species: 'hamster', userId: 3 }
]

// Custom Types ---------------------------------------------------------------------
//Custom PetType type. 
const PetType = new GraphQLObjectType({
  name: 'Pet',
  description: 'This represents a pet owned by a user.',
  fields: () => ({
    id: {type: GraphQLNonNull(GraphQLInt)},
    name: { type: GraphQLString },
    species: {type: GraphQLNonNull(GraphQLString) },
    userId: {type: GraphQLNonNull(GraphQLInt)}, 
    user: {
      type: UserType,
      resolve: (pet) => {
        return users.find(user => user.id === pet.userId)
      },
    }
  })
})

//Custom UserType type.
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'This represents an user who owns pets.',
  fields: () => ({
    id: {type: GraphQLNonNull(GraphQLInt)},
    name: { type: GraphQLNonNull(GraphQLString) },
    pets: {
      type: new GraphQLList(PetType),
      resolve: (user) => {
        return pets.filter(pet => pet.userId === user.id)
      }
    }
  })
})

// READ functionality ------------------------------------------------------------------
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    //Get 1 pet. 
    pet: {
      type: PetType, 
      description: 'A single pet',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => pets.find(pet => pet.id === args.id)
    },

    //Get all pets.
    pets: {
      type: GraphQLList(PetType),
      description: 'List of Pets',
      resolve: () => pets
    },

    //Get 1 user by id.
    user: {
      type: UserType,
      description: "A single user",
      args: {
        id: {type: GraphQLInt}
      },
      resolve: (parent, args) => users.find(user => user.id === args.id)
    },

    //Get all users.
    users: {
      type: new GraphQLList(UserType),
      description: 'List of All Users',
      resolve: () => users
    }
  })
})

// CREATE functionality ------------------------------------------------------------------
//Handles mutations. 
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addPet: {
      type: PetType,
      description: 'Add a pet',
      args: {
        name: { type: GraphQLString },
        species: {type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLInt) }
      }, 
      resolve: (parent, args) => {
        const pet = { id: pets.length + 1, name: args.name, species: args.species, userId: args.userId};
        pets.push(pet);
        return pet;
      }
    }, 
    addUser: {
      type: UserType,
      description: 'Add a user',
      args: {
        name: { type: GraphQLNonNull(GraphQLString)},
      }, 
      resolve: (parent, args) => {
        const user = { id: users.length + 1, name: args.name};
        users.push(user);
        return user;
      }
    }
  })
})

//SCHEMA (groups our Query and Mutation) -------------------------------------------------
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})


//Our GraphQL endpoint.  -----------------------------------------------------------------
app.use('/graphql', graphqlHTTP({
  schema: schema,
  //GraphiQL gives us a UI to access our GraphQL. 
  //With GraphQL, we don't need to type and create manual calls to Postman. 
  graphiql: true
}));

//Run the server on PORT. ----------------------------------------------------------------
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
