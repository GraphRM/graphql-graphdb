### GraphQL ❤️ GraphDB

Questo repository contiene un esempio di come integrare GraphQL con una graph database (in questo caso Neo4J).

Il codice qui presente è il complemento del talk seguente (date un'occhiata per una introduzione anche a GraphQL):

* [`GraphQL ❤️ GraphDB`]()

Ci sono 3 branch principali in questo repository che, in modo progressivo, mostrano come migliorare l'integrazione tra i due strumenti.

* `master` contiene una prima implementazione naïve di GraphQL (basata unicamente sugli `Hello world` online)
* `dataloader` contiene una versione migliorata di `master` in cui viene adottato uno strumento per fare caching e migliorare le prestazioni del web server GraphQL.
* `single-query` contiene l'apice del miglioramento, in cui per una singola query GraphQL corrisponde una sola query del GraphDB.

### Branch `master`

Sul branch master (il corrente) viene mostrata una integrazione basilare tra GraphQL e Neo4J: una volta avviato il progetto, procedere su GraphiQL ed eseguire la seguente query:

```graphql
{
  meetupsByName(name:"GraphRM") {
    id
    name
    link
    members {
        name
    }
  }
}
```

Nel terminale vedrete una moltitudine di query eseguire per la risoluzione dei vari membri del meetup.

Questo approccio naïve funziona ma ha un alto costo prestazionale da pagare - in particolare il problema della `N+1 query`.
Per vedere una metodologia per migliorare le prestazioni su questo fronte andare sul branch `dataloader`:

```sh
// spengere il server
$ git checkout dataloader
$ npm start
```

Cliccate [qui]() per continuare a leggere...