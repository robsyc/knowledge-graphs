# My first knowledge graph

## Context

Hi, my name is `robsyc`, and I'm taking the Knowledge Graph course at the Ghent University.

## Repo structure

- `me.ttl`: me and my relations to things, defined in the turtle RDF format.
- `me.jsonld`: same as above, but in JSON-LD format.
- `parse.ts`: a script that 
    - parses both files using [`rdf-dereferencer`](https://github.com/rubensworks/rdf-dereference.js/tree/master)
    - stores quads in a [`RdfStore`](https://github.com/rubensworks/rdf-stores.js)
    - checks quad counts, redudancy and/or inconsistencies

## Important lessons learned

- Trurtle files are much easier to work with than JSON-LD
- Specifying the datatype & language is much more verbose in JSON-LD
- Don't forget about `@id` and `@type` in JSON-LD otherwise inconsistencies will arise
