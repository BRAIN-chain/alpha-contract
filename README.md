# Gas Test on \alpha Functions

```bash
$ npx hardhat test --network hardhat
```

or

```bash
$ npx hardhat test test/constant.test.js --network hardhat
$ npx hardhat test test/poly.test.js --network hardhat
$ npx hardhat test test/hinge.test.js --network hardhat
```

---

# Result

```bash
  Constant ‒ getMedian Gas Benchmark
┌─────────┬───────┬───────┬─────────┬─────────────┬────────┐
│ (index) │  min  │  max  │ average │   stdDev    │ median │
├─────────┼───────┼───────┼─────────┼─────────────┼────────┤
│    0    │ 26365 │ 54736 │  53190  │ '5306.7383' │ 54736  │
└─────────┴───────┴───────┴─────────┴─────────────┴────────┘

  Poly — getMedianPoly Gas & Correctness Tests
┌─────────┬───────┬───────┬─────────┬─────────────┬────────┐
│ (index) │  min  │  max  │ average │   stdDev    │ median │
├─────────┼───────┼───────┼─────────┼─────────────┼────────┤
│    0    │ 36654 │ 65025 │  63479  │ '5306.7383' │ 65025  │
└─────────┴───────┴───────┴─────────┴─────────────┴────────┘

  Hinge — getMedianHinge Gas & Correctness Tests
┌─────────┬───────┬───────┬─────────┬─────────────┬────────┐
│ (index) │  min  │  max  │ average │   stdDev    │ median │
├─────────┼───────┼───────┼─────────┼─────────────┼────────┤
│    0    │ 27527 │ 55898 │  54352  │ '5306.7383' │ 55898  │
└─────────┴───────┴───────┴─────────┴─────────────┴────────┘
```
