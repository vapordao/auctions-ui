/** @jsx jsx */

import React, { useState } from 'react';
import {
  Heading,
  Text,
  jsx,
  Button,
  Grid,
  Box,
  Styled,
  Label,
  Input,
  Flex
} from 'theme-ui';
import BigNumber from 'bignumber.js';
import { getValueOrDefault } from '../utils';
import useAuctionActions from '../hooks/useAuctionActions';
import Moment from 'react-moment';
import EventsList from './AuctionEventsList';

const AuctionEvent = ({ type, ilk, lot, currentBid, bid, timestamp }) => {
  const fields = [
    ['Event Type', type],
    ['Collateral Type', ilk],
    ['Lot Size', lot],
    ['Current Bid Value', currentBid],
    ['Bid Value', bid],
    ['Time', timestamp]
  ];
  return (
    <Grid
      gap={2}
      columns={[2, 4, 6]}
      sx={{
        bg: 'background',
        p: 5,
        borderRadius: 5
      }}
    >
      {fields.map(([title, value]) => {
        return (
          <Box key={title}>
            <Text
              variant="caps"
              sx={{
                fontSize: '10px',
                mb: 2
              }}
            >
              {title}
            </Text>
            <Text
              sx={{
                fontSize: 1
              }}
            >
              {value}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
};

const byTimestamp = (prev, next) => {
  const nextTs = new Date(next.timestamp).getTime();
  const prevTs = new Date(prev.timestamp).getTime();

  if (nextTs > prevTs) return 1;
  if (nextTs < prevTs) return -1;
  if (nextTs === prevTs) {
    if (next.type === 'Tend') return 1;
    if (next.type === 'Kick') return -1;
  }
  return 0;
};

export default ({ webConnected, auction: auctionEvents, auctionId, lot }) => {
  const [state, setState] = useState({ amount: undefined, error: undefined });
  const { callTend } = useAuctionActions();

  const maxBid = new BigNumber(0); // This should be taken from somewhere?

  const handleBidAmountInput = event => {
    const value = event.target.value;
    const state = { amount: undefined, error: undefined };

    if (value) {
      state.amount = new BigNumber(value);

      if (state.amount.lt(maxBid)) {
        state.error = 'Your bid is too low, you will need to increase.';
      }
    }

    setState(state);
  };

  const handleTendCTA = event => {
    const bidAmount = state.amount;
    callTend(auctionId, lot, bidAmount);
  };

  const bidDisabled = state.error || !state.amount;

  const tab = auctionEvents
    .sort(byTimestamp).map(a => a.tab).filter(Boolean);


    const handleTendTabCTA = event => {
      const bidAmount = state.amount;
      callTend(auctionId, lot, ParseFloat(tab[0]));
    };
  
  return (
    <Grid
      gap={5}
      sx={{
        bg: '#fff',
        p: 6,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'border'
      }}
    >
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between'
        }}
      >
        <Heading as="h5" variant="h2">
          Auction ID: {auctionId}
        </Heading>
        {/* <Heading
          as="h5"
          variant="h2"
          sx={{
            pt: [2, 0]
          }}
        >
          Time remaining: 1h 20m 20s
        </Heading> */}
      </Flex>
      <EventsList
        events={auctionEvents
          .sort(byTimestamp)
          .map(({ type, lot, bid, timestamp, ilk }, index) => {
            return (
              <AuctionEvent
                key={`${timestamp}-${index}`}
                type={type}
                ilk={ilk.split('-')[0]}
                lot={new BigNumber(getValueOrDefault(lot)).toFormat(5, 4)}
                bid={new BigNumber(getValueOrDefault(bid)).toFormat(5, 4)}
                currentBid={`${new BigNumber(getValueOrDefault(bid))
                  .div(new BigNumber(getValueOrDefault(lot)))
                  .toFormat(5, 4)} DAI`}
                timestamp={
                  <Text title={new Date(timestamp)}>
                    <Moment fromNow ago>
                      {timestamp}
                    </Moment>{' '}
                    ago
                  </Text>
                }
              />
            );
          })}
      />
      <Grid gap={2}>
        <Text variant="boldBody">Enter your bid for this Auction</Text>
        <Flex
          sx={{
            flexDirection: ['column', 'row']
          }}
        >
          <Flex
            sx={{
              maxWidth: ['100%', '224px'],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'border',
              borderRadius: 5,
              fontSize: 4,
              // lineHeight: '24px',
              py: 3,
              px: 5
            }}
          >
            <Input
              sx={{
                border: 'none',
                outline: 'none',
                p: 0,
                marginRight: '2',
                borderRadius: 5
              }}
              id="big-amount"
              type="number"
              step="0.01"
              placeholder="0"
              onChange={handleBidAmountInput}
            />
            <Label sx={{ p: 0, width: 'auto' }} htmlFor="bid-amount">
              DAI
            </Label>
          </Flex>
          <Button
            sx={{ ml: [0, 2], mt: [2, 0] }}
            variant="primary"
            disabled={bidDisabled}
            onClick={handleTendCTA}
          >
            Bid Now
          </Button>
          {tab ?
          <Button
            sx={{ ml: [0, 2], mt: [2, 0] }}
            variant="primary"
            disabled={bidDisabled}
            onClick={handleTendTabCTA}
          >
            Bid Tab Amount
          </Button>
: null}
        </Flex>
        {state.error && <Text variant="smallDanger">{state.error} </Text>}
        {/* <Text variant="small">Price 1 MKR = 300 DAI</Text> */}
      </Grid>
    </Grid>
  );
};
