import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';

import { coin, coins } from '@cosmjs/launchpad';
import {
  SigningCyberClient,
  SigningCyberClientOptions,
} from '@cybercongress/cyber-js';
import { Tablist, Pane } from '@cybercongress/gravity';
import { AppContext } from '../../context';
import { CYBER } from '../../utils/config';
import { trimString, formatNumber, reduceBalances } from '../../utils/utils';
import { Btn } from './ui';
import Convert from './convert';
import { getPinsCid } from '../../utils/search/utils';
import Denom from '../../components/denom';

// const token = Buffer.from(`anonymas:mouse123west`, 'utf8').toString('base64');
const token = 'anonymas:mouse123west';

const headers = {
  authorization: `Basic YW5vbnltYXM6bW91c2UxMjN3ZXN0`,
};

const bootTocyb =
  'pool5D83035BE0E7AB904379161D3C52FB4C1C392265AC19CE39A864146198610628';
const milliampere = 'milliampere';

function TestKeplr() {
  const { jsCyber } = useContext(AppContext);
  const [totalSupply, setTotalSupply] = useState(null);

  useEffect(() => {
    const feachData = async () => {
      if (jsCyber !== null) {
        const responseTotalSupply = await jsCyber.totalSupply();
        const datareduceTotalSupply = reduceBalances(responseTotalSupply);
        setTotalSupply(datareduceTotalSupply);
      }
    };
    feachData();
  }, [jsCyber]);

  console.log(`totalSupply`, totalSupply);

  return (
    <div>
      {totalSupply !== null &&
        Object.keys(totalSupply).map((key) => {
          return (
            <>
              <Denom denomValue={key} />
            </>
          );
        })}
    </div>
  );
}

export default TestKeplr;
