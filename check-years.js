import { parseStopYears, yearAt, stopDistance, roadLength } from './src/years.js'
import content from './public/content.json' with { type: 'json' }

const years = parseStopYears(content.stops)

// At every stone the sign must read that stop's own year.
content.stops.forEach((stop, i) => {
    const got = yearAt(stopDistance(i), years)
    if (got !== years[i]) {
        console.error(`stop ${i + 1} (${stop.kicker}): year ${got} != ${years[i]}`)
        process.exit(1)
    }
})

// Monotonic along the whole drive (no backwards time travel).
let prev = -Infinity
for (let d = 0; d <= roadLength(years.length); d += 25) {
    const y = yearAt(d, years)
    if (y < prev) {
        console.error(`year went backwards at distance ${d}: ${prev} -> ${y}`)
        process.exit(1)
    }
    prev = y
}

console.log('years ok:', years.join(', '))
