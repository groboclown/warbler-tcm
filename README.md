# Warbler Test Case Manager

*The File Based Test Case Manager*

Warbler is designed around having a source control tool keep track of versions, and allowing file-based tools to handle the editing and comparisons.


# Files and Editor

At its heart, Warbler is about [a common file format for storing test plans](docs/warbler-file-format.md), test cases, and test executions.  The format is a JSON file with [a well-defined schema](docs/warbler-schema-v1.json).  The editor, on the other hand, is one way to view and work with the files.


## Running the Editor

To get started, you'll need `nodejs` installed, and download the latest version of the codebase.  Then, you can run:

```
$ npm install
```

To run the editor, you can execute:

```
$ npm run dev
```

Eventually, a binary distribution will be available to run without having to go through all this.


## Developing

```
$ npm run build && npm run dev
```

# License

Warbler TCM is distributed under [The Apache 2.0 License](LICENSE).
