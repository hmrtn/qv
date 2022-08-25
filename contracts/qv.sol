// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract qv {
  struct Grant {
    string id;
    bool active;
    address payable owner;
    uint256 timestamp;
    mapping(address => uint256) votes;
    uint256 reward;
  }

  ERC20 public TOKEN;
  uint256 public VOTE_COST;

  mapping(string => Grant) public grants;
  mapping(address => bool) public voted; 

  constructor(uint256 _voteCost) {
    VOTE_COST = _voteCost;
  }

  function createGrant(address owner, string calldata id) public {
    Grant storage grant = grants[id];
    if (grant.active) revert("ACTIVE_GRANT");
    grant.owner = payable(owner);
    grant.timestamp = block.timestamp;
    grant.active = true;
  }

  function vote(string calldata grantId, uint256 weight) public payable {
    if (voted[msg.sender]) revert("ALREADY_VOTED");
    Grant storage grant = grants[grantId];
    if (grant.owner == msg.sender) revert("GRANT_OWNER");
    uint256 voteCost = weight**2 * VOTE_COST;
    if (msg.value < voteCost) revert("INSUFFICIENT_FUNDS");
    grant.votes[msg.sender] = weight;
    grant.reward += msg.value;
    voted[msg.sender] = true;
  }

  function claimReward(string calldata id) public {
    Grant storage grant = grants[id];
    if (grant.owner != msg.sender) revert("NOT_GRANT_OWNER");
    if (grant.reward == 0) revert("NO_REWARD");
    grant.owner.transfer(grant.reward);
    grant.reward = 0;
    grant.active = false;

  }
}
