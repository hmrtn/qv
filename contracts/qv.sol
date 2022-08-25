// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract qv {
  struct Grant {
    string id;
    bool active;
    address owner;
    uint256 timestamp;
    mapping(address => uint256) votes;
    uint256 weight;
    uint256 reward;
  }

  ERC20 public TOKEN;
  uint256 public VOTE_COST;

  mapping(string => Grant) public grants;

  constructor(address _token, uint256 _voteCost) {
    TOKEN = ERC20(_token);
    VOTE_COST = _voteCost;
  }

  function cost(uint256 currentWeight, uint256 weight)
    internal
    view
    returns (uint256)
  {
    if (currentWeight > weight) {
      return weight**2 * VOTE_COST;
    } 
    else if (currentWeight < weight) {
      return (weight**2 - currentWeight * currentWeight) * VOTE_COST;
    } else {
      return 0;
    }
  }

  function createGrant(address owner, string calldata id) public {
    Grant storage grant = grants[id];
    if (grant.active) revert("ACTIVE_GRANT");
    grant.owner = owner;
    grant.timestamp = block.timestamp;
    grant.active = true;
  }

  function vote(string calldata grantId, uint256 weight) public {
    Grant storage grant = grants[grantId];
    if (grant.owner == msg.sender) revert("GRANT_OWNER");
    uint256 currentWeight = grant.votes[msg.sender];
    if (currentWeight == weight) return;
    uint256 voteCost = cost(currentWeight, weight);
    if (TOKEN.balanceOf(msg.sender) < voteCost) revert("INSUFFICIENT_FUNDS");
    TOKEN.transferFrom(msg.sender, address(this), voteCost);
    grant.votes[msg.sender] = weight;
    grant.weight += weight - currentWeight;
    grant.reward += voteCost;
  }

  function claimReward(string calldata id) public {
    Grant storage grant = grants[id];
    if (grant.owner != msg.sender) revert("NOT_GRANT_OWNER");
    if (grant.reward == 0) revert("NO_REWARD");
    TOKEN.transfer(msg.sender, grant.reward);
    grant.reward = 0;
    grant.active = false;
  }
}
