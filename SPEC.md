# API

## General

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