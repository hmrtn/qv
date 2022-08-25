const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber, utils } = require("ethers");

describe("qv", async function () {
  async function deployFixture() {
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const qvf = await ethers.getContractFactory("qv");

    const qv = await qvf.deploy(10);

    await qv.deployed();

    return { qvf, qv, owner };
  }

  describe("Creating grants", function () {
    it("should create a grant", async function () {
      const { qv } = await loadFixture(deployFixture);
      const [alice] = await ethers.getSigners();
      await qv.createGrant(alice.address, "testGrantID");
    }),
      it("should revert if id is already an active grant", async function () {
        const { qv } = await loadFixture(deployFixture);
        const [alice] = await ethers.getSigners();
        await qv.connect(alice).createGrant(alice.address, "testGrantID");
        await expect(
          qv.connect(alice).createGrant(alice.address, "testGrantID")
        ).to.be.revertedWith("ACTIVE_GRANT");
      });
  });

  describe("Voting", function () {
    it("should allow a user to vote", async function () {
      const { qv } = await loadFixture(deployFixture);
      const [alice, bob] = await ethers.getSigners();
      await qv.createGrant(alice.address, "testGrantID");
      await qv
        .connect(bob)
        .vote("testGrantID", 4, { value: ethers.utils.parseEther("1") });
    }),
      it("should fail when not enough funds for vote", async function () {
        const { qv } = await loadFixture(deployFixture);
        const [alice, bob] = await ethers.getSigners();
        await qv.createGrant(alice.address, "testGrantID");
        await expect(
          qv.connect(bob).vote("testGrantID", 40, {
            value: 0,
          })
        ).to.be.revertedWith("INSUFFICIENT_FUNDS");
      });
  });

  describe("Claiming", function () {
    it("should allow a user to claim", async function () {
      const { qv } = await loadFixture(deployFixture);
      const [alice, bob] = await ethers.getSigners();
      await qv.createGrant(alice.address, "testGrantID");
      await qv.connect(bob).vote("testGrantID", 2, { value: 40 });
      await qv.connect(alice).claimReward("testGrantID");
      // Check that the balance of the calimer is correct
      await expect(await bob.getBalance()).to.equal("9999999840969924208880");
    });
  });
});
