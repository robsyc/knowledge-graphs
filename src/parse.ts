import { rdfDereferencer } from "rdf-dereference";
import { RdfStore } from 'rdf-stores';
import * as path from 'path';
import type { Quad } from '@rdfjs/types';

/**
 * Tracks statistics and differences between RDF representations
 */
class QuadTracker {
  private ttlCount: number = 0;
  private jsonldCount: number = 0;
  private ttlQuads: Set<string> = new Set();
  private jsonldQuads: Set<string> = new Set();
  private redundantCount: number = 0;

  constructor(private store: RdfStore) {}

  private quadToString(quad: Quad): string {
    return `${quad.subject.value} -[${quad.predicate.value}]-> ${quad.object.value} | ${quad.graph.value}`;
  }

  addTtlQuad(quad: Quad): void {
    this.ttlCount++;
    const quadStr = this.quadToString(quad);
    this.ttlQuads.add(quadStr);
    
    const dataset = this.store.asDataset();
    const isRedundant = dataset.has(quad);
    if (isRedundant) {
      this.redundantCount++;
    }
    this.store.addQuad(quad);
    this.logQuad('TTL', quad, this.ttlCount, isRedundant);
  }

  addJsonLdQuad(quad: Quad): void {
    this.jsonldCount++;
    const quadStr = this.quadToString(quad);
    this.jsonldQuads.add(quadStr);
    
    const dataset = this.store.asDataset();
    const isRedundant = dataset.has(quad);
    if (isRedundant) {
      this.redundantCount++;
    }
    this.store.addQuad(quad);
    this.logQuad('JSON-LD', quad, this.jsonldCount, isRedundant);
  }

  private logQuad(format: string, quad: Quad, count: number, isRedundant: boolean): void {
    console.log(`\n${format} Quad #${count}${isRedundant ? ' (redundant)' : ''} :`);
    console.log(`  Subject   : ${quad.subject.value} (${quad.subject.termType})`);
    console.log(`  Predicate : ${quad.predicate.value} (${quad.predicate.termType})`);
    console.log(`  Object    : ${quad.object.value} (${quad.object.termType}${
      quad.object.termType === 'Literal' 
        ? `, datatype: ${quad.object.datatype?.value}, language: ${quad.object.language || 'none'}`
        : ''
    })`);
    if (quad.graph.value !== '') {
      console.log(`  Graph     : ${quad.graph.value} (${quad.graph.termType})`);
    }
  }

  printSummary(): void {
    const dataset = this.store.asDataset();
    
    // Find quads unique to each format
    const ttlOnly = new Set([...this.ttlQuads].filter(x => !this.jsonldQuads.has(x)));
    const jsonldOnly = new Set([...this.jsonldQuads].filter(x => !this.ttlQuads.has(x)));
    const common = new Set([...this.ttlQuads].filter(x => this.jsonldQuads.has(x)));

    console.log('\nDetailed Analysis:');
    console.log('=================');
    console.log(`Total unique triples    : ${dataset.size}`);
    console.log(`TTL Quads processed     : ${this.ttlCount}`);
    console.log(`JSON-LD Quads processed : ${this.jsonldCount}`);
    console.log(`Redundant quads parsed  : ${this.redundantCount}`);

    console.log(`\nQuads Distribution:`);
    console.log(`Common to both formats  : ${common.size}`);
    console.log(`Only in TTL             : ${ttlOnly.size}`);
    console.log(`Only in JSON-LD         : ${jsonldOnly.size}`);
  }
}

async function processQuadStream(
  data: AsyncIterable<Quad>, 
  tracker: QuadTracker, 
  addMethod: (quad: Quad) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = data as any; // Type assertion needed for stream methods
    stream
      .on('data', (quad: Quad) => addMethod.call(tracker, quad))
      .on('error', reject)
      .on('end', resolve);
  });
}

async function main() {
  const store = RdfStore.createDefault();
  const tracker = new QuadTracker(store);
  
  try {
    // Get absolute paths to the RDF files
    const ttlPath = path.join(__dirname, 'me.ttl');
    const jsonldPath = path.join(__dirname, 'me.jsonld');
    
    // Read and process the TTL file
    console.log('Processing TTL file:', ttlPath);
    const { data: ttlData } = await rdfDereferencer.dereference(ttlPath, { localFiles: true });
    await processQuadStream(ttlData, tracker, tracker.addTtlQuad);
    
    // Read and process the JSON-LD file
    console.log('\nProcessing JSON-LD file:', jsonldPath);
    const { data: jsonldData } = await rdfDereferencer.dereference(jsonldPath, { localFiles: true });
    await processQuadStream(jsonldData, tracker, tracker.addJsonLdQuad);

    // Print final statistics
    tracker.printSummary();

  } catch (error) {
    console.error('Error processing RDF data:', error);
  }
}

main().catch(console.error);