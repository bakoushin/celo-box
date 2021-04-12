// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

contract ERC20 { 
  function balanceOf(address _who) public view returns (uint256);
  function transfer(address _to, uint256 _value) public returns (bool);
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
}

/**
 * @title Box
 * @dev Box for collecting contributions for a given goal
 */
contract Box {

    bool public active = true;
    bool public finalized = false;

    address public token_address;

    address public creator;
    address public receiver;

    uint256 public goal;
    uint256 public minimal_contribution;

    uint256 public balance;
    uint256 public contributions_count;

    address[] public contributors;
    mapping(address => bool) public unique_contributors;
    mapping(address => uint256) public contributions;

    modifier isActive() {
        require(active);
        _;
    }

    modifier isComplete() {
        require(complete());
        _;
    }

    modifier creatorOnly() {
        require(msg.sender == creator);
        _;
    }

    modifier receiverOnly() {
        require(msg.sender == receiver);
        _;
    }

    modifier contributorOnly() {
        require(contributions[msg.sender] > 0);
        _;
    }
    
    function complete() private view returns (bool) {
        return balance >= goal;
    }
    
    constructor(
      address _token_address,
      uint256 _goal,
      uint256 _mininal_contribution,
      address _receiver,
      address _creator
    ) public {
        creator = _creator;
        receiver = _receiver;
        token_address = _token_address;
        goal = _goal;
        minimal_contribution = _mininal_contribution;
    }
    
    function contribute(uint256 value) public isActive {
        require(value >= minimal_contribution);
        
        ERC20 token = ERC20(token_address);
        require(token.balanceOf(msg.sender) >= value);
        token.transferFrom(msg.sender, address(this), value);

        contributions_count++;
        if (!unique_contributors[msg.sender]) {
            unique_contributors[msg.sender] = true;
            contributors.push(msg.sender);
        }
        balance += value;
        contributions[msg.sender] += value;
    }
    
    function revokeContribution() public contributorOnly {
        uint256 amount = contributions[msg.sender];

        ERC20 token = ERC20(token_address);
        token.transfer(msg.sender, amount);

        contributions[msg.sender] = 0;
        balance -= amount;
    }
    
    function deactivate() public isActive creatorOnly {
        active = false;
    }

    function finalize() public isActive isComplete creatorOnly {
        ERC20 token = ERC20(token_address);
        token.transfer(receiver, balance);

        active = false;
        finalized = true;
    }

    function redeem() public isActive isComplete receiverOnly {
        ERC20 token = ERC20(token_address);
        token.transfer(receiver, balance);

        active = false;
        finalized = true;
    }

    function summary() public view returns(bool, bool, bool, address, uint256, uint256, uint256, uint256, uint256, address, address) {
        return (
            active,
            complete(),
            finalized,
            token_address,
            goal,
            minimal_contribution,
            balance,
            contributions_count,
            contributors.length,
            creator,
            receiver
        );
    }

    function getContributors() public view returns(address[] memory) {
      return contributors;
    }
    
}