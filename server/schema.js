// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from "graphql-tools";
import { v1 as neo4j } from "neo4j-driver";
import fs from "fs";

// Construct a schema, using GraphQL schema language
const typeDefs = "" + fs.readFileSync("./schema.graphql", "utf8");

const executeQueryAll = (query, name, args, context) => {
  console.log(query);
  let session = context.driver.session();
  return session.run(query, args).then(result => {
    return result.records.map(record => {
      return record.get(name).properties;
    });
  });
};

const executeQueryOne = (query, name, args, context) => {
  return executeQueryAll(query, name, args, context).then(res => res[0]);
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    meetupsByName: (root, args, context) => {
      const query =
        "MATCH (meetup:Meetup) WHERE meetup.name CONTAINS $name RETURN meetup LIMIT $first;";
      return executeQueryAll(query, "meetup", args, context);
    },
    membersByName: (root, args, context) => {
      const query = "MATCH (user:User) WHERE user.name = $name RETURN user";
      return executeQueryAll(query, "user", args, context);
    }
  },
  Meetup: {
    tags: (meetup, _, context) => {
      return context.loaders.tagsByMeetup.load(meetup.name);
    },

    members: (meetup, _, context) => {
      return context.loaders.membersByMeetup.load(meetup.name);
    },
    events: (meetup, _, context) => {
      return context.loaders.eventsByMeetup.load(meetup.name);
    }
  },
  User: {
    meetups: (user, _, context) => {
      return context.loaders.meetupsByUser.load(user.name);
    },
    events: (user, _, context) => {
      return context.loaders.eventsByUser.load(user.name);
    }
  },
  Tag: {
    meetups: (tag, _, context) => {
      return context.loaders.meetupsByTag.load(tag.id);
    }
  },
  Event: {
    partecipants: (event, _, context) => {
      return context.loaders.partecipantsByEvent.load(event.id);
    },
    meetup: (event, _, context) => {
      return context.loaders.meetupByEvent.load(event.id);
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

export function context(headers, secrets, loaders) {
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
    driver,
    loaders: loaders(driver)
  };
}
