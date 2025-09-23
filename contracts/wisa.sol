// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

contract Wisa {
    uint256[] private values;

    function addValue(uint256 v) external {
        values.push(v);
    }

    function count() external view returns (uint256) {
        return values.length;
    }

    function getAverageLast4() external view returns (uint256) {
        uint256 len = values.length;
        if (len == 0) return 0;

        uint256 n = len >= 4 ? 4 : len;
        if (n == 1) {
            return values[len - 1];
        } else if (n == 2) {
            uint256 a = values[len - 1];
            uint256 b = values[len - 2];
            // floor((a+b)/2)
            uint256 q = (a >> 1) + (b >> 1);
            uint256 r = (a & 1) + (b & 1);
            return q + (r >> 1);
        } else if (n == 3) {
            uint256 a = values[len - 1];
            uint256 b = values[len - 2];
            uint256 c = values[len - 3];
            // floor((a+b+c)/3) = sum(floor(xi/3)) + floor((sum(xi mod 3))/3)
            uint256 q = a / 3 + b / 3 + c / 3;
            uint256 r = (a % 3) + (b % 3) + (c % 3);
            return q + (r / 3);
        } else {
            uint256 a = values[len - 1];
            uint256 b = values[len - 2];
            uint256 c = values[len - 3];
            uint256 d = values[len - 4];
            // floor((a+b+c+d)/4)
            uint256 q = (a >> 2) + (b >> 2) + (c >> 2) + (d >> 2);
            uint256 r = (a & 3) + (b & 3) + (c & 3) + (d & 3);
            return q + (r >> 2);
        }
    }
}
