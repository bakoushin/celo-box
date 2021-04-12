// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./Box.sol";

/**
 * @title Box Factory
 * @dev Helper contract for creating Boxes
 */
contract BoxFactory {
    event BoxCreated(address indexed owner, address box);

    function createBox(
      address token_address,
      uint256 goal,
      uint256 mininal_contribution,
      address receiver
    ) public returns (address) {
        address owner = msg.sender;
        address boxAddress = address(new Box(
          token_address,
          goal,
          mininal_contribution,
          receiver,
          owner
        ));
        emit BoxCreated(owner, boxAddress);
        return boxAddress;
    }
}
