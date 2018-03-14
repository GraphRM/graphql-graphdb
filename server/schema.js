// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from "graphql-tools";
import { v1 as neo4j } from "neo4j-driver";
import fs from "fs";

// Construct a schema, using GraphQL schema language
const typeDefs = "" + fs.readFileSync("./schema.graphql", "utf8");

const executeQuery = (query, name, args, context) => {
  console.log(query);
  let session = context.driver.session();
  return session.run(query, args).then(result => {
    return result.records.map(record => {
      return record.get(name).properties;
    });
  }); 
}

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    meetupsByName: (root, args, context) => {
      const query =
        "MATCH (meetup:Meetup) WHERE meetup.name CONTAINS $name RETURN meetup LIMIT $first;";
      return executeQuery(query, "meetup", args, context);
    },
    membersByName: (root, args, context) => {
      const query = "MATCH (user:User) WHERE user.name = $name RETURN user";
      return executeQuery(query, "user", args, context);
    }
  },
  Meetup: {
    tags: (meetup, _, context) => {
      const params = { name: meetup.name };
      const query = `
        MATCH (m:Meetup {name : $name})-[:TAGGED]->(t:Tag)
        RETURN t
        `;
      return executeQuery(query, "t", params, context);
    },

    members: (meetup, _, context) => {
      const params = { name: meetup.name };
      const query = `
        MATCH (m:Meetup {name : $name})<-[:JOINED]-(u:User)
        RETURN u
        `;
      return executeQuery(query, "u", params, context);
    },
    events: (meetup, _, context) => {
      const params = { name: meetup.name };
      const query = `
        MATCH (m:Meetup {name : $name})-[:HAS_EVENT]->(e:Event)
        RETURN e
        `;
      return executeQuery(query, "u", params, context);
    }
  },
  User: {
    meetups: (user, _, context) => {
      const params = { name: user.name };
      const query = `
      MATCH (u:User {name : $name})-[:JOINED]->(m:Meetup)
      RETURN m
      `;
      return executeQuery(query, "m", params, context);
    },
    events: (user, _, context) => {
      const params = { name: user.name };
      const query = `
      MATCH (u:User {name : $name})-[:PARTICIPATED]->(e:Event)
      RETURN e
      `;
      return executeQuery(query, "e", params, context);
    }
  },
  Tag: {
    meetups: (tag, _, context) => {
      const params = { id: tag.id };
      const query = `
      MATCH (t:Tag {id : $id})<-[:TAGGED]-(m:Meetup)
      RETURN m
      `;
      return executeQuery(query, "m", params, context);
    }
  },
  Event: {
    partecipants: (event, _, context) => {
      const params = { id: event.id };
      const query = `
      MATCH (e:Event {id : $id})<-[:PARTICIPATED]-(u:User)
      RETURN u
      `;
      return executeQuery(query, "u", params, context);
    },
    meetup: (event, _, context) => {
      let session = context.driver.session();
      let params = { id: event.id };
      let query = `
      MATCH (e:Event {id : $id})<-[:HAS_EVENT]-(m:Meetup)
      RETURN m
      `;
      console.log(query);
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("m").properties;
        })[0];
      });
    }
  }
};

// Required: Export the GraphQL.js schema object as "schema"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Optional: Export a function to get context from the request. It accepts two
// parameters - headers (lowercased http headers) and secrets (secrets defined
// in secrets section). It must return an object (or a promise resolving to it).
let driver;

export function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      secrets.NEO4J_URI || "bolt://localhost:7687",
      neo4j.auth.basic(
        secrets.NEO4J_USER || "neo4j",
        secrets.NEO4J_PASSWORD || "graphrm"
      )
    );
  }
  return {
    driver
  };
}
