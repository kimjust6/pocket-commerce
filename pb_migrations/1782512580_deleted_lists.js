/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("lists");
    return app.delete(collection);
  } catch (e) {
    return null;
  }
}, (app) => {
  return null;
});
