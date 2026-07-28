/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_2893475640");
    return app.delete(collection);
  } catch (e) {
    return null;
  }
}, (app) => {
  return null;
});
