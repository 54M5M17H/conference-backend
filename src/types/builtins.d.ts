// add typescript support for the padStart String method

interface String {
	padStart(targetLength: number, padding: string): string;
}

// add includes method support to array
interface Array<T> {
	includes(s: T): boolean;
}