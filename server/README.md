# GraphQL server 

In questa cartella c'è tutto il contenuto per avviare un server GraphQL base.
Il server è composto di 3 componenti:

* `express` come web server
* `graphql-server-express` per la gestione delle query GraphQL (ricezione, validazione, etc...)
* `schema.graphql` dove è salvato lo schema che utilizzeremo

## Installazione

Si richiede un ambiente con NodeJS installato per far funzionare questo server GraphQL.

Come prima cosa installiamo le dipendenze del progetto:

```sh
$ npm install
```

Poi avviamo il server:

```sh
$ npm start
...
GraphQL Server is now running on http://localhost:3000/graphql
View GraphiQL at http://localhost:3000/graphiql
```

Ora aprite il browser su `http://localhost:3000/graphiql` ed iniziate a scrivere le vostre query GraphQL!

### Credits

Questo repository/talk è stato inspirato dai seguenti progetti:

* https://github.com/grand-stack/grand-stack-movies-workshop