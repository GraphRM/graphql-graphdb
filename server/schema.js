// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from "graphql-tools";
import { v1 as neo4j } from "neo4j-driver";
import fs from "fs";

// Construct a schema, using GraphQL schema language
const typeDefs = "" + fs.readFileSync("./schema.graphql", "utf8");

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    meetupsByName: (root, args, context) => {
      let session = context.driver.session();
      let query =
        "MATCH (meetup:Meetup) WHERE meetup.name CONTAINS $name RETURN meetup LIMIT $first;";
      return session.run(query, args).then(result => {
        return result.records.map(record => {
          return record.get("meetup").properties;
        });
      });
    },
    membersByName: (root, args, context) => {
      let session = context.driver.session();
      let query = "MATCH (user:User) WHERE user.name = $name RETURN user";
      return session.run(query, args).then(result => {
        return result.records.map(record => {
          return record.get("user").properties;
        });
      });
    }
  },
  Meetup: {
    tags: (meetup, _, context) => {
      let session = context.driver.session();
      let params = { name: meetup.name };
      let query = `
        MATCH (m:Meetup {name : $name})-[:TAGGED]->(t:Tag)
        RETURN t
        `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("t").properties;
        });
      });
    },

    members: (meetup, _, context) => {
      let session = context.driver.session();
      let params = { name: meetup.name };
      let query = `
        MATCH (m:Meetup {name : $name})<-[:JOINED]-(u:User)
        RETURN u
        `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("u").properties;
        });
      });
    },
    events: (meetup, _, context) => {
      let session = context.driver.session();
      let params = { name: meetup.name };
      let query = `
        MATCH (m:Meetup {name : $name})-[:HAS_EVENT]->(e:Event)
        RETURN e
        `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("e").properties;
        });
      });
    }
  },
  User: {
    meetups: (user, _, context) => {
      let session = context.driver.session();
      let params = { name: user.name };
      let query = `
      MATCH (u:User {name : $name})-[:JOINED]->(m:Meetup)
      RETURN m
      `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("m").properties;
        });
      });
    },
    events: (user, _, context) => {
      let session = context.driver.session();
      let params = { name: user.name };
      let query = `
      MATCH (u:User {name : $name})-[:PARTICIPATED]->(e:Event)
      RETURN e
      `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("e").properties;
        });
      });
    }
  },
  Tag: {
    meetups: (tag, _, context) => {
      let session = context.driver.session();
      let params = { id: tag.id };
      let query = `
      MATCH (t:Tag {id : $id})<-[:TAGGED]-(m:Meetup)
      RETURN m
      `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("m").properties;
        });
      });
    }
  },
  Event: {
    partecipants: (event, _, context) => {
      let session = context.driver.session();
      let params = { id: event.id };
      let query = `
      MATCH (e:Event {id : $id})<-[:PARTICIPATED]-(u:User)
      RETURN u
      `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("u").properties;
        });
      });
    },
    meetup: (event, _, context) => {
      let session = context.driver.session();
      let params = { id: event.id };
      let query = `
      MATCH (e:Event {id : $id})<-[:HAS_EVENT]-(m:Meetup)
      RETURN m
      `;
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
