import DataLoader from 'dataloader';

export default driver => {

    const executeQuery = (query, name, args) => {
        console.log(query);
        let session = driver.session();
        return session.run(query, args)
        .then(result => {
          return result.records.map(record => {
            return record.get(name).properties;
          });
        }); 
      }

    const tagsByMeetup = new DataLoader(names => Promise.all(
        names.map( name => {
            const params = { name };
            const query = `
                MATCH (m:Meetup {name : $name})-[:TAGGED]->(t:Tag)
                RETURN t
                `;
            return executeQuery(query, "t", params);
        })
    ));

    const membersByMeetup = new DataLoader(names => Promise.all(
        names.map( name => {
            const params = { name };
            const query = `
                MATCH (m:Meetup {name : $name})<-[:JOINED]-(u:User)
                RETURN u
                `;
            return executeQuery(query, "u", params);
        })
    ));

    const eventsByMeetup = new DataLoader(names => Promise.all(
        names.map( name => {
            const params = { name };
            const query = `
                MATCH (m:Meetup {name : $name})-[:HAS_EVENT]->(e:Event)
                RETURN e
                `;
            return executeQuery(query, "u", params);
        })
    ));

    const meetupsByUser = new DataLoader(names => Promise.all(
        names.map( name => {
            const params = { name };
            const query = `
            MATCH (u:User {name : $name})-[:JOINED]->(m:Meetup)
            RETURN m
            `;
            return executeQuery(query, "m", params);
        })
    ));

    const eventsByUser = new DataLoader(names => Promise.all(
        names.map( name => {
            const params = { name };
            const query = `
            MATCH (u:User {name : $name})-[:PARTICIPATED]->(e:Event)
            RETURN e
            `;
            return executeQuery(query, "e", params);
        })
    ));

    const meetupsByTag = new DataLoader(ids => Promise.all(
        ids.map( id => {
            const params = { id };
            const query = `
            MATCH (t:Tag {id : $id})<-[:TAGGED]-(m:Meetup)
            RETURN m
            `;
            return executeQuery(query, "m", params, context);
        })
    ));

    const partecipantsByEvent = new DataLoader(ids => Promise.all(
        ids.map( id => {
            const params = { id };
            const query = `
            MATCH (e:Event {id : $id})<-[:PARTICIPATED]-(u:User)
            RETURN u
            `;
            return executeQuery(query, "u", params, context);
        })
    ));

    const meetupByEvent = new DataLoader(ids => Promise.all(
        ids.map( id => {
            let session = driver.session();
            let params = { id };
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
        })
    ));

    return {
        tagsByMeetup,
        membersByMeetup,
        eventsByMeetup,
        meetupsByUser,
        eventsByUser,
        meetupsByTag,
        partecipantsByEvent,
    }
}
