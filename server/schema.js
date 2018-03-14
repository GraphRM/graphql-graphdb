// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from "graphql-tools";
import { v1 as neo4j } from "neo4j-driver";
import {neo4jgraphql} from 'neo4j-graphql-js';
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
    meetupsByName: (object, params, ctx, resolveInfo) => neo4jgraphql(object, params, ctx, resolveInfo),
    membersByName: (object, params, ctx, resolveInfo) => neo4jgraphql(object, params, ctx, resolveInfo)
  },
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
    headers
  };
}
