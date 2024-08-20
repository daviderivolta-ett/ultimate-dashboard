export default function parseData(data) {
    const dataset = data.values.map((d) => {
        return [d.t, d.v];
    });
    const label = 'DSH';
    return [{ label, dataset }]
}