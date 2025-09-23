const { expect } = require("chai");
const { ethers } = require("hardhat");
const cliProgress = require("cli-progress");

describe("Wisa ‒ getAverageLast4 Gas Benchmark", function () {
  it.skip("correctness on small cases", async function () {
    const Factory = await ethers.getContractFactory("Wisa");
    const wisa = await Factory.deploy();
    await wisa.deployed();

    expect(await wisa.getAverageLast4()).to.equal(0);

    await wisa.addValue(7);
    expect(await wisa.getAverageLast4()).to.equal(7);

    await wisa.addValue(8); // [7,8] -> floor(15/2)=7
    expect(await wisa.getAverageLast4()).to.equal(7);

    await wisa.addValue(10); // [7,8,10] -> floor(25/3)=8
    expect(await wisa.getAverageLast4()).to.equal(8);

    await wisa.addValue(13); // [7,8,10,13] -> floor(38/4)=9
    expect(await wisa.getAverageLast4()).to.equal(9);

    await wisa.addValue(100); // [8,10,13,100] -> floor(131/4)=32
    expect(await wisa.getAverageLast4()).to.equal(32);
  });

  it("should estimate gas for getAverageLast4 with 1..100 stored values", async function () {
    const Factory = await ethers.getContractFactory("Wisa");
    const wisa = await Factory.deploy();
    await wisa.deployed();

    const MAX = 100;
    const bar = new cliProgress.SingleBar({
      format: "Progress |{bar}| {percentage}% || {value}/{total} calls",
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);

    const results = [];
    bar.start(MAX, 0);

    for (let n = 1; n <= MAX; n++) {
      await wisa.addValue(n);
      const gasEstimate = await wisa.estimateGas.getAverageLast4();
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
      stdDev: stdDev.toFixed(4),
      median: Math.round(medVal)
    }]);

    expect(N).to.equal(MAX);
  });
});
