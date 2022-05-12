// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {SafeMath} from '../../dependencies/openzeppelin/contracts/SafeMath.sol';
import {IFlashLoanReceiver} from '../../flashloan/interfaces/IFlashLoanReceiver.sol';
import {VersionedInitializable} from '../../protocol/libraries/sturdy-upgradeability/VersionedInitializable.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {IAaveFlashLoan} from '../../interfaces/IAaveFlashLoan.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';
import {ICollateralAdapter} from '../../interfaces/ICollateralAdapter.sol';
import {Errors} from '../libraries/helpers/Errors.sol';
import {IGeneralVault} from '../../interfaces/IGeneralVault.sol';
import {TransferHelper} from '../libraries/helpers/TransferHelper.sol';
import {Ownable} from '../../dependencies/openzeppelin/contracts/Ownable.sol';

/**
 * @title Liquidator
 * @notice Liquidator
 * @author Sturdy
 **/

contract Liquidator is IFlashLoanReceiver, Ownable {
  using SafeMath for uint256;

  ILendingPoolAddressesProvider internal _addressesProvider;

  /**
   * @dev Function is invoked by the proxy contract when the Adapter contract is deployed.
   * @param _provider The address of the provider
   **/
  constructor(ILendingPoolAddressesProvider _provider) public {
    _addressesProvider = _provider;
  }

  function withdraw(address asset) external onlyOwner {
    uint256 amount = IERC20(asset).balanceOf(address(this));
    IERC20(asset).transfer(msg.sender, amount);
  }

  /**
   * This function is called after your contract has received the flash loaned amount
   * overriding executeOperation() in IFlashLoanReceiver
   */
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    // parse params
    (address collateralAddress, address borrowerAddress) = abi.decode(params, (address, address));

    // call liquidation
    IERC20(assets[0]).approve(_addressesProvider.getLendingPool(), amounts[0]);
    ILendingPool(_addressesProvider.getLendingPool()).liquidationCall(
      collateralAddress,
      assets[0],
      borrowerAddress,
      amounts[0],
      false
    );

    _convertCollateral(collateralAddress, assets[0]);

    // Approve the LendingPool contract allowance to *pull* the owed amount
    uint256 amountOwing = amounts[0].add(premiums[0]);
    IERC20(assets[0]).approve(_addressesProvider.getAddress('AAVE_LENDING_POOL'), amountOwing);

    return true;
  }

  function liquidation(
    address debtAsset,
    uint256 debtToCover,
    bytes calldata params
  ) external {
    IAaveFlashLoan AAVE_LENDING_POOL = IAaveFlashLoan(
      _addressesProvider.getAddress('AAVE_LENDING_POOL')
    );

    address[] memory assets = new address[](1);
    assets[0] = debtAsset;

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = debtToCover;

    // 0 means revert the transaction if not validated
    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    AAVE_LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(this), params, 0);
  }

  /**
   * Swap from collateralAsset to debtAsset
   */
  function _convertCollateral(address collateralAsset, address asset) internal {
    uint256 collateralAmount = IERC20(collateralAsset).balanceOf(address(this));
    ICollateralAdapter collateralAdapter = ICollateralAdapter(
      _addressesProvider.getAddress('COLLATERAL_ADAPTER')
    );
    address vault = collateralAdapter.getAcceptableVault(collateralAsset);
    require(vault != address(0), Errors.LP_LIQUIDATION_CONVERT_FAILED);

    // send collateral asset to vault
    TransferHelper.safeTransfer(collateralAsset, vault, collateralAmount);

    // convert collateral asset and receive swappable asset
    // IGeneralVault(vault).convertOnLiquidation(collateralAmount);

    // convert swappable asset to debt asset
  }
}
