// test/MusicDAO.proxy.js
// Load dependencies
import chai from "chai";
import { ethers, upgrades } from "hardhat";
import { solidity } from "ethereum-waffle";

chai.use(solidity);
const { expect } = chai;

let MusicDAO;
let musicDAOProxy: any;
const TOTAL_SUPPLY_STRING = "1" + "0".repeat(27); // 1 billion
const TOTAL_SUPPLY_BIGNUM = ethers.BigNumber.from(TOTAL_SUPPLY_STRING);
const totalSupplyFormmatted = ethers.utils.commify(TOTAL_SUPPLY_STRING);

// Start test block
describe("MusicDAO (proxy)", function () {
  beforeEach(async function () {
    MusicDAO = await ethers.getContractFactory("MusicDAO");
    musicDAOProxy = await upgrades.deployProxy(MusicDAO, [], {
      initializer: "init",
    });
  });

  it("is named MusicDAO.", async function () {
    expect(await musicDAOProxy.name()).to.equal("MusicDAO");
  });

  it('has the symbol "SOUND".', async function () {
    expect(await musicDAOProxy.symbol()).to.equal("SOUND");
  });

  it(`has a total cap of ${totalSupplyFormmatted} SOUND.`, async function () {
    const totalSupply = await musicDAOProxy.totalSupply();
    expect(totalSupply.toString()).to.equal(TOTAL_SUPPLY_STRING);
  });

  it("sends the total supply to the deployer account when intialized.", async function () {
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await musicDAOProxy.balanceOf(deployer.address);
    expect(deployerBalance.toString()).to.equal(TOTAL_SUPPLY_STRING);
  });

  it("approves another address to make transfers.", async function () {
    const [deployer, alice] = await ethers.getSigners();
    musicDAOProxy.approve(alice.address, 1000);
    const allowance = (
      await musicDAOProxy.allowance(deployer.address, alice.address)
    ).toNumber();
    expect(allowance).to.be.equal(1000);
  });

  it("allows deployer to send balance.", async function () {
    const [deployer, receiver] = await ethers.getSigners();

    const amountToSend = "5";

    musicDAOProxy.transfer(receiver.address, amountToSend);
    const receiverBalance = await musicDAOProxy.balanceOf(receiver.address);
    const deployerBalance = await musicDAOProxy.balanceOf(deployer.address);
    const newTotalSupply = TOTAL_SUPPLY_BIGNUM.sub(amountToSend).toString();

    expect(receiverBalance.toString()).to.equal(amountToSend);
    expect(deployerBalance.toString()).to.equal(newTotalSupply);
  });

  it("allows deployer to mint new tokens.", async function () {
    const [deployer, receiver] = await ethers.getSigners();

    const amount = 5000;
    musicDAOProxy.mint(receiver.address, amount);

    const receiverBalance = (
      await musicDAOProxy.balanceOf(receiver.address)
    ).toString();
    const newTotalSupply = (await musicDAOProxy.totalSupply()).toString();

    expect(receiverBalance).to.equal(amount.toString());
    expect(newTotalSupply).to.equal(TOTAL_SUPPLY_BIGNUM.add(amount).toString());
  });

  it("prevents another address to make transfers beyond allowance.", async function () {
    const [deployer, alice, carl] = await ethers.getSigners();
    await musicDAOProxy.transfer(alice.address, 1000);
    await musicDAOProxy.approve(alice.address, 1000);
    const receipt = musicDAOProxy
      .connect(alice)
      .transferFrom(deployer.address, carl.address, 1001);
    await expect(receipt).to.be.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );
  });

  it("pauses.", async function () {
    const [deployer, alice] = await ethers.getSigners();
    musicDAOProxy.pause();
    await expect(musicDAOProxy.transfer(alice.address, 1)).to.be.revertedWith(
      "ERC20Pausable: token transfer while paused"
    );
    expect(await musicDAOProxy.paused()).to.be.true;
  });

  it("unpauses.", async function () {
    await musicDAOProxy.pause();
    await musicDAOProxy.unpause();
    expect(await musicDAOProxy.paused()).to.be.false;
  });
});
