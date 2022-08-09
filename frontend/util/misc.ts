const Range = (start: number, end: number) => Array.from({length : end-start}, (x, i) => i + start);
// useful for asynchronously iterating a range

export {
	Range
}