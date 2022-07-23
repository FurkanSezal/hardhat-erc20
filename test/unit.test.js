const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
  INITIAL_SUPPLY,
} = require("../helper-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Unit tests", () => {
      let erc20, account1;
      beforeEach(async () => {
        account1 = (await ethers.getSigners())[1];
        deployer = (await getNamedAccounts()).deployer;
        //account1 = (await getNamedAccounts()).account1;
        await deployments.fixture("all");
        erc20 = await ethers.getContract("OurToken", deployer);
      });
      it("was deployed", async () => {
        assert(erc20.address);
      });
      describe("constructor", async () => {
        it("Check the initial supply", async () => {
          const iintial_supply = (await erc20.totalSupply()).toString();
          //console.log(ethers.utils.formatEther(iintial_supply));
          assert.equal(INITIAL_SUPPLY, iintial_supply);
        });
        it("Name is correct", async () => {
          const tokenName = (await erc20.name()).toString();
          assert.equal(tokenName, "Heavy Thunder Secret");
        });
        it("Symbol is correct", async () => {
          const tokenSymbol = (await erc20.symbol()).toString();
          assert.equal(tokenSymbol, "HTS");
        });
      });
      describe("tranfers", async () => {
        it("allow transfer to another address", async () => {
          const tokenToSend = ethers.utils.parseEther("10");
          //console.log(account1.address);
          const tx = await erc20.transfer(account1.address, tokenToSend);
          assert(tx);
          expect(await erc20.balanceOf(account1.address)).to.equal(tokenToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
          const tokenToSend = ethers.utils.parseEther("10");
          const tx = await erc20.transfer(account1.address, tokenToSend);
          expect(tx).to.emit(erc20, "Transfer");
        });

        describe("allowances", () => {
          beforeEach(async () => {
            userContract = await ethers.getContract(
              "OurToken",
              account1.address
            );
          });
          it("Should approve other address to spend token", async () => {
            const tokenToSend = ethers.utils.parseEther("10");
            await erc20.approve(account1.address, tokenToSend);
            const erc20_1 = await ethers.getContract(
              "OurToken",
              account1.address
            );
            await erc20_1.transferFrom(deployer, account1.address, tokenToSend);
            expect(await erc20_1.balanceOf(account1.address)).to.equal(
              tokenToSend
            );
          });
          it("doesn't allow an unnaproved member to do transfers", async () => {
            const tokenToSend = ethers.utils.parseEther("10");
            await expect(
              userContract.transferFrom(deployer, account1.address, tokenToSend)
            ).to.be.revertedWith("ERC20: insufficient allowance");
          });
          it("emits an approval event, when an approval occurs", async () => {
            const tokenToSend = ethers.utils.parseEther("10");
            const tx = await erc20.approve(account1.address, tokenToSend);
            expect(tx).to.emit(erc20, "Approval");
          });
          it("won't allow a user to go over the allowance", async () => {
            const tokenToSend = ethers.utils.parseEther("10");
            const tokenToSendOver = ethers.utils.parseEther("20");
            await erc20.approve(account1.address, tokenToSend);
            await expect(
              userContract.transferFrom(
                deployer,
                account1.address,
                tokenToSendOver
              )
            ).to.be.revertedWith("ERC20: insufficient allowance");
          });
        });
      });
    });
