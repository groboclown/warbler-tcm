# Warbler Test Case Manager

*The File Based Test Case Manager*

Warbler is designed around having a source control tool keep track of versions, and allowing file-based tools to handle the editing and comparisons.


# Files and Editor

At its heart, Warbler is about [a common file format for storing test plans](docs/warbler-file-format.md), test cases, and test executions.  The format is a JSON file with [a well-defined schema](docs/warbler-schema-v1.json).  The editor, on the other hand, is one way to view and work with the files.

## Test Plan Usage

Test Plans, as defined by Warbler, contain the test cases, special setup/teardown instructions, and a history of test executions.

## Test Plan History and SCM

The test plan files do not contain historical revisions of the test cases.  Instead, this should be handled by the source control management tools (such as Git, Subversion, or Perforce).

However, the test plan file does support storing multiple, historical test runs.  These are marked with a revision identifier so they can be tracked to the original test plan version in which they were run.


# Editor

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

## Editor Use Cases

### Browsing a Project

The editor supports the concept of a "project", which is a collection of test plans and their associated files.  The project doesn't need to be in any specific order or convention of names.  Rather, it's simply a root folder that the user is interested in exploring.

To start, you should attach a project root folder to the editor.  This shows you a tree structure on the left side which allows you to view the files in the folder.  By default, only test plan files are shown.

### Create a New Test Plan

### Merging Test Plans

The editor doesn't currently support merging test cases between test plans.  However, because the test plan files are stored as simple `json` formatted files, text editors and merge tools can help with this.


## Developing

```
$ npm run build && npm run dev
```

# License

Warbler TCM is distributed under [The Apache 2.0 License](LICENSE).
