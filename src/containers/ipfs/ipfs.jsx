import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pane, Tablist } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import { getRankGrade, getToLink, getFromLink } from '../../utils/search/utils';
import { TabBtn, Account } from '../../components';
import { formatNumber, coinDecimals } from '../../utils/utils';
import {
  DiscussionTab,
  CommunityTab,
  AnswersTab,
  ContentTab,
  OptimisationTab,
  MetaTab,
} from './tab';
import ActionBarContainer from '../Search/ActionBarContainer';
import useGetIpfsContent from './useGetIpfsContentHook';
import { AppContext } from '../../context';
import ComponentLoader from '../ipfsSettings/ipfsComponents/ipfsLoader';
import useIpfs from 'src/hooks/useIpfs';

const dateFormat = require('dateformat');

function Pill({ children, active, ...props }) {
  return (
    <Pane
      display="flex"
      fontSize="14px"
      borderRadius="20px"
      height="20px"
      paddingY="5px"
      paddingX="8px"
      alignItems="center"
      lineHeight="1"
      justifyContent="center"
      backgroundColor={active ? '#000' : '#36d6ae'}
      color={active ? '#36d6ae' : '#000'}
      {...props}
    >
      {children}
    </Pane>
  );
}

const search = async (client, hash, page) => {
  try {
    const responseSearchResults = await client.search(hash, page);
    console.log(`responseSearchResults`, responseSearchResults);
    return responseSearchResults.result || [];
  } catch (error) {
    return [];
  }
};

const reduceParticleArr = (data, query = '') => {
  return data.reduce(
    (obj, item) => ({
      ...obj,
      [item.particle]: {
        particle: item.particle,
        rank: coinDecimals(item.rank),
        grade: getRankGrade(coinDecimals(item.rank)),
        status: 'impossibleLoad',
        query,
        text: item.particle,
        content: false,
      },
    }),
    {}
  );
};

//TODO: Move to reusable components
const PaneWithPill = ({ caption, count, active }) => (
  <Pane display="flex" alignItems="center">
    <Pane>{caption}</Pane>
    {count > 0 && (
      <Pill marginLeft={5} active={active}>
        {formatNumber(count)}
      </Pill>
    )}
  </Pane>
);

function ContentIpfsCid(dataGetIpfsContent) {
  const loading = dataGetIpfsContent.loading;

  if (loading) {
    return (
      <div
        style={{
          //TODO: Avoid inline styles
          width: '100%',
          // height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '50px',
        }}
      >
        <ComponentLoader style={{ width: '100px', margin: '30px auto' }} />
        <div style={{ fontSize: '20px' }}>
          {dataGetIpfsContent.statusFetching}
        </div>
      </div>
    );
  }

  if (!loading && dataGetIpfsContent.status === 'impossibleLoad') {
    return (
      <div
        style={{
          width: '100%',
          // height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '50px',
        }}
      >
        <div style={{ fontSize: '20px' }}>impossible load content</div>
      </div>
    );
  }
}

function Ipfs({ mobile }) {
  const { jsCyber } = useContext(AppContext);
  const { cid, tab = 'discussion' } = useParams();
  const { node: nodeIpfs } = useIpfs();
  const dataGetIpfsContent = useGetIpfsContent(cid, nodeIpfs);

  const [content, setContent] = useState('');
  const [typeContent, setTypeContent] = useState('');
  const [communityData, setCommunityData] = useState({});
  const [gateway, setGateway] = useState(null);
  const [dataToLink, setDataToLink] = useState([]);
  const [dataFromLink, setDataFromLink] = useState([]);
  const [dataAnswers, setDataAnswers] = useState([]);
  const [dataBacklinks, setDataBacklinks] = useState([]);
  const [page, setPage] = useState(0);
  const [allPage, setAllPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [creator, setCreator] = useState({
    address: '',
    timestamp: '',
  });
  const [metaData, setMetaData] = useState({
    type: 'file',
    size: 0,
    blockSizes: [],
    data: '',
  });

  useEffect(() => {
    setContent(dataGetIpfsContent.content);
    setTypeContent(dataGetIpfsContent.typeContent);
    setGateway(dataGetIpfsContent.gateway);
    setMetaData(dataGetIpfsContent.metaData);
  }, [dataGetIpfsContent]);

  useEffect(() => {
    if (jsCyber !== null) {
      getLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid, jsCyber]);

  useEffect(() => {
    const feachBacklinks = async () => {
      setDataBacklinks([]);
      if (jsCyber !== null) {
        const responseBacklinks = await jsCyber.backlinks(cid);
        // console.log(`responseBacklinks`, responseBacklinks)
        if (
          responseBacklinks.result &&
          Object.keys(responseBacklinks.result).length > 0
        ) {
          const { result } = responseBacklinks;
          const reduceArr = reduceParticleArr(result, cid);
          setDataBacklinks(reduceArr);
        }
      }
    };
    feachBacklinks();
  }, [cid, jsCyber]);

  const getLinks = () => {
    feacDataSearch();
    feachCidTo();
    feachCidFrom();
  };

  const feacDataSearch = async () => {
    setDataAnswers([]);
    setAllPage(0);
    setPage(0);
    setTotal(0);
    const responseSearch = await search(jsCyber, cid, 0);
    if (responseSearch.result && responseSearch.result.length > 0) {
      setDataAnswers(reduceParticleArr(responseSearch.result, cid));
      setAllPage(Math.ceil(parseFloat(responseSearch.pagination.total) / 10));
      setTotal(parseFloat(responseSearch.pagination.total));
      setPage((item) => item + 1);
    }
  };

  const fetchMoreData = async () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    const data = await search(jsCyber, cid, page);
    // console.log(`data`, data)
    if (data.result) {
      const result = reduceParticleArr(data.result, cid);
      setTimeout(() => {
        setDataAnswers((itemState) => ({ ...itemState, ...result }));
        setPage((itemPage) => itemPage + 1);
      }, 500);
    }
  };

  const feachCidTo = async () => {
    const response = await getToLink(cid);
    console.log(`response`, response);
    if (response !== null && response.txs && response.txs.length > 0) {
      // console.log('response To :>> ', response);
      setDataToLink(response.txs.reverse());
    }
  };

  const feachCidFrom = async () => {
    const response = await getFromLink(cid);
    if (response !== null && response.txs && response.txs.length > 0) {
      let addressCreator = '';
      if (response.txs[0].tx.value.msg[0].value.neuron) {
        addressCreator = response.txs[0].tx.value.msg[0].value.neuron;
      }
      if (response.txs[0].tx.value.msg[0].value.sender) {
        addressCreator = response.txs[0].tx.value.msg[0].value.sender;
      }
      const timeCreate = response.txs[0].timestamp;
      setCreator({
        address: addressCreator,
        timestamp: timeCreate,
      });
      const responseDataFromLink = response.txs.slice();
      responseDataFromLink.reverse();
      // console.log('responseDataFromLink :>> ', responseDataFromLink);
      setDataFromLink(responseDataFromLink);
    }
  };

  useEffect(() => {
    let dataTemp = {};
    const tempArr = [...dataToLink, ...dataFromLink];
    if (tempArr.length > 0) {
      tempArr.forEach((item) => {
        const subject = item.tx.value.msg[0].value.neuron;
        if (dataTemp[subject]) {
          dataTemp[subject].amount += 1;
        } else {
          dataTemp = {
            ...dataTemp,
            [subject]: {
              amount: 1,
            },
          };
        }
      });
      setCommunityData(dataTemp);
    }
  }, [dataToLink, dataFromLink]);

  return (
    <>
      <main className="block-body">
        {content.length ? (
          <ContentIpfsCid dataGetIpfsContent={dataGetIpfsContent} />
        ) : (
          <ContentTab
            typeContent={typeContent}
            gateway={gateway}
            content={content}
            cid={cid}
          />
        )}
        <Tablist
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(110px, 1fr))"
          gridGap="10px"
          marginTop={25}
          marginBottom={tab !== 'meta' ? 25 : 0}
          width="62%"
          marginX="auto"
        >
          <TabBtn
            text={
              <PaneWithPill
                caption="answers"
                count={dataAnswers.length}
                active={tab === 'answers'}
              />
            }
            isSelected={tab === 'answers'}
            to={`/ipfs/${cid}/answers`}
          />
          <TabBtn
            text={
              <PaneWithPill
                caption="discussion"
                count={dataToLink.length}
                active={tab === 'discussion'}
              />
            }
            isSelected={tab === 'discussion'}
            to={`/ipfs/${cid}`}
          />
          <TabBtn
            text="meta"
            isSelected={tab === 'meta'}
            to={`/ipfs/${cid}/meta`}
          />
        </Tablist>
        <Pane
          width="90%"
          marginX="auto"
          marginY={0}
          display="flex"
          flexDirection="column"
        >
          {tab === 'discussion' && (
            <DiscussionTab data={dataToLink} mobile={mobile} />
          )}
          {tab === 'answers' && (
            <AnswersTab
              data={dataAnswers}
              mobile={mobile}
              fetchMoreData={fetchMoreData}
              page={page}
              allPage={allPage}
              total={total}
            />
          )}
          {tab === 'meta' && (
            <>
              <Pane width="60%" marginX="auto" marginTop="25px" fontSize="18px">
                Creator
              </Pane>
              <Pane
                alignItems="center"
                width="60%"
                marginX="auto"
                justifyContent="center"
                display="flex"
                flexDirection="column"
              >
                <Link to={`/network/bostrom/contract/${creator.address}`}>
                  <Pane
                    alignItems="center"
                    marginX="auto"
                    justifyContent="center"
                    display="flex"
                  >
                    <Account
                      styleUser={{ flexDirection: 'column' }}
                      sizeAvatar="80px"
                      avatar
                      address={creator.address}
                    />
                  </Pane>
                </Link>
                {creator.timestamp.length > 0 && (
                  <Pane>
                    {dateFormat(creator.timestamp, 'dd/mm/yyyy, HH:MM:ss')}
                  </Pane>
                )}
              </Pane>
              <CommunityTab data={communityData} />
              <Pane
                width="60%"
                marginX="auto"
                marginBottom="15px"
                fontSize="18px"
              >
                Backlinks
              </Pane>
              <OptimisationTab data={dataBacklinks} mobile={mobile} />
              <Pane width="60%" marginX="auto" fontSize="18px">
                Meta
              </Pane>
              <MetaTab cid={cid} data={metaData} />
            </>
          )}
        </Pane>
      </main>
      {!mobile && (tab === 'discussion' || tab === 'answers') && (
        <ActionBarContainer
          placeholder={
            tab == 'answers' ? 'add keywords, hash or file' : 'add message'
          }
          textBtn={tab == 'answers' ? 'add answer' : 'Comment'}
          keywordHash={cid}
          update={() => getLinks()}
        />
      )}
    </>
  );
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
  };
};

export default connect(mapStateToProps)(Ipfs);
