// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from 'graphql-tools';
import {v1 as neo4j} from 'neo4j-driver';
import fs from 'fs';

// Construct a schema, using GraphQL schema language
const typeDefs = '' + fs.readFileSync('./schema.graphql', 'utf8');

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    meetupsByName: (root, args, context) => {
      let session = context.driver.session();
      let query = "MATCH (meetup:Meetup) WHERE meetup.name CONTAINS $name RETURN meetup LIMIT $first;"
      return session.run(query, args)
        .then( result => { return result.records.map(record => { return record.get("meetup").properties })})
    },
    userByName : (root,args,context) => {
      let session = context.driver.session();
      let query = "MATCH (user:User) WHERE user.name = $name RETURN user"
      return session.run(query, args)
        .then( result => { 
          return result.records.map(record => { return record.get("user").properties })[0]})
    }
  },
  Meetup: {
    similar: (meetup, _, context) => {
      let session = context.driver.session();
      let params = {id: meetup.id};
      let query = `
				MATCH (meetup:Meetup) WHERE meetup.id = $id
        MATCH (meetup:Meetup)-[:TAGGED]->(tag:Tag)<-[:TAGGED]-(newMeetup:Meetup)
        WITH meetup, newMeetup, COUNT(*) AS topicOverlap
        RETURN newMeetup
        ORDER BY topicOverlap
        DESC LIMIT 3
			`;
      
      return session.run(query, params)
      	.then( result => {return result.records.map(record => {return record.get("newMeetup").properties})})
    }
  }
  
};

// Required: Export the GraphQL.js schema object as "schema"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Optional: Export a function to get context from the request. It accepts two
// parameters - headers (lowercased http headers) and secrets (secrets defined
// in secrets section). It must return an object (or a promise resolving to it).
let driver;

export function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(secrets.NEO4J_URI || "bolt://localhost:7687", neo4j.auth.basic(secrets.NEO4J_USER || "neo4j", secrets.NEO4J_PASSWORD || "graphrm"))
  }
  return {
    driver
  }
};
