/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_1209437459");
    return app.delete(collection);
  } catch (e) {
    return null;
  }
}, (app) => {
  return null;
});
