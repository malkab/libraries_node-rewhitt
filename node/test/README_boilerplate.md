Tests. Remember that here imports must exclusively came from the main API at index.ts. Very nasty dependency problems with inherited classes happens if not done so.

Tests must be autoconclusive, clearing any resource like DB and the like.
