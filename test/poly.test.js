const { expect } = require("chai");
const { ethers } = require("hardhat");
const cliProgress = require("cli-progress");

describe("Poly — getMedianPoly Gas & Correctness Tests", function () {
  it.skip("returns raw median when stale = 0", async function () {
    const Factory = await ethers.getContractFactory("Poly");
    const median = await Factory.deploy();
    await median.deployed();

    await median.addValue(5);
    await median.addValue(1);
    await median.addValue(3);

    // stale = 0, a = 2.0 (UD60x18)
    const STALE = ethers.utils.parseEther("0");
    const A = ethers.utils.parseEther("2.0");

    // NOTE: pass struct args as single‐element arrays
    const result = await median.getMedianPoly(
      STALE,
      A
    );
    // median = 3 -> 3 * 1e18
    expect(result).to.equal(ethers.utils.parseEther("3.0"));
  });

  it.skip("applies 1/(1+stale)^a decay correctly (a = 1.0)", async function () {
    const Factory = await ethers.getContractFactory("Poly");
    const median = await Factory.deploy();
    await median.deployed();

    await median.addValue(2);
    await median.addValue(4);

    // stale = 1.0, a = 1.0 -> decay = 1/(1+1)^1 = 0.5
    const STALE = ethers.utils.parseEther("1.0");
    const A = ethers.utils.parseEther("1.0");

    const result = await median.getMedianPoly(
      STALE,
      A
    );
    // 3 * 0.5 = 1.5 -> 1.5 * 1e18
    expect(result).to.equal(ethers.utils.parseEther("1.5"));
  });

  it.skip("applies correct decay when a = 0.5", async function () {
    const Factory = await ethers.getContractFactory("Poly");
    const median = await Factory.deploy();
    await median.deployed();

    await median.addValue(2);
    await median.addValue(4);

    // stale = 1.0, a = 0.5 -> decay = 1/(1+1)^0.5 = 1/sqrt(2)
    const STALE = ethers.utils.parseEther("1.0");
    const A = ethers.utils.parseEther("0.5");

    const result = await median.getMedianPoly(
      STALE,
      A
    );
    // expect ~= 3 / sqrt(2) ~= 2.1213203435596424 * 1e18
    const expected = ethers.utils.parseEther("2.1213203435596424");
    const tol = ethers.utils.parseEther("0.001");
    expect(result).to.be.closeTo(expected, tol);
  });

  it("benchmarks getMedianPoly gas for 1..100 values", async function () {
    const Factory = await ethers.getContractFactory("Poly");
    const median = await Factory.deploy();
    await median.deployed();

    const MAX = 100;
    const bar = new cliProgress.SingleBar({
      format: "Poly |{bar}| {percentage}% || {value}/{total} calls",
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);

    const results = [];
    bar.start(MAX, 0);

    // const STALE = ethers.utils.parseEther("0");
    const staleInts = [0, 1, 2, 3, 4];  // 0 -- 4
    const randIdx = Math.floor(Math.random() * staleInts.length);
    const staleInt = staleInts[randIdx];
    const STALE = ethers.utils.parseEther(staleInt.toString());
    const A = ethers.utils.parseEther("0.5");

    for (let n = 1; n <= MAX; n++) {
      await median.addValue(n);
      const gas = await median.estimateGas.getMedianPoly(
        STALE,
        A
      );
      results.push({ count: n, gas: gas.toNumber() });
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
