import BigNumber from 'bignumber.js';
import { APPROVAL_AMOUNT_LENDING_POOL, oneUsd, ZERO_ADDRESS } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { makeSuite } from './helpers/make-suite';
import { RateMode } from '../../helpers/types';
import { printUserAccountData, ETHfromWei, printDivider } from './helpers/utils/helpers';
import { DRE, impersonateAccountsHardhat } from '../../helpers/misc-utils';
import { getMockyvWFTM } from '../../helpers/contracts-getters';

const chai = require('chai');
const { expect } = chai;

makeSuite('Deposit FTM as collatoral and other as for pool liquidity supplier ', (testEnv) => {
  it('User1 deposits USDC, User deposits FTM as collatoral and borrows USDC', async () => {
    const { usdc, users, pool, deployer, yearnVault, oracle, WFTM } = testEnv;
    const ethers = (DRE as any).ethers;
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const depositUSDC = '7000';
    //Make some test USDC for depositor
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
    await usdc.connect(deployer.signer).transfer(depositor.address, amountUSDCtoDeposit);

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Supplier  deposits 7000 USDC
    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

    const supplierGlobalData = await pool.getUserAccountData(depositor.address);
    printUserAccountData({
      user: `Supplier ${depositor.address}`,
      action: 'deposited',
      amount: depositUSDC,
      coin: 'USDC',
      unit: 'USD',
      ...supplierGlobalData,
    });

    //user 2 deposits 1000 FTM
    const amountFTMtoDeposit = ethers.utils.parseEther('1000');
    await yearnVault
      .connect(borrower.signer)
      .depositCollateral(ZERO_ADDRESS, 0, { value: amountFTMtoDeposit });
    {
      const supplierGlobalData = await pool.getUserAccountData(borrower.address);
      printUserAccountData({
        user: `Borrower ${borrower.address}`,
        action: 'deposited',
        amount: ETHfromWei(amountFTMtoDeposit),
        coin: 'WFTM',
        unit: 'USD',
        ...supplierGlobalData,
      });
    }

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'borrowed',
      amount: amountUSDCToBorrow,
      coin: 'USDC',
      unit: 'USD',
      ...userGlobalDataAfter,
    });

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '7500',
      'Invalid liquidation threshold'
    );
  });
});

makeSuite('Deposit FTM as collatoral and other as for pool liquidity supplier ', (testEnv) => {
  it('User1 deposits USDT, User deposits FTM as collatoral and borrows USDT', async () => {
    const { usdt, users, pool, deployer, yearnVault, oracle } = testEnv;
    const ethers = (DRE as any).ethers;
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const depositUSDT = '3500';
    //Make some test USDT for depositor
    const amountUSDTtoDeposit = await convertToCurrencyDecimals(usdt.address, depositUSDT);
    await usdt.connect(deployer.signer).transfer(depositor.address, amountUSDTtoDeposit);

    //approve protocol to access depositor wallet
    await usdt.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Supplier  deposits 3500 USDT
    await pool
      .connect(depositor.signer)
      .deposit(usdt.address, amountUSDTtoDeposit, depositor.address, '0');

    const supplierGlobalData = await pool.getUserAccountData(depositor.address);
    printUserAccountData({
      user: `Supplier ${depositor.address}`,
      action: 'deposited',
      amount: depositUSDT,
      coin: 'USDT',
      unit: 'USD',
      ...supplierGlobalData,
    });

    //user 2 deposits 1000 FTM
    const amountFTMtoDeposit = ethers.utils.parseEther('1000');
    await yearnVault
      .connect(borrower.signer)
      .depositCollateral(ZERO_ADDRESS, 0, { value: amountFTMtoDeposit });
    {
      const supplierGlobalData = await pool.getUserAccountData(borrower.address);
      printUserAccountData({
        user: `Borrower ${borrower.address}`,
        action: 'deposited',
        amount: ETHfromWei(amountFTMtoDeposit),
        coin: 'WFTM',
        unit: 'USD',
        ...supplierGlobalData,
      });
    }

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const usdtPrice = await oracle.getAssetPrice(usdt.address);

    const amountUSDTToBorrow = await convertToCurrencyDecimals(
      usdt.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdtPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdt.address, amountUSDTToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'borrowed',
      amount: amountUSDTToBorrow,
      coin: 'USDT',
      unit: 'USD',
      ...userGlobalDataAfter,
    });

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '7500',
      'Invalid liquidation threshold'
    );
  });
});

makeSuite('Deposit WFTM as collatoral and other as for pool liquidity supplier ', (testEnv) => {
  it('User1 deposits USDC, User deposits FTM as collatoral and borrows USDC', async () => {
    const { usdc, users, pool, yearnVault, deployer, yvwftm, oracle, WFTM } = testEnv;
    const ethers = (DRE as any).ethers;
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const depositUSDC = '7000';
    //Make some test USDC for depositor
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
    await usdc.connect(deployer.signer).transfer(depositor.address, amountUSDCtoDeposit);

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Supplier  deposits 7000 USDC
    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

    const supplierGlobalData = await pool.getUserAccountData(depositor.address);
    printUserAccountData({
      user: `Supplier ${depositor.address}`,
      action: 'deposited',
      amount: depositUSDC,
      coin: 'USDC',
      unit: 'USD',
      ...supplierGlobalData,
    });

    // user 2 deposits 1000 FTM
    const WFTMOwnerAddress = '0xde080FdB13F273dbE1183deB59025B2BC4250a23';
    const depositWFTM = '1000';
    const depositWFTMAmount = await convertToCurrencyDecimals(WFTM.address, depositWFTM);
    //Make some test WFTM for borrower
    await impersonateAccountsHardhat([WFTMOwnerAddress]);
    let signer = await ethers.provider.getSigner(WFTMOwnerAddress);

    //transfer to borrower
    await WFTM.connect(signer).transfer(borrower.address, depositWFTMAmount);

    //approve protocol to access borrower wallet
    await WFTM.connect(borrower.signer).approve(yearnVault.address, APPROVAL_AMOUNT_LENDING_POOL);

    // deposit collateral to borrow
    await yearnVault.connect(borrower.signer).depositCollateral(WFTM.address, depositWFTMAmount);
    {
      const supplierGlobalData = await pool.getUserAccountData(borrower.address);
      printUserAccountData({
        user: `Borrower ${borrower.address}`,
        action: 'deposited',
        amount: ETHfromWei(depositWFTMAmount),
        coin: 'WFTM',
        unit: 'USD',
        ...supplierGlobalData,
      });
    }

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'borrowed',
      amount: amountUSDCToBorrow,
      coin: 'USDC',
      unit: 'USD',
      ...userGlobalDataAfter,
    });

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '7500',
      'Invalid liquidation threshold'
    );
  });
});

makeSuite('borrow yvWFTM', (testEnv) => {
  it('Should revert if borrow yvWFTM. User1 deposits yvWFTM, User2 deposits FTM as collatoral and borrows yvWFTM', async () => {
    const { yvwftm, WFTM, users, pool, yearnVault, oracle } = testEnv;
    const ethers = (DRE as any).ethers;
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const WFTMOwnerAddress = '0xde080FdB13F273dbE1183deB59025B2BC4250a23';
    const deposityvWFTM = '1000';
    const deposityvWFTMAmount = await convertToCurrencyDecimals(yvwftm.address, deposityvWFTM);

    await impersonateAccountsHardhat([WFTMOwnerAddress]);
    let signer = await ethers.provider.getSigner(WFTMOwnerAddress);
    await WFTM.connect(signer).transfer(depositor.address, deposityvWFTMAmount);
    await WFTM.connect(depositor.signer).approve(yvwftm.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Make some test WFTM for depositor
    const yvwftmContract = await getMockyvWFTM(yvwftm.address);
    yvwftmContract.connect(depositor.signer).deposit(deposityvWFTMAmount, depositor.address)

    //approve protocol to access depositor wallet
    await yvwftm.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await expect(
      pool
        .connect(depositor.signer)
        .deposit(yvwftm.address, deposityvWFTMAmount, depositor.address, '0')
    ).to.be.reverted;

    //Make 1000ETH deposit for collatoral
    await yearnVault
      .connect(borrower.signer)
      .depositCollateral(ZERO_ADDRESS, 0, { value: ethers.utils.parseEther('1000') });

    const borrowerGlobalData = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'deposits',
      amount: 1000,
      coin: 'FTM',
      unit: 'USD',
      ...borrowerGlobalData,
    });
    //user 2 borrows

    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const FTMPrice = await oracle.getAssetPrice(yvwftm.address);

    const amountyvWFTMToBorrow = await convertToCurrencyDecimals(
      yvwftm.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(FTMPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );
    await expect(
      pool
        .connect(borrower.signer)
        .borrow(yvwftm.address, amountyvWFTMToBorrow, RateMode.Stable, '0', borrower.address)
    ).to.be.reverted;
  });
});
