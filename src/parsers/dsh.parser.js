export default function parseData(data) {
    const dataset = data.values.map((d) => {
        return [d.t, Number(d.v.toFixed(2))];
    });
    const label = 'Temperature';
    return [{ label, dataset }]
}