// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

// https://github.com/PaulRBerg/prb-math
import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";

import "./constant.sol";

contract Hinge is Constant {
    function getMedianHinge(
        UD60x18 stale,
        UD60x18 a,
        UD60x18 b,
        UD60x18 c
    ) external view returns (UD60x18) {
        UD60x18 med = ud(_getMedian() * 1e18);

        // hinge decay
        if (stale.lte(b)) {
            // stale <= b: decay = 1
            return med;
        }
        if (stale.gte(c)) {
            // stale >= c: decay = 0
            return ud(0);
        }

        UD60x18 numerator;
        UD60x18 denominator;
        {
            UD60x18 one = ud(1e18);
            UD60x18 t = one.div(a.mul(c.sub(b)).add(one)); // t = 1 / (a*(c - b) + 1)

            // numerator = 1/(a*(stale - b) + 1) - t
            UD60x18 tmp = a.mul(stale.sub(b)).add(one);
            numerator = one.div(tmp).sub(t);

            // denominator = 1 - t
            denominator = one.sub(t);
        }

        return med.mul(numerator.div(denominator));
    }
}
