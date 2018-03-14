const keyByProp = (list, props) => list.reduce( (memo, el) => {
    memo[el[prop]] = el;
    return memo;
}, {});

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

    const tagsByMeetup = new DataLoader(names => {
        const params = { names: names };
        const query = `
            MATCH (m:Meetup)-[:TAGGED]->(t:Tag)
            WHERE m.name IN $names
            RETURN m.name, t
            `;
        return executeQuery(query, "t", params)
            .then( tags => {
                const tagsById = keyByProp(tags, 'id');
                return names.map
            });
    });

    const memberByMeetup = new DataLoader(names => {
        // TODO: Implement bedLoader
    });

    const eventsByMeetup = new DataLoader(names => {
        // TODO: Implement bedLoader
    });

    const meetupsByUser = new DataLoader(names => {
        // TODO: Implement bedLoader
    });

    const eventsByUser = new DataLoader(names => {
        // TODO: Implement bedLoader
    });

    const meetupsByTag = new DataLoader(ids => {
        // TODO: Implement bedLoader
    });

    const partecipantsByEvent = new DataLoader(ids => {
        // TODO: Implement bedLoader
    });

    const meetupByEvent = new DataLoader(id => {
        // TODO: Implement bedLoader
    });

    return {
        memberByMeetup,
        eventsByMeetup,
        meetupsByUser,
        eventsByUser,
        meetupsByTag,
        partecipantsByEvent,
    }
}
