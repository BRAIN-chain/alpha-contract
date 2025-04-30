const { expect } = require("chai");
const { ethers } = require("hardhat");
const cliProgress = require("cli-progress");

describe("Hinge — getMedianHinge Gas & Correctness Tests", function () {
  it.skip("returns raw median when stale <= b", async function () {
    const Factory = await ethers.getContractFactory("Hinge");
    const hinge = await Factory.deploy();
    await hinge.deployed();

    await hinge.addValue(5);
    await hinge.addValue(1);
    await hinge.addValue(3);

    const STALE = ethers.utils.parseEther("0.0");
    const A = ethers.utils.parseEther("1.0");
    const B = ethers.utils.parseEther("1.0");
    const C = ethers.utils.parseEther("2.0");

    const result = await hinge.getMedianHinge(STALE, A, B, C);
    expect(result).to.equal(ethers.utils.parseEther("3.0"));
  });

  it.skip("returns zero when stale >= c", async function () {
    const Factory = await ethers.getContractFactory("Hinge");
    const hinge = await Factory.deploy();
    await hinge.deployed();

    await hinge.addValue(2);
    await hinge.addValue(4);

    // stale = 2.0 >= c = 1.0 -> full decay to zero
    const STALE = ethers.utils.parseEther("2.0");
    const A = ethers.utils.parseEther("1.0");
    const B = ethers.utils.parseEther("0.5");
    const C = ethers.utils.parseEther("1.0");

    const result = await hinge.getMedianHinge(STALE, A, B, C);
    expect(result).to.equal(ethers.utils.parseEther("0.0"));
  });

  it.skip("applies hinge decay correctly when b < stale < c", async function () {
    const Factory = await ethers.getContractFactory("Hinge");
    const hinge = await Factory.deploy();
    await hinge.deployed();

    await hinge.addValue(2);
    await hinge.addValue(4);

    // stale = 1.0, a = 1.0, b = 0.0, c = 2.0
    // t = 1/(1*(2-0)+1) = 1/3
    // numerator = 1/(1*(1-0)+1) - t = 1/2 - 1/3 = 1/6
    // denominator = 1 - t = 2/3
    // decay = (1/6)/(2/3) = 1/4 = 0.25
    // final = 3 * 0.25 = 0.75
    const STALE = ethers.utils.parseEther("1.0");
    const A = ethers.utils.parseEther("1.0");
    const B = ethers.utils.parseEther("0.0");
    const C = ethers.utils.parseEther("2.0");

    const result = await hinge.getMedianHinge(STALE, A, B, C);
    expect(result).to.equal(ethers.utils.parseEther("0.75"));
  });

  it("benchmarks getMedianHinge gas for 1..100 values", async function () {
    const Factory = await ethers.getContractFactory("Hinge");
    const hinge = await Factory.deploy();
    await hinge.deployed();

    const MAX = 100;
    const bar = new cliProgress.SingleBar({
      format: "Hinge |{bar}| {percentage}% || {value}/{total} calls",
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);

    const results = [];
    bar.start(MAX, 0);

    // const STALE = ethers.utils.parseEther("0");
    const staleInts = [0, 1, 2, 3, 4];  // 0 -- 4
    const randIdx = Math.floor(Math.random() * staleInts.length);
    const staleInt = staleInts[randIdx];
    const STALE = ethers.utils.parseEther(staleInt.toString());
    const A = ethers.utils.parseEther("10.0");
    const B = ethers.utils.parseEther("2.0");
    const C = ethers.utils.parseEther("4.0");

    for (let n = 1; n <= MAX; n++) {
      await hinge.addValue(n);
      const gas = await hinge.estimateGas.getMedianHinge(
        STALE, A, B, C
      );
      results.push({ count: n, gas: gas.toNumber() });
      bar.increment();
    }

    bar.stop();

    console.table(results);

    const gasValues = results.map(r => r.gas);
    const N = gasValues.length;
    const sum = gasValues.reduce((a, x) => a + x, 0);
    const avg = sum / N;
    const min = Math.min(...gasValues);
    const max = Math.max(...gasValues);
    const varr = gasValues.reduce((a, x) => a + (x - avg) ** 2, 0) / N;
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
