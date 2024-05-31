import { useQueryClient } from 'src/contexts/queryClient';

import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { CybernetContractQuery, queryCybernetContract } from '../api';
import { useCybernet } from './cybernet.context';

type Props = {
  query: CybernetContractQuery;
  contractAddress?: string;

  // combine to 1 object prop
  skip?: boolean;
  refetchInterval?: UseQueryOptions['refetchInterval'];
};

// TODO: copied from usePassportContract, reuse  core logic

function useQueryCybernetContract<DataType>({
  contractAddress,
  query,
  skip,
  refetchInterval,
}: Props) {
  const queryClient = useQueryClient();

  const { selectedContract } = useCybernet();

  const contractAddress2 = contractAddress || selectedContract?.address;

  const { refetch, data, error, isLoading } = useQuery<DataType>(
    ['queryCybernetContract', contractAddress2, query],
    () => {
      return queryCybernetContract(contractAddress2, query, queryClient!);
    },
    {
      // @ts-ignore
      refetchInterval,
      enabled: !skip && !!queryClient && !!contractAddress2,
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}

export default useQueryCybernetContract;
