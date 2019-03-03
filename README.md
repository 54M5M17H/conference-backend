# Conference Backend

This README is broken into several sections.
- First, details of what has been implemented, how & why.
- Second, what has not been implemented, but which would add or improve functionality, & in some cases how this could be done.
- Third, you will find details on how to setup, test, run
- Finally, some standard documentation on the routes exposed by the api, & their options, is available


## Design & Implementation Decisions

- The first decision to make was around database choice, for persisting event data. In most cases I would prefer a relational database, usually Postgres, as a rock solid, time-tested option. However, `for speed considerations I went for MongoDB` here: simply because it is very quick to get going with. This of course is the reason it is favoured by many, who realise later that the early time savings, of not having to set in stone a schema for example, are the exact problems which come back to bite them later. If this were a production service, `I would swap Mongo for Postgres` without a doubt. I used `Mongoose` on top of Mongo for soft schema support & validation.

- I wrote this in `Typescript` for the benefits of type inference while still writing Node as specified. I feel also makes the repo easier to read for someone coming to the code for the first time.

- I implemented the service as a `REST api, using Koa`. Most of the endpoints are simple CRUD operations, suited to the format. Joe introduced me to Koa during our chat & the notion of promisified middleware stacking appealed to me. In this repo I benefit from that model by implementing a global error handler. The api includes all of the routes I feel are necessary to meet the functionality specified.

- The `data model` I chose centres around the talk. Both speakers & attendees are referenced as children of the talks they belong to, which feels like the natural representation. Talks can be populated with their attendees and speakers using the populate query parameter. Equally, attendee's talks can be populated onto the attendee using the populate query parameter. (Examples below)

- `Population in Mongoose is not done server side, as a left-join`, but rather in separate queries to the necessary collections. This is wasteful, so implemented a `Mongo aggregate query to perform population server side` instead. This is used to populate talks with their attendees & speakers, & attendees with the talks they are attending, where requested.

- Indexes: I `added an index to talk attendees`, which facilitates the `population of an attendee's talks without scanning`. I also added a unique index to a user's email, so that an email cannot be used for two attendees.

- `RSVP`: one of the most important engineering problems was to implement the RSVP functionality. The difficulty is that `validation of the current number of attendees against the limit must be done atomically with the insert of another`. Mongo provides no way to perform a conditional update in one operation, so instead I had to filter out the talk from the update by the array size, thus finding nothing to update if full. This created a second problem, where it was impossible to differentiate between talks which were full & talks which didn't exist. In both cases, `null` would be returned by the update operation. Thus, we could attain a place at the talk if it were not full in just one operation, but to differentiate between these other cases required a second query, to check whether the talk exists at all. `I decided that this were acceptable, as it optimises for the common case`, but with more context on how likely these talks are to fill up, I may revise that decision. `In Postgres of course, validation is done atomically, & this problem would not arise`.

- Testing: I did not have time to fully & diligently test the service. Instead I have provided `example integration tests for the talks routes` as well as `a sample of unit tests` for the rsvp model method`. For the latter I chose to wrote a very simple model mock, rather than use sinon, for ease & transparency. I used mocha & should, as well as supertest for the integration tests.


## Missing Pieces

- `Authentication & Authorisation`: I have including no auth in the api, as it could be a significant job. Middleware could be used to protect routes as necessary, for example to allow admins only to update talks etc. Further, `I do no validation that a speaker or attendee id is legitimate before adding them to a talk`. This is obviously not desireable in production, as any junk id could be pushed into the array. Users could be authorised with a bearer token, provided during login. This token would authenticate them as a particular user, & then allow them to modify only their data, talks etc. It is typical to verify an email address too, before authorising certain functionality.

- There are no deletion routes in the api, again for time reasons. Implementing soft delete, adding a flag to a resource which hides it from queries, is best for disaster recovery.

- File storage: to accommodate images for speakers, currently you need it hosted elsewhere, in order to provide a URL. `A cloud storage option, e.g. S3 or GCP cloud storage, would be best for managing files`.

- Monitoring, Logging & Tracing: I added a simple logger to the repo, which used Debug, configruable with the DEBUG environment variable. Ideally you'd have a more sophisticated logging/APM mechanism for error reporting e.g. New Relic or Sentry, as well as tracing & monitoring for the service & its related system.

- Error handling: I added a very simple koa middleware for handling all errors. As a nice addition, catching & prettifying database errors would be advisable.

- I have given no thought to handling CORS, preflight requests etc

- It would be nice to add further functionality to query parameters, for better control of population, querying & pagination, using feathers or similar. Alternatively, GraphQl provides a more feature-rich, statically typed method for client-server interaction, allowing greater flexibility to the client.


## Setup, Test & Run

If you have the mongo daemon running locally, on the default port (27017), & Node version 8 or later installed, then you should be good to go. In the case that you don't, `you can run both pieces inside docker containers`. Of course, you'll need Docker running locally instead.

First clone the repo.

If you aren't going to run in Docker, or you wish to run the tests, be sure that you run `npm i(nstall)` from inside the repo.

To run the linter use `npm run lint`.
To run the tests use `npm run test`. This will perform a build first, to ensure the Typescript is valid. The tests run using ts-node, so the tests can be written & run directly in Typescript.

If mongo is running you can, build using `npm run build`, run the current build using `npm start` or do both using `npm run dev`.

Alternatively, if you have a recent version of Docker installed, you can run `npm run docker-start` to run a `docker-compose` configuration which will launch both mongo & this api inside their own containers, w/ hosting configured such that they can communicate. You can use `npm run docker-stop` to kill both, & `npm run docker-rebuild` to force a rebuild of the images, should you make any changes to the repo. *Ensure that you do not have a mongo daemon running before running the mongo docker container.*

The api will be exposed at localhost port 3000, whether you are running natively or inside the docker container.


# Api Documentation

Whether running the api in Docker or natively, it is exposed at `http://localhost:3000/`.
I have categorised the documentation of routes by resource.
For details of how to use the pagination & population parameters, see bottom.

## Talks

- ### GET /api/talks
List talks. Populate & pagination options available. Populate will replace attendee & speaker ids with their corresponding resources. The number of spaces left in each talk will be computed at query time.

- ### GET /api/talks/:talkId
Get a talk by its id. Will throw 404 if does not exist. Population option available, as above. The number of spaces left in the talk will be computed at query time.

- ### POST /api/talks
Create & return a talk from the request body, if valid (see schema).

- ### PATCH /api/talks/:talkId
Patch the identified talk using the request body. Only the fields specified are overriden. NOTE: The attendees field cannot be overriden due to the logic around RSVP. (In reality, this could be allowed if admin.)

- ### POST /api/talks/rsvp/:talkId
An attendee can sign up to attend a talk using this endpoint. In order to RSVP to a talk, an `x-attendee-id` header is required. This is a mock authentication procedure, and the header should be the id of the attendee RSVPing. (No validation is done to ensure this id corresponds to a real attendee.)


## Speakers

- ### GET /api/speakers/
List speakers. Pagination options available.

- ### GET /api/speakers/:speakerId
Get a speaker by its id. Will throw 404 if does not exist.

- ### POST /api/speakers/
Create & return a speaker from the request body, if valid (see schema).

- ### PATCH /api/speakers/:speakerId
Patch the identified speaker using the request body. Only the fields specified are overriden.


## Attendees

- ### GET /api/attendees/
List attendees. Pagination & population options available. Population will add a talks field to all results, an array of the talks they have signed up for.

- ### GET /api/attendees/:attendeeId
Get an attendee by its id. Will throw 404 if does not exist. Population options available as above.

- ### POST /api/attendees/
Create & return an attendee from the request body, if valid (see schema).

- ### PATCH /api/attendees/
Patch the attendee identified by the `x-attendee-id` header. This is a mock authentication procedure, allowing the authenticated attendee to update their own details. Will throw a 404 if the attendee does not exist.


## Pagination & Population

- ### pageSize: e.g. `?pageSize=7`
Sets the number of resources to return. Default is 10.
Available for list routes only.

- ### page: e.g. `?page=2`
Determines the page number to return, given pageSize either provided as above or defaulting to 10. Useful for pagination in UI lists. Default is 1.

- ### populate: e.g. `?populate=true`
Available for talks & attendees findById routes. Details of each can be found under their route specification above. This is a blunt, true vs false flag.


