This is the main source folder. Organize submodules in folders and control accessibility with the submodules' index.ts and the master index.ts. Remember some patterns:

- not all classes and assets at src needs to be exported, only the external API;

- at tests, import exclusively from the main index.ts. Very nasty dependency problems with inherited classes happens if not done so.
