/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("movies");
    return app.delete(collection);
  } catch (e) {
    // collection already deleted or does not exist
    return null;
  }
}, (app) => {
  return null;
});
