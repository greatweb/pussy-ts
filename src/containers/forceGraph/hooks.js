import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
// import { useSubscription } from '@apollo/react-hooks';
import useQueueIpfsContent from 'src/hooks/useQueueIpfsContent';
import { PATTERN_CYBER } from 'src/utils/config';
import QUERY_GET_FOLLOWERS from './query';

const useGetDataGql = () => {
  const { fetchParticleDetailsDirect } = useQueueIpfsContent();
  const { data: dataGql, loading: loadingGql } = useQuery(QUERY_GET_FOLLOWERS);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!loadingGql && fetchParticleDetailsDirect) {
      if (dataGql !== null && dataGql.cyberlinks) {
        const { cyberlinks } = dataGql;

        cyberlinks.forEach(async (item) => {
          const addressResolve = fetchParticleDetailsDirect
            ? (await fetchParticleDetailsDirect(item.particle_to)).content
            : null;
          if (addressResolve && addressResolve.match(PATTERN_CYBER)) {
            setData((itemData) => [
              ...itemData,
              {
                to: addressResolve,
                subject: item.neuron,
                txhash: item.transaction_hash,
              },
            ]);
          }
        });
      }
    }
  }, [dataGql, loadingGql, fetchParticleDetailsDirect]);

  return { data };
};

export default useGetDataGql;
