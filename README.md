### GraphQL ❤️ GraphDB

Questo repository contiene un esempio di come integrare GraphQL con una graph database (in questo caso Neo4J).

Come database di riferimento per questo talk abbiamo usato quello presente [in questo repository](https://github.com/GraphRM/workshop-neo4j-docker): avviate il database prima di iniziare con questo tutorial. 

Il codice qui presente è il complemento del talk seguente (date un'occhiata per una introduzione anche a GraphQL):

* [`GraphQL ❤️ GraphDB`](https://www.slideshare.net/GraphRM/graphql-graphdb)

Ci sono 3 branch principali in questo repository che, in modo progressivo, mostrano come migliorare l'integrazione tra i due strumenti.

* `master` contiene una prima implementazione naïve di GraphQL (basata unicamente sugli `Hello world` online)
* `dataloader` contiene una versione migliorata di `master` in cui viene adottato uno strumento per fare caching e migliorare le prestazioni del web server GraphQL.
* `single-query` contiene l'apice del miglioramento, in cui per una singola query GraphQL corrisponde una sola query del GraphDB.

### Setup

Il seguente repository contiene un web server generato in NodeJS: questo è un pre-requisito per iniziare il setup.

Per iniziare con il progetto potete entrare nella cartella `server` ed installare i pacchetti richiesti:

```sh
$ cd server
$ npm install
```

Una volta installato il necessario possiamo avviare il server:

```sh
$ npm start
```

### Branch `master`

Sul branch `master` viene mostrata una integrazione basilare tra GraphQL e Neo4J: una volta avviato il progetto, procedere su GraphiQL ed eseguire la seguente query:

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

### Branch `dataloader`

Sul branch `datalaoder` (il precedente) si parte da `master` e si aggiunge il file `loader.js`: questo file contiene la logica per i nostri loader, ovvero un meccanismo di caching che permette al server di evitare query duplicate, riducendo sensibilmente il tempo di esecuzione di ciascuna query GraphQL.

Per verificarne l'efficacia provate a riavviare il server ed eseguire nuovamente la seguente query:

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

Nel terminale vedrete che il numero di query eseguite è leggermente inferiore rispetto a prima, ed anche il tempo di risposta del server è migliorata sensibilmente.

Questo approccio con caching funziona molto bene e permette di ridurre sensibilmente l'impatto di ciascuna query sul server. Come tutte le situazioni di query, c'è da considerare il caso di cache invalidation (non presente in questo talk) in cui per ciascuna GraphQL mutation (modifica dei dati all'interno della base di dati) il relativo `id` deve essere rimosso dalla cache `dataloader`.

Per vedere migliorare ulteriormente le prestazioni del nostro web server andare sul branch `single-query`:

```sh
// spengere il server
$ git checkout single-query
$ npm start
```

### Branch `single-query`

Sul branch `single-query` (il corrente) si parte nuovamente da `master` cambiando approccio rispetto a `dataloader`: questa volta adotteremo un adapter vendor-specific che partendo dall'AST della query GraphQL, dallo schema GraphQL tradurrà da GraphQL ad una query specifica per il database.

Notare che il file `schema.graphql` in questo caso è cambiato, in particolare notare la nuova notazione `@relation`: si tratta di una estensione di GraphQL specifica per Neo4J con cui l'adapter viene "aiutato" a capire che quel determinato attributo necessita la navigazione di una relazione (arco/edge) per poter raccogliere i dati di interesse.

Per verificarne l'efficacia provate a riavviare il server ed eseguire nuovamente la seguente query:

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

Nel terminale vedrete che il numero di query questa volta è pari a 1. Niente più query multiple: abbiamo raggiunto il mapping 1:1 tra GraphQL ed un GraphDB.

Questo approccio è ancora in fase di sviluppo, come spiegato nella presentazione, non ancora pronto per il rilascio in produzione.
Nonostante il suo stato ancora iniziale, con un supporto parziale di GraphQL (mancanza del support per `Enum`, etc...), per casi molto semplici di pura navigazione del grafo l'approccio con la notazione `@relation` è molto pratico e conveniente da usare.
