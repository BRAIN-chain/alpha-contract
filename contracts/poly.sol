// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

// https://github.com/PaulRBerg/prb-math
import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";

import "./constant.sol";

contract Poly is Constant {
    function getMedianPoly(
        UD60x18 stale,
        UD60x18 a
    ) external view returns (UD60x18) {
        return ud(_getMedian() * 1e18).div(ud(1e18).add(stale).pow(a));
    }
}
