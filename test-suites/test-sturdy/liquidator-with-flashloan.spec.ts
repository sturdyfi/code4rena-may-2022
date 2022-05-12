// /**
//  * @dev test for liquidation with flashloan contract
//  */

// import { expect } from 'chai';
// import { makeSuite, TestEnv } from './helpers/make-suite';
// import { ethers } from 'ethers';
// import { DRE, impersonateAccountsHardhat } from '../../helpers/misc-utils';
// import { convertToCurrencyDecimals, getEthersSigners } from '../../helpers/contracts-helpers';
// import { getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
// import BigNumber from 'bignumber.js';
// import { RateMode } from '../../helpers/types';
// import { APPROVAL_AMOUNT_LENDING_POOL } from '../../helpers/constants';

// const { parseEther } = ethers.utils;

// // should pass on block number 14610081 on forked ftm without deploy case
// makeSuite('Liquidator', (testEnv: TestEnv) => {
//   it('call liquidator for RETH_WSTETH_LP for yearn vault', async () => {
//     const {
//       liquidator,
//       deployer,
//       usdc,
//       RETH_WSTETH_LP,
//       yearnRETHWstETHVault,
//       pool,
//       oracle,
//       users,
//       yvreth_wsteth,
//     } = testEnv;
//     const ethers = (DRE as any).ethers;
//     const depositor = users[0];
//     const borrower = users[1];
//     const abiEncoder = new ethers.utils.AbiCoder();
//     const encodedData = abiEncoder.encode(
//       ['address', 'address'],
//       [RETH_WSTETH_LP.address, borrower.address]
//     );

//     // Make some test RETH_WSTETH_LP for depositor
//     const depositRETHWstETHAmount = await convertToCurrencyDecimals(RETH_WSTETH_LP.address, '10');
//     const rETHWstETHLPOwnerAddress = '0x427E51f03D287809ab684878AE2176BA347c8c25';
//     await impersonateAccountsHardhat([rETHWstETHLPOwnerAddress]);
//     let signer = await ethers.provider.getSigner(rETHWstETHLPOwnerAddress);
//     await RETH_WSTETH_LP.connect(signer).transfer(borrower.address, depositRETHWstETHAmount);

//     await RETH_WSTETH_LP.connect(borrower.signer).approve(
//       yearnRETHWstETHVault.address,
//       depositRETHWstETHAmount
//     );

//     await yearnRETHWstETHVault
//       .connect(borrower.signer)
//       .depositCollateral(RETH_WSTETH_LP.address, depositRETHWstETHAmount);

//     const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
//     const depositUSDC = '50000';
//     //Make some test USDC for depositor
//     await impersonateAccountsHardhat([usdcOwnerAddress]);
//     signer = await ethers.provider.getSigner(usdcOwnerAddress);
//     const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
//     await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

//     //approve protocol to access depositor wallet
//     await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

//     //Supplier  deposits 50000 USDC
//     await pool
//       .connect(depositor.signer)
//       .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

//     // borrow
//     const userGlobalData = await pool.getUserAccountData(borrower.address);
//     const usdcPrice = await oracle.getAssetPrice(usdc.address);

//     const amountUSDCToBorrow = await convertToCurrencyDecimals(
//       usdc.address,
//       new BigNumber(userGlobalData.availableBorrowsETH.toString())
//         .div(usdcPrice.toString())
//         .multipliedBy(0.95)
//         .toFixed(0)
//     );

//     await pool
//       .connect(borrower.signer)
//       .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

//     // set liquidation threshold 35%
//     const configurator = await getLendingPoolConfiguratorProxy();
//     await configurator.configureReserveAsCollateral(yvreth_wsteth.address, '3000', '3500', '10500');

//     // process liquidation by using flashloan contract
//     await liquidator.liquidation(
//       usdc.address,
//       await convertToCurrencyDecimals(usdc.address, '20000'),
//       encodedData
//     );

//     // withdraw remained usdc from flashloan contract
//     const beforeUsdcBalance = await usdc.balanceOf(deployer.address);
//     await liquidator.connect(deployer.signer).withdraw(usdc.address);
//     const usdcBalance = await usdc.balanceOf(deployer.address);
//     expect(
//       usdcBalance.sub(beforeUsdcBalance).gt(await convertToCurrencyDecimals(usdc.address, '0.03'))
//     ).to.eq(true);
//   });
// });

// // should pass on block number 14610081 on forked ftm without deploy case
// makeSuite('Liquidator', (testEnv: TestEnv) => {
//   it('call liquidator for RETH_WSTETH_LP for convex vault', async () => {
//     const {
//       liquidator,
//       deployer,
//       usdc,
//       RETH_WSTETH_LP,
//       convexRocketPoolETHVault,
//       pool,
//       oracle,
//       users,
//       cvxreth_wsteth,
//     } = testEnv;
//     const ethers = (DRE as any).ethers;
//     const depositor = users[0];
//     const borrower = users[1];
//     const abiEncoder = new ethers.utils.AbiCoder();
//     const encodedData = abiEncoder.encode(
//       ['address', 'address'],
//       [RETH_WSTETH_LP.address, borrower.address]
//     );

//     // Make some test RETH_WSTETH_LP for depositor
//     const depositRETHWstETHAmount = await convertToCurrencyDecimals(RETH_WSTETH_LP.address, '10');
//     const rETHWstETHLPOwnerAddress = '0x427E51f03D287809ab684878AE2176BA347c8c25';
//     await impersonateAccountsHardhat([rETHWstETHLPOwnerAddress]);
//     let signer = await ethers.provider.getSigner(rETHWstETHLPOwnerAddress);
//     await RETH_WSTETH_LP.connect(signer).transfer(borrower.address, depositRETHWstETHAmount);

//     await RETH_WSTETH_LP.connect(borrower.signer).approve(
//       convexRocketPoolETHVault.address,
//       depositRETHWstETHAmount
//     );

//     await convexRocketPoolETHVault
//       .connect(borrower.signer)
//       .depositCollateral(RETH_WSTETH_LP.address, depositRETHWstETHAmount);

//     const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
//     const depositUSDC = '50000';
//     //Make some test USDC for depositor
//     await impersonateAccountsHardhat([usdcOwnerAddress]);
//     signer = await ethers.provider.getSigner(usdcOwnerAddress);
//     const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
//     await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

//     //approve protocol to access depositor wallet
//     await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

//     //Supplier  deposits 50000 USDC
//     await pool
//       .connect(depositor.signer)
//       .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

//     // borrow
//     const userGlobalData = await pool.getUserAccountData(borrower.address);
//     const usdcPrice = await oracle.getAssetPrice(usdc.address);

//     const amountUSDCToBorrow = await convertToCurrencyDecimals(
//       usdc.address,
//       new BigNumber(userGlobalData.availableBorrowsETH.toString())
//         .div(usdcPrice.toString())
//         .multipliedBy(0.95)
//         .toFixed(0)
//     );

//     await pool
//       .connect(borrower.signer)
//       .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

//     // set liquidation threshold 35%
//     const configurator = await getLendingPoolConfiguratorProxy();
//     await configurator.configureReserveAsCollateral(
//       cvxreth_wsteth.address,
//       '3000',
//       '3500',
//       '10500'
//     );

//     // process liquidation by using flashloan contract
//     await liquidator.liquidation(
//       usdc.address,
//       await convertToCurrencyDecimals(usdc.address, '20000'),
//       encodedData
//     );

//     // withdraw remained usdc from flashloan contract
//     const beforeUsdcBalance = await usdc.balanceOf(deployer.address);
//     await liquidator.connect(deployer.signer).withdraw(usdc.address);
//     const usdcBalance = await usdc.balanceOf(deployer.address);
//     expect(
//       usdcBalance.sub(beforeUsdcBalance).gt(await convertToCurrencyDecimals(usdc.address, '0.03'))
//     ).to.eq(true);
//   });
// });

// // should pass on block number 14610081 on forked ftm without deploy case
// makeSuite('Liquidator', (testEnv: TestEnv) => {
//   it('call liquidator for FRAX3CRV for convex vault', async () => {
//     const {
//       liquidator,
//       deployer,
//       usdc,
//       FRAX_3CRV_LP,
//       convexFRAX3CRVVault,
//       pool,
//       oracle,
//       users,
//       cvxfrax_3crv,
//     } = testEnv;
//     const ethers = (DRE as any).ethers;
//     const depositor = users[0];
//     const borrower = users[1];
//     const abiEncoder = new ethers.utils.AbiCoder();
//     const encodedData = abiEncoder.encode(
//       ['address', 'address'],
//       [FRAX_3CRV_LP.address, borrower.address]
//     );

//     // Make some test FRAX_3CRV_LP for depositor
//     const depositLPAmount = await convertToCurrencyDecimals(FRAX_3CRV_LP.address, '3000');
//     const LPOwnerAddress = '0xabc508dda7517f195e416d77c822a4861961947a';
//     await impersonateAccountsHardhat([LPOwnerAddress]);
//     let signer = await ethers.provider.getSigner(LPOwnerAddress);
//     await FRAX_3CRV_LP.connect(signer).transfer(borrower.address, depositLPAmount);

//     await FRAX_3CRV_LP.connect(borrower.signer).approve(
//       convexFRAX3CRVVault.address,
//       depositLPAmount
//     );

//     await convexFRAX3CRVVault
//       .connect(borrower.signer)
//       .depositCollateral(FRAX_3CRV_LP.address, depositLPAmount);

//     const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
//     const depositUSDC = '50000';
//     //Make some test USDC for depositor
//     await impersonateAccountsHardhat([usdcOwnerAddress]);
//     signer = await ethers.provider.getSigner(usdcOwnerAddress);
//     const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
//     await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

//     //approve protocol to access depositor wallet
//     await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

//     //Supplier  deposits 50000 USDC
//     await pool
//       .connect(depositor.signer)
//       .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

//     // borrow
//     const userGlobalData = await pool.getUserAccountData(borrower.address);
//     const usdcPrice = await oracle.getAssetPrice(usdc.address);

//     const amountUSDCToBorrow = await convertToCurrencyDecimals(
//       usdc.address,
//       new BigNumber(userGlobalData.availableBorrowsETH.toString())
//         .div(usdcPrice.toString())
//         .multipliedBy(0.95)
//         .toFixed(0)
//     );

//     await pool
//       .connect(borrower.signer)
//       .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

//     // set liquidation threshold 35%
//     const configurator = await getLendingPoolConfiguratorProxy();
//     await configurator.configureReserveAsCollateral(cvxfrax_3crv.address, '3000', '3500', '10500');

//     // process liquidation by using flashloan contract
//     await liquidator.liquidation(
//       usdc.address,
//       await convertToCurrencyDecimals(usdc.address, '20000'),
//       encodedData
//     );

//     // withdraw remained usdc from flashloan contract
//     const beforeUsdcBalance = await usdc.balanceOf(deployer.address);
//     await liquidator.connect(deployer.signer).withdraw(usdc.address);
//     const usdcBalance = await usdc.balanceOf(deployer.address);
//     expect(
//       usdcBalance.sub(beforeUsdcBalance).gt(await convertToCurrencyDecimals(usdc.address, '0.03'))
//     ).to.eq(true);
//   });
// });

// // should pass on block number 14610081 on forked ftm without deploy case
// makeSuite('Liquidator', (testEnv: TestEnv) => {
//   it('call liquidator for STECRV for convex vault', async () => {
//     const {
//       liquidator,
//       deployer,
//       usdc,
//       STECRV_LP,
//       convexSTETHVault,
//       pool,
//       oracle,
//       users,
//       cvxstecrv,
//     } = testEnv;
//     const ethers = (DRE as any).ethers;
//     const depositor = users[0];
//     const borrower = users[1];
//     const abiEncoder = new ethers.utils.AbiCoder();
//     const encodedData = abiEncoder.encode(
//       ['address', 'address'],
//       [STECRV_LP.address, borrower.address]
//     );

//     // Make some test STECRV_LP for depositor
//     const depositLPAmount = await convertToCurrencyDecimals(STECRV_LP.address, '10');
//     const LPOwnerAddress = '0x4a03cbfd9bc2d3d1345adbf461f2dee03e64e9d3';
//     await impersonateAccountsHardhat([LPOwnerAddress]);
//     let signer = await ethers.provider.getSigner(LPOwnerAddress);
//     await STECRV_LP.connect(signer).transfer(borrower.address, depositLPAmount);

//     await STECRV_LP.connect(borrower.signer).approve(convexSTETHVault.address, depositLPAmount);

//     await convexSTETHVault
//       .connect(borrower.signer)
//       .depositCollateral(STECRV_LP.address, depositLPAmount);

//     const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
//     const depositUSDC = '50000';
//     //Make some test USDC for depositor
//     await impersonateAccountsHardhat([usdcOwnerAddress]);
//     signer = await ethers.provider.getSigner(usdcOwnerAddress);
//     const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
//     await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

//     //approve protocol to access depositor wallet
//     await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

//     //Supplier  deposits 50000 USDC
//     await pool
//       .connect(depositor.signer)
//       .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

//     // borrow
//     const userGlobalData = await pool.getUserAccountData(borrower.address);
//     const usdcPrice = await oracle.getAssetPrice(usdc.address);

//     const amountUSDCToBorrow = await convertToCurrencyDecimals(
//       usdc.address,
//       new BigNumber(userGlobalData.availableBorrowsETH.toString())
//         .div(usdcPrice.toString())
//         .multipliedBy(0.95)
//         .toFixed(0)
//     );

//     await pool
//       .connect(borrower.signer)
//       .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

//     // set liquidation threshold 35%
//     const configurator = await getLendingPoolConfiguratorProxy();
//     await configurator.configureReserveAsCollateral(cvxstecrv.address, '3000', '3500', '10500');

//     // process liquidation by using flashloan contract
//     await liquidator.liquidation(
//       usdc.address,
//       await convertToCurrencyDecimals(usdc.address, '20000'),
//       encodedData
//     );

//     // withdraw remained usdc from flashloan contract
//     const beforeUsdcBalance = await usdc.balanceOf(deployer.address);
//     await liquidator.connect(deployer.signer).withdraw(usdc.address);
//     const usdcBalance = await usdc.balanceOf(deployer.address);
//     expect(
//       usdcBalance.sub(beforeUsdcBalance).gt(await convertToCurrencyDecimals(usdc.address, '0.03'))
//     ).to.eq(true);
//   });
// });

// // should pass on block number 14643680 on forked ethereum mainnet without deploy case
// makeSuite('Liquidator', (testEnv: TestEnv) => {
//   it('call liquidator for DOLA3CRV for convex vault', async () => {
//     const {
//       liquidator,
//       deployer,
//       usdc,
//       DOLA_3CRV_LP,
//       convexDOLA3CRVVault,
//       pool,
//       oracle,
//       users,
//       cvxdola_3crv,
//     } = testEnv;
//     const ethers = (DRE as any).ethers;
//     const depositor = users[0];
//     const borrower = users[1];
//     const abiEncoder = new ethers.utils.AbiCoder();
//     const encodedData = abiEncoder.encode(
//       ['address', 'address'],
//       [DOLA_3CRV_LP.address, borrower.address]
//     );

//     // Make some test FRAX_3CRV_LP for depositor
//     const depositLPAmount = await convertToCurrencyDecimals(DOLA_3CRV_LP.address, '3000');
//     const LPOwnerAddress = '0x8ed90dc4ef3e52d89da57fff99e6ab53433f2d01';
//     await impersonateAccountsHardhat([LPOwnerAddress]);
//     let signer = await ethers.provider.getSigner(LPOwnerAddress);
//     await DOLA_3CRV_LP.connect(signer).transfer(borrower.address, depositLPAmount);

//     await DOLA_3CRV_LP.connect(borrower.signer).approve(
//       convexDOLA3CRVVault.address,
//       depositLPAmount
//     );

//     await convexDOLA3CRVVault
//       .connect(borrower.signer)
//       .depositCollateral(DOLA_3CRV_LP.address, depositLPAmount);

//     const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
//     const depositUSDC = '50000';
//     //Make some test USDC for depositor
//     await impersonateAccountsHardhat([usdcOwnerAddress]);
//     signer = await ethers.provider.getSigner(usdcOwnerAddress);
//     const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
//     await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

//     //approve protocol to access depositor wallet
//     await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

//     //Supplier  deposits 50000 USDC
//     await pool
//       .connect(depositor.signer)
//       .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0');

//     // borrow
//     const userGlobalData = await pool.getUserAccountData(borrower.address);
//     const usdcPrice = await oracle.getAssetPrice(usdc.address);
//     const lpPrice = await oracle.getAssetPrice(cvxdola_3crv.address);

//     const amountUSDCToBorrow = await convertToCurrencyDecimals(
//       usdc.address,
//       new BigNumber(userGlobalData.availableBorrowsETH.toString())
//         .div(usdcPrice.toString())
//         .multipliedBy(0.95)
//         .toFixed(0)
//     );

//     await pool
//       .connect(borrower.signer)
//       .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

//     // set liquidation threshold 35%
//     const configurator = await getLendingPoolConfiguratorProxy();
//     await configurator.configureReserveAsCollateral(cvxdola_3crv.address, '3000', '3500', '10500');

//     // process liquidation by using flashloan contract
//     await liquidator.liquidation(
//       usdc.address,
//       await convertToCurrencyDecimals(usdc.address, '20000'),
//       encodedData
//     );

//     // withdraw remained usdc from flashloan contract
//     const beforeUsdcBalance = await usdc.balanceOf(deployer.address);
//     await liquidator.connect(deployer.signer).withdraw(usdc.address);
//     const usdcBalance = await usdc.balanceOf(deployer.address);
//     expect(
//       usdcBalance.sub(beforeUsdcBalance).gt(await convertToCurrencyDecimals(usdc.address, '0.03'))
//     ).to.eq(true);
//   });
// });
