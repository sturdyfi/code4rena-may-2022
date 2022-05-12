import { task } from 'hardhat/config';
import { ConfigNames } from '../../helpers/configuration';
import { deployLiquidator, deployTempLiquidator } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider } from '../../helpers/contracts-getters';

const CONTRACT_NAME = 'Liquidator';

task(`full:deploy-liquidator`, `Deploys the ${CONTRACT_NAME} contract`)
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
  .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    const addressesProvider = await getLendingPoolAddressesProvider();
    const liquidator =
      pool == ConfigNames.Fantom
        ? await deployTempLiquidator([addressesProvider.address], verify)
        : await deployLiquidator([addressesProvider.address], pool, verify);

    console.log(`${CONTRACT_NAME}.address`, liquidator.address);
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
  });
