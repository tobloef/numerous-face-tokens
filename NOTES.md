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
* Get all where name is "tobias": `?name=tobias`.
* Get all where time later than 12:00: `?time>12:00`.

# Thoughts on technologies

## Express.js
* Creating a type-safe API requires a bunch of layers of abstraction, especially if you want to do it in a succinct way for each endpoint.
* You also have to do a bunch of stuff for handling query parameters (filtering, etc.).
* You also have to do type sharing between frontend and backend.
* Most of this seems to be an inherint problem with web APIs, SSR likely won't suffer from the same issues.

## Prisma
* I'm not sure I like creating schema files instead of decorating domain models.
* I'm not sure I like that relations must always have a counterpart. For this instance it made sense, so maybe it always does? Seems unlikely tho.
* No good way to exclude fields, like password hash. 