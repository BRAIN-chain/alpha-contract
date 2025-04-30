// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

contract Constant {
    uint256[] private values;
    uint8 public constant MAX_COUNT = 11;

    /// @notice Append a new value (history grows unbounded)
    /// @param newValue The new uint256 to push
    function addValue(uint256 newValue) external {
        values.push(newValue);
    }

    /// @notice Retrieve the most recent up to 11 values
    /// @return recent An array of at most 11 latest values
    function getRecent() external view returns (uint256[] memory recent) {
        uint256 count;
        uint256 start;
        {
            uint256 len = values.length;
            count = len > MAX_COUNT ? MAX_COUNT : len;
            start = len > MAX_COUNT ? len - MAX_COUNT : 0;
        }
        recent = new uint256[](count);
        // TODO: assembly for skipping range-check
        for (uint256 i = 0; i < count; i++) {
            recent[i] = values[start + i];
        }
    }

    /// @notice Compute median over the most recent up to 11 values
    /// @dev Copies only the latest up to MAX_COUNT into memory and insertion-sorts
    /// @return med The median (if even count, average of two middles)
    function getMedian() external view returns (uint256 med) {
        return _getMedian();
    }

    function _getMedian() internal view returns (uint256 med) {
        uint256 count;
        uint256 start;
        {
            uint256 len = values.length;
            // require(len > 0, "No values stored");
            count = len > MAX_COUNT ? MAX_COUNT : len;
            start = len > MAX_COUNT ? len - MAX_COUNT : 0;
        }
        // copy only latest `count` values
        uint256[] memory sorted = new uint256[](count);
        // TODO: assembly for skipping range-check
        for (uint256 i = 0; i < count; i++) {
            sorted[i] = values[start + i];
        }

        // insertion sort, O(n^2) but n<=11 (efficient)
        // TODO: assembly for skipping range-check
        for (uint256 i = 1; i < count; i++) {
            uint256 key = sorted[i];
            uint256 j = i;
            while (j > 0 && sorted[j - 1] > key) {
                sorted[j] = sorted[j - 1];
                j--;
            }
            sorted[j] = key;
        }

        // median logic
        if (count % 2 == 1) {
            // odd
            med = sorted[count / 2];
        } else {
            // even: average middle two
            uint256 a = sorted[(count / 2) - 1];
            uint256 b = sorted[count / 2];
            med = (a + b) / 2;
        }
    }
}
