// Pure year/distance math for the timeline road (kept importable for checks).
export const STOP_SPACING = 800
export const RUNWAY = 450

export const stopDistance = i => RUNWAY + i * STOP_SPACING
export const roadLength = n => RUNWAY + (n - 1) * STOP_SPACING + 600

// Each stop's year: first 4-digit year in its kicker ("2012–2013 · …" → 2012).
// Stops with no year in the text (e.g. "AFTER ALICANTE · PARIS") are filled
// by interpolating between the nearest dated neighbours.
export function parseStopYears(stops) {
    const years = stops.map(s => {
        const m = (s.kicker || '').match(/\b(19|20)\d{2}\b/)
        return m ? parseInt(m[0], 10) : null
    })
    for (let i = 0; i < years.length; i++) {
        if (years[i] !== null) continue
        let prev = i - 1
        while (prev >= 0 && years[prev] === null) prev--
        let next = i + 1
        while (next < years.length && years[next] === null) next++
        if (prev >= 0 && next < years.length) {
            years[i] = years[prev] + Math.round(((i - prev) / (next - prev)) * (years[next] - years[prev]))
        } else if (prev >= 0) years[i] = years[prev]
        else if (next < years.length) years[i] = years[next]
        else years[i] = 1991
    }
    return years
}

// Year shown at a driven distance: piecewise-linear between stop anchors,
// flat at 1991 before the first stop, and 2023→2026 over the final tail.
export function yearAt(distance, years) {
    const n = years.length
    if (!n) return 1991
    const first = stopDistance(0)
    const lastD = stopDistance(n - 1)
    const end = roadLength(n)
    if (distance <= first) return years[0]
    if (distance >= lastD) {
        const t = (distance - lastD) / Math.max(1, end - lastD)
        return Math.round(years[n - 1] + t * (2026 - years[n - 1]))
    }
    for (let i = 0; i < n - 1; i++) {
        const a = stopDistance(i)
        const b = stopDistance(i + 1)
        if (distance < b) {
            const t = (distance - a) / (b - a)
            return Math.round(years[i] + t * (years[i + 1] - years[i]))
        }
    }
    return years[n - 1]
}
