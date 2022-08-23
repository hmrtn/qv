const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber, utils } = require("ethers");

async function deployTokenFixture() {
  const [owner, alice, bob, charlie] = await ethers.getSigners();

  const qvf = await ethers.getContractFactory("qv");

  const qv = await qvf.deploy();

  await qv.deployed();

  return { qvf, qv, owner };
}

describe(
  "Creating grants",
  it("should create a grant", async function () {
    const { qv } = await loadFixture(deployTokenFixture);
    const [alice] = await ethers.getSigners();
    await qv.createGrant(alice.address, "testGrantID");
  }),
  it("should revert if id is already an active grant", async function () {
    const { qv } = await loadFixture(deployTokenFixture);
    const [alice] = await ethers.getSigners();
    await qv.connect(alice).createGrant(alice.address, "testGrantID");
    await expect(
      qv.connect(alice).createGrant(alice.address, "testGrantID")
    ).to.be.revertedWith("ACTIVE_GRANT");
  })
);

describe(
  "Voting",
  it("should allow a user to vote", async function () {
    const { qv } = await loadFixture(deployTokenFixture);
    const [alice, bob] = await ethers.getSigners();
    await qv.createGrant(alice.address, "testGrantID");
    await qv
      .connect(bob)
      .vote("testGrantID", 4, { value: ethers.utils.parseEther("1") });
  }),
  it("should fail when not enough funds for vote", async function () {
    const { qv } = await loadFixture(deployTokenFixture);
    const [alice, bob] = await ethers.getSigners();
    await qv.createGrant(alice.address, "testGrantID");
    await expect(
      qv.connect(bob).vote("testGrantID", 400000000, {
        value: ethers.utils.parseEther("0.5"),
      })
    ).to.be.revertedWith("INSUFFICIENT_FUNDS");
  })
);

describe(
  "Claiming",
  it("should allow a user to claim", async function () {
    const { qv } = await loadFixture(deployTokenFixture);
    const [alice, bob] = await ethers.getSigners();
    await qv.createGrant(alice.address, "testGrantID");
    await qv
      .connect(bob)
      .vote("testGrantID", 4, { value: ethers.utils.parseEther("1") });
    await qv.connect(alice).claimReward("testGrantID");
  })
);
