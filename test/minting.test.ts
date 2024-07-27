import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployTokenFixture } from "./token.fixture";
import { Signers } from "./types";

describe("Minting", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.loadFixture = loadFixture;
  });

  describe("Initial State", function () {
    beforeEach(async function () {
      const { token, token_address } = await this.loadFixture(deployTokenFixture);
      this.token = token;
      this.token_address = token_address;
    });

    it("owner is the community steward", async function () {
      expect(await this.token.owner()).to.equal(this.signers.admin.address);
    });

    it("should allow the community steward to mint to themselves", async function () {
      const initialSupply = await this.token.totalSupply();
      await this.token.mint(this.signers.admin.address, 100);
      expect(await this.token.totalSupply()).to.equal(initialSupply + 100n);
    });

    it("should allow the community steward to mint to others", async function () {
      const [_, newOwner] = await ethers.getSigners();
      const initialSupply = await this.token.totalSupply();
      await this.token.mint(newOwner.address, 100);
      expect(await this.token.totalSupply()).to.equal(initialSupply + 100n);
    });

    it("should not allow non-comunity stewards to mint", async function () {
      const [_, nonOwner] = await ethers.getSigners();
      await expect(this.token.connect(nonOwner).mint(nonOwner.address, 100)).to.be.reverted;
    });
  });

  describe("When Paused", async function () {
    beforeEach(async function () {
      const { token } = await this.loadFixture(deployTokenFixture);
      this.token = token;
      const [_, alice] = await ethers.getSigners();
      await this.token.connect(this.signers.admin).mint(alice.address, 100n);
      await this.token.connect(this.signers.admin).pause();
      await expect(await this.token.connect(this.signers.admin).paused()).to.be.true;
    });

    it("cannot mint when paused", async function () {
      const transferAmount = 100n;
      const [_, bob] = await ethers.getSigners();
      await expect(this.token.connect(this.signers.admin).mint(bob.address, transferAmount)).to.be.revertedWith(
        "Pausable: paused",
      );
    });
  });
});
