// test/MusicDAO.proxy.js
// Load dependencies
const { expect } = require("chai");

let MusicDAO;
let musicDAO;
const TOTAL_SUPPLY = ethers.BigNumber.from("1" + "0".repeat(27)); // 1 billion

// Start test block
describe("MusicDAO (proxy)", function () {
  beforeEach(async function () {
    MusicDAO = await ethers.getContractFactory("MusicDAO");
    musicDAOProxy = await upgrades.deployProxy(MusicDAO, [], {
      initializer: "initialize",
    });
  });

  it("is named MusicDAO.", async function () {
    expect(await musicDAOProxy.name()).to.equal("MusicDAO");
  });

  it('has the symbol "SOUND".', async function () {
    expect(await musicDAOProxy.symbol()).to.equal("SOUND");
  });

  it(`has a total cap of ${TOTAL_SUPPLY} SOUND.`, async function () {
    const totalSupply = await musicDAOProxy.totalSupply();
    expect(totalSupply).to.equal(TOTAL_SUPPLY);
  });
});
