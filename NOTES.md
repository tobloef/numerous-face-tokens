## Misc.
* I have tried to be pragmatic in my approach when creating each app. I could have created layers of abstraction that would have made it easier to switch between techologies, etc., but apart from being needlessly complex, it would also take away from the experience of each technology.

## Thoughts on API URLs

### Sorting
* Sort by name ascending: `?sort=+name`.
* Sort by name descending: `?sort=-name`.
* Sort by name primarily, date secondarily: `?sort=+name,+date`.

### Pagination
* Get page 2 with default limit: `?page=2`.
* Get page 2 with a limit of 20: `?page=2&limit=20`.
* API will define a maximum limit and return status code `400` if the given limit is too high.

### Filtering
* Get all where name is "tobias": `?name[eq]=tobias`.
* Ops:
    * `gt`: works on `number` and `Date`
    * `gte`: works on `number` and `Date`
    * `lt`: works on `number` and `Date`
    * `lte`: works on `number` and `Date`
    * `eq`: works on `string` and `number` and `Date`
    * `search`: works on `string`

# Thoughts on technologies

## Express.js (TS)
* Creating a type-safe API requires a bunch of layers of abstraction, especially if you want to do it in a succinct way for each endpoint.
* You also have to do a bunch of stuff for handling query parameters (filtering, etc.).
* You also have to do type sharing between frontend and backend.
* Most of this seems to be an inherint problem with web APIs, SSR likely won't suffer from the same issues.
* I really really like having full type-safety. Once the proper types has been set up, the code writes itself.
* I found it hard to create a consise type-safe way to do filter query parameters in a general way. Boiler plate, boiler plate and more boiler plate. It ended up being like a DSL on top of express, with very little transferable knowledge.
* Having to write this stuff for every single project would be a huge pain. It's the validation, both from a type POV and a user input POV that is annoying to write, especially when the two should match, with minimal boilerplate.
* Endpoints for each frontend page VS query parameters to include relations (like GraphQL lol) VS always send all the data.
* Why the heck isn't `Object.entries`, type safe, that's a major annoyance, especially when combining with `.reduce()`.
* While it's nice when the TypeScript puzzle soft of "clicks" into place, it's probably not until I do some maintenance that I really feel the comparison with JS, where refactoring feels risky. Maybe I should add a refactoring task after I've finished, to test see how it feels?

## Prisma
* I'm not sure I like creating schema files instead of decorating domain models.
* I'm not sure I like that relations must always have a counterpart. For this instance it made sense, so maybe it always does? Seems unlikely tho.
* No good way to exclude fields, like password hash. 
* I really like automatic migrations.
* I really really like the strong typing, though the exported types could have shorter names.
