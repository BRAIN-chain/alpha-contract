const { expect } = require("chai");
const { ethers } = require("hardhat");
const cliProgress = require("cli-progress");

describe("Constant ‒ getMedian Gas Benchmark", function () {
    it("should estimate gas for getMedian with 1..100 values", async function () {
        const Factory = await ethers.getContractFactory("Constant");
        const median = await Factory.deploy();
        await median.deployed();

        const MAX = 100;
        const bar = new cliProgress.SingleBar({
            format: "Progress |{bar}| {percentage}% || {value}/{total} calls",
            hideCursor: true,
        }, cliProgress.Presets.shades_classic);

        const results = [];
        bar.start(MAX, 0);

        for (let n = 1; n <= MAX; n++) {
            await median.addValue(n);
            const gasEstimate = await median.estimateGas.getMedian();
            results.push({ count: n, gas: gasEstimate.toNumber() });
            bar.increment();
        }

        bar.stop();

        console.table(results);

        const gasValues = results.map(r => r.gas);
        const N = gasValues.length;
        const sum = gasValues.reduce((acc, x) => acc + x, 0);
        const avg = sum / N;
        const min = Math.min(...gasValues);
        const max = Math.max(...gasValues);
        const varr = gasValues.reduce((acc, x) => acc + (x - avg) ** 2, 0) / N;
        const stdDev = Math.sqrt(varr);
        const sorted = [...gasValues].sort((a, b) => a - b);
        const medVal = N % 2 === 1
            ? sorted[(N - 1) / 2]
            : (sorted[N / 2 - 1] + sorted[N / 2]) / 2;

        console.table([{
            min,
            max,
            average: Math.round(avg),
            // variance: Math.round(varr),
            stdDev: stdDev.toFixed(4),
            median: Math.round(medVal)
        }]);

        expect(N).to.equal(MAX);
    });
});
