const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber, utils } = require("ethers");

describe("qv", async function () {
  let qv;
  let token;

  const cost = 10;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    QV = await ethers.getContractFactory("qv", owner);
    Token = await ethers.getContractFactory("Token", alice);
    token = await Token.deploy();
    qv = await QV.deploy(token.address, cost);

    token.connect(alice).transfer(bob.address, 1000);

    await token.connect(alice).approve(qv.address, 10000000);
    await token.connect(bob).approve(qv.address, 10000000);
  });

  describe("deployment", function () {
    it("should mint tokens to alice", async function () {
      expect(await token.balanceOf(alice.address)).to.equal(4000);
    });

    it("should transfer tokens to bob", async function () {
      expect(await token.balanceOf(bob.address)).to.equal(1000);
    });
  });

  describe("creating a grant", function () {
    it("should create a grant", async function () {
      await qv.createGrant(owner.address, "testGrantID");
    });
    it("should fail to create a grant with the same ID while its active", async function () {
      await qv.createGrant(owner.address, "testGrantID");
      await expect(
        qv.createGrant(owner.address, "testGrantID")
      ).to.be.revertedWith("ACTIVE_GRANT");
    });
  });

  describe("voting on a grant", function () {
    it("should vote on a grant", async function () {
      [owner, alice, bob] = await ethers.getSigners();
      await qv.connect(owner).createGrant(owner.address, "testGrantID");
      await qv.connect(alice).vote("testGrantID", 13);
      await qv.connect(bob).vote("testGrantID", 6);
      expect(await token.balanceOf(alice.address)).to.equal(2310);
      expect(await token.balanceOf(bob.address)).to.equal(640);
    });
    it("should only allow a single vote", async function () {
      [owner, alice, bob] = await ethers.getSigners();
      await qv.connect(owner).createGrant(owner.address, "testGrantID");
      await qv.connect(alice).vote("testGrantID", 1);
      await expect(qv.connect(alice).vote("testGrantID", 2)).to.be.revertedWith(
        "ALREADY_VOTED"
      );
    });
  });

  describe("claiming reward from grant", function () {
    it("should claim reward from grant", async function () {
      [owner, alice, bob, charlie] = await ethers.getSigners();
      await qv.createGrant(charlie.address, "testGrantID");
      await qv.connect(alice).vote("testGrantID", 13);
      await qv.connect(bob).vote("testGrantID", 6);
      await qv.connect(charlie).claimReward("testGrantID");
      expect(await token.balanceOf(charlie.address)).to.equal(2050);
    });
  });
});
