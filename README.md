## In scope contracts

[GeneralVault](https://github.com/sturdyfi/code4rena-may-2022/blob/main/contracts/protocol/vault/GeneralVault.sol), [LidoVault](https://github.com/sturdyfi/code4rena-may-2022/blob/main/contracts/protocol/vault/ethereum/LidoVault.sol), [CollateralAdapter](https://github.com/sturdyfi/code4rena-may-2022/blob/main/contracts/protocol/lendingpool/CollateralAdapter.sol), [YieldManager](https://github.com/sturdyfi/code4rena-may-2022/blob/main/contracts/protocol/vault/YieldManager.sol), [ConvexCurveLPVault](https://github.com/sturdyfi/code4rena-may-2022/blob/main/contracts/protocol/vault/ethereum/ConvexVault/ConvexCurveLPVault.sol)

## Dev Environment
- EnvironmentFile (.env)
```
ALCHEMY_KEY="xxx"
```

- Compile
```
yarn compile
```

- Run the hardhat node on localhost.
```
FORK=main yarn hardhat node
```

- Next run the following task to deploy all smart contracts
```
yarn sturdy:evm:fork:mainnet:migration
```

- For test, run the following task to have a test of sample contract on the localhost.
```
yarn test
```
