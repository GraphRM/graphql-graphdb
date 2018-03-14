import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
// Dataloader
import loaders from './loaders'

import { schema, rootValue, context } from './schema';
debugger;

const PORT = 3000;
const server = express();

server.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
  schema,
  rootValue,
  context: context(request.headers, process.env, loaders),
})));

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  query: `# Welcome to GraphiQL
  {
    meetupsByName(name:"GraphRM") {
      id
      name
      link
      members {
        name
        events {
          name
        }
      }
    }
  }
`,
}));

server.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}/graphql`);
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});
