/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import { Text, jsx, Box, Button, Grid, Card } from 'theme-ui';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from '../components/AccountManagerLayout';
import ActionTabs from './ActionTabs';
import MiniFormLayout from './MiniFormLayout';
import { formatBalance } from '../utils';
import ReactGA from 'react-ga';
import {
  AUCTION_DATA_FETCHER,
  MCD_FLIP_ETH_A,
  MCD_JOIN_DAI,
  MCD_FLOP
} from '../constants';

export default ({ allowances }) => {
  const { maker, web3Connected } = useMaker();
  let {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter,
    updateDaiBalances
  } = useBalances();

  daiBalance = formatBalance(daiBalance);
  vatDaiBalance = formatBalance(vatDaiBalance);
  mkrBalance = formatBalance(mkrBalance);

  const { hasDaiAllowance, giveDaiAllowance, hasHope, giveHope } = allowances;

  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => {
    if (web3Connected) {
      const joinDaiAdapterAddress = maker.service(AUCTION_DATA_FETCHER)
        .joinDaiAdapterAddress;
      setJoinAddress(joinDaiAdapterAddress);
    }
  }, [maker, web3Connected]);

  const allowanceMissing =
    !hasDaiAllowance || !hasHope[MCD_FLIP_ETH_A] || !hasHope[MCD_JOIN_DAI];

  const hasNoAllowances =
    !hasDaiAllowance && !hasHope[MCD_FLIP_ETH_A] && !hasHope[MCD_JOIN_DAI];

  return (
    <AccountManagerLayout
      topActions={
        <Grid>
          {!web3Connected ? (
            <Text as="h2" variant="boldBody">
              Connect your wallet to get started.
            </Text>
          ) : allowanceMissing ? (
            <Text as="h2" variant="boldBody">
              To participate in auctions you need to sign the approval
              transactions below and move Dai that will be used for bidding to
              the Vat.
            </Text>
          ) : null}
          <Grid
            gap={3}
            columns={[1, 3]}
            sx={{
              flexDirection: ['column', 'row'],
              justifyItems: 'start',
              mr: 'auto'
            }}
          ></Grid>
        </Grid>
      }
      balances={
        <Box>
          {web3Connected ? (
            <Grid
              gap={3}
              columns={[1, 3]}
              sx={{
                pt: 0,
                pb: 3
              }}
            >
              <BalanceOf
                type={'Dai in your Wallet'}
                balance={`${daiBalance} DAI`}
                shouldUnlock={!hasDaiAllowance}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI wallet balance - {daiBalance}
                      </Text>

                      <Button
                        variant="small"
                        onClick={() => giveDaiAllowance(joinAddress)}
                        disabled={!web3Connected}
                      >
                        {hasDaiAllowance
                          ? 'Dai Unlocked'
                          : 'Unlock Dai in your wallet'}
                      </Button>
                    </Grid>
                  </Card>
                }
              />
              <BalanceOf
                type={'Dai locked in the Vat '}
                balance={`${vatDaiBalance} DAI`}
                shouldUnlock={!hasHope[MCD_JOIN_DAI]}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI Adapter Balance - {vatDaiBalance}
                      </Text>
                      <Button
                        variant="small"
                        onClick={() => giveHope(joinAddress, MCD_JOIN_DAI)}
                        disabled={!web3Connected || hasHope[MCD_JOIN_DAI]}
                      >
                        Unlock Dai in the VAT
                      </Button>
                    </Grid>
                  </Card>
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'muted'
                }}
              />
              <BalanceOf
                type={'MKR in your wallet'}
                balance={`${mkrBalance} MKR`}
                shouldUnlock={!hasHope[MCD_FLOP]}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">Enable Debt Auctions</Text>
                      <Button
                        variant="small"
                        onClick={() => {
                          const flopAddress = maker
                            .service('smartContract')
                            .getContractByName('MCD_FLOP').address;
                          giveHope(flopAddress, MCD_FLOP);
                        }}
                        disabled={!web3Connected}
                      >
                        Unlock DAI in the Debt Auction
                      </Button>
                    </Grid>
                  </Card>
                }
              />
            </Grid>
          ) : null}
          {hasNoAllowances ? null : (
            <Card>
              <Grid>
                <ActionTabs
                  actions={[
                    [
                      'Deposit DAI into the VAT',
                      <Grid>
                        <Box
                          sx={{
                            bg: 'background',
                            p: 3,
                            borderRadius: 'medium'
                          }}
                        >
                          <MiniFormLayout
                            text={'Deposit DAI into the VAT'}
                            disabled={false}
                            inputUnit="DAI"
                            onSubmit={joinDaiToAdapter}
                            onTxFinished={() => {
                              ReactGA.event({
                                category: 'account',
                                action: 'deposited'
                                // label: maker.currentAddress()
                              });
                              updateDaiBalances();
                            }}
                            small={''}
                            actionText={'Deposit'}
                          />
                        </Box>
                      </Grid>
                    ],
                    [
                      'Withdraw DAI From VAT',
                      <Grid>
                        <Box
                          sx={{
                            bg: 'background',
                            p: 3,
                            borderRadius: 'medium'
                          }}
                        >
                          <MiniFormLayout
                            text={'Withdraw DAI from the VAT'}
                            disabled={false}
                            inputUnit="DAI"
                            onSubmit={exitDaiFromAdapter}
                            onTxFinished={() => {
                              ReactGA.event({
                                category: 'account',
                                action: 'withdraw'
                                // label: maker.currentAddress()
                              });
                              updateDaiBalances();
                            }}
                            small={''}
                            actionText={'Withdraw'}
                          />
                        </Box>
                      </Grid>
                    ]
                  ]}
                />
              </Grid>
            </Card>
          )}
        </Box>
      }
    />
  );
};
