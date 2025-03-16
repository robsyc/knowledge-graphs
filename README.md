# My first knowledge graph

## Context

Hi, my name is `robsyc`, and I'm taking the Knowledge Graph course at the Ghent University.

## Repo structure

- `src/ontology/`: contains the ontology files
- `src/kg/`: contains the knowledge graph files (TTL and JSON-LD)
- `src/kg/parse.ts`: a script that 
    - parses both files using [`rdf-dereferencer`](https://github.com/rubensworks/rdf-dereference.js/tree/master)
    - stores quads in a [`RdfStore`](https://github.com/rubensworks/rdf-stores.js)
    - checks quad counts, redudancy and/or inconsistencies

## Quickstart

```bash
git clone https://github.com/robsyc/knowledge-graphs.git
cd knowledge-graphs
bun i

# Run the parser to check if both KG files (TTL and JSON-LD) are valid and consistent
bun run src/kg/parse.ts
```

## Important lessons learned

- After some back-and-forth, I was able to parse both files such that they're both valid and consistent RDF
- Turtle files are much easier to work with than JSON-LD
- Specifying the datatype & language is much more verbose in JSON-LD
- Don't forget about `@id` and `@type` attributes in JSON-LD otherwise inconsistencies will arise