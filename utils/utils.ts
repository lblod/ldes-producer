import { Store, DataFactory, NamedNode, Term, Quad, OTerm } from "n3";
import { uuid } from "mu";
import { ldesTime, tree, xml } from "./namespaces";
import * as RDF from "rdf-js";
const { namedNode, quad, literal } = DataFactory;

export function generateTreeRelation() {
	return ldesTime(`relations/${uuid()}`);
}

export function generatePageResource(number: number) {
	return namedNode(`/pages?page=${number}`);
}

export function nowLiteral() {
	const xsdDateTime = xml("dateTime");
	const now = new Date().toISOString();
	return literal(now, xsdDateTime);
}

export function generateVersion(_namedNode: any) {
	return ldesTime(`versioned/${uuid()}`);
}

export function error(status: number, msg?: string) {
	var err = new Error(msg || "An error occurred");
	err.status = status;
	return err;
}

export function getFirstMatch(
	store: Store,
	subject: OTerm,
	predicate: OTerm,
	object: OTerm,
	graph: OTerm
): Quad | null {
	const matches = store.getQuads(subject, predicate, object, graph);
	if (matches.length > 0) {
		return matches[0];
	}
	return null;
}
