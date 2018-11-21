For every end-point:
- **One it-block per end-point (even for queries)
- **Check method is okay on each (test for 405)
- **Should it return a singular entity not an array?


When deleting something, add .onDelete('CASCADE') in order to delete comments related to deleted thing

Errors to account for:
400 - malformed body, malformed params (do ${router}.param() thing)
404 - path not found, no item in db at that valid param
405 - path is legit but method not okay (use .all(handle405) on each router)
500 - last line of defence
422 - unprocessable entity (e.g. 'slug' problem)