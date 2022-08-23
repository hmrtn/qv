// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract qv {
  struct Grant {
    string id;
	bool active;
    address payable owner;
    uint256 timestamp;
    mapping(address => uint256) votes;
    uint256 weight;
	uint256 reward;
  }

  uint256 public VOTE_COST = 10_000_000_000; // 10 gwei,

  mapping(string => Grant) public grants;


  constructor () {

  }

  function cost(uint256 currentWeight, uint256 weight)
    public
    view
    returns (uint256 cost)
  {
    if (currentWeight > weight) {
      cost = weight**2 * VOTE_COST; 
    } else if (currentWeight < weight) {
      cost = (weight * weight - currentWeight * currentWeight) * VOTE_COST;
    }
  }

  function createGrant(address owner, string calldata id) public {
    Grant storage grant = grants[id];
	if (grant.active) revert("ACTIVE_GRANT");
    grant.owner = payable(owner);
    grant.timestamp = block.timestamp;
	grant.active = true;
  }

  function vote(string calldata grantId, uint256 weight) public payable {
	Grant storage grant = grants[grantId];
	if (grant.owner == msg.sender) revert ("GRANT_OWNER");
	uint256 currentWeight = grant.weight;
	if (currentWeight == weight) return;
	uint voteCost = cost(currentWeight, weight);
	if (msg.value < voteCost) revert ("INSUFFICIENT_FUNDS");
	grant.votes[msg.sender] = weight;
	grant.weight += weight - currentWeight;
	grant.reward += msg.value;
  }

  function claimReward(string calldata id) public {
	Grant storage grant = grants[id];
	if (grant.owner != msg.sender) revert ("NOT_GRANT_OWNER");
	if (grant.reward == 0) revert ("NO_REWARD");
	grant.reward = 0;
	grant.owner.transfer(grant.reward);
  }
}
